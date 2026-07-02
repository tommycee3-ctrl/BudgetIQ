import { db } from "../database/db";
import { encryption } from "./EncryptionService";
import { simplefin, type SimpleFINAccount } from "./SimpleFINService";

export class BankConnectionService {
  async connectBank(userId: number, setupToken: string, displayName = "Connected Bank") {
    const accessUrl = await simplefin.claimSetupToken(setupToken);
    const accounts = await simplefin.fetchAccounts(accessUrl);
    const encryptedAccessUrl = encryption.encrypt(accessUrl);

    const result = db.prepare(`
      INSERT INTO bank_connections (user_id, provider, display_name, encrypted_access_url, enabled)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, "simplefin", displayName, encryptedAccessUrl, 1);

    const connectionId = Number(result.lastInsertRowid);
    this.saveAccounts(connectionId, accounts);

    return { connectionId, provider: "simplefin", displayName, accounts: this.getAccounts(connectionId) };
  }

  getConnections(userId: number) {
    return db.prepare(`
      SELECT id, provider, display_name AS displayName, last_sync AS lastSync, enabled, created_at AS createdAt
      FROM bank_connections
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);
  }

  getAccounts(connectionId: number) {
    return db.prepare(`
      SELECT id, connection_id AS connectionId, external_id AS externalId,
             account_name AS accountName, account_type AS accountType,
             current_balance AS currentBalance,
             available_balance AS availableBalance,
             currency,
             enabled
      FROM bank_accounts
      WHERE connection_id = ?
      ORDER BY account_name
    `).all(connectionId).map((row: any) => ({ ...row, enabled: Boolean(row.enabled) }));
  }

  async syncTransactions(connectionId: number, daysBack = 90) {
    const connection = db.prepare(`
      SELECT id, user_id, encrypted_access_url
      FROM bank_connections
      WHERE id = ? AND enabled = 1
    `).get(connectionId) as any;

    if (!connection) throw new Error("Bank connection not found.");

    const accessUrl = encryption.decrypt(connection.encrypted_access_url);
    const startDateUnix = Math.floor((Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000);

    const accounts = await simplefin.fetchTransactions(accessUrl, startDateUnix);

    this.saveAccounts(connectionId, accounts);

    let inserted = 0;
    let skipped = 0;

    const insertTransaction = db.prepare(`
      INSERT OR IGNORE INTO transactions (
        user_id, account_id, external_id, merchant, description, amount,
        category, transaction_date, pending, reviewed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const getAccount = db.prepare(`
      SELECT id FROM bank_accounts
      WHERE connection_id = ? AND external_id = ?
    `);

    const tx = db.transaction(() => {
      for (const account of accounts) {
        const localAccount = getAccount.get(connectionId, account.id) as any;
        if (!localAccount) continue;

        for (const item of account.transactions ?? []) {
          const postedDate = item.posted
            ? new Date(item.posted * 1000).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);

          const result = insertTransaction.run(
            connection.user_id,
            localAccount.id,
            item.id,
            item.payee ?? item.description ?? "Unknown",
            item.description ?? item.payee ?? "Unknown",
            Number(item.amount),
            "Uncategorized",
            postedDate,
            item.pending ? 1 : 0,
            0
          );

          if (result.changes > 0) inserted++;
          else skipped++;
        }
      }

      db.prepare(`
        UPDATE bank_connections
        SET last_sync = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(connectionId);
    });

    tx();

    return { inserted, skipped };
  }

  private saveAccounts(connectionId: number, accounts: SimpleFINAccount[]) {
    const existing = db.prepare(`
      SELECT id, enabled
      FROM bank_accounts
      WHERE connection_id = ?
        AND external_id = ?
    `);

    const insert = db.prepare(`
      INSERT INTO bank_accounts (
        connection_id,
        external_id,
        account_name,
        account_type,
        current_balance,
        available_balance,
        currency,
        last_seen_at,
        enabled
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
    `);

    const update = db.prepare(`
      UPDATE bank_accounts
      SET
        account_name = ?,
        account_type = ?,
        current_balance = ?,
        available_balance = ?,
        currency = ?,
        last_seen_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const tx = db.transaction(() => {
      for (const account of accounts) {
        const row = existing.get(connectionId, account.id) as any;

        if (row) {
          update.run(
            account.name ?? "Unnamed Account",
            account.org?.name ?? null,
            Number(account.balance ?? 0),
            Number(account.available_balance ?? account.balance ?? 0),
            account.currency ?? "USD",
            row.id
          );
        } else {
          insert.run(
            connectionId,
            account.id,
            account.name ?? "Unnamed Account",
            account.org?.name ?? null,
            Number(account.balance ?? 0),
            Number(account.available_balance ?? account.balance ?? 0),
            account.currency ?? "USD"
          );
        }
      }
    });

    tx();
  }
}

export const bankConnectionService = new BankConnectionService();

