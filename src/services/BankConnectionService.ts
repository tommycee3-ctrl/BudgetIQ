import { db } from "../database/db";
import { encryption } from "./EncryptionService";
import { simplefin, type SimpleFINAccount } from "./SimpleFINService";

export type SavedBankAccount = {
    id: number;
    connectionId: number;
    externalId: string;
    accountName: string;
    accountType: string | null;
    enabled: boolean;
};

export class BankConnectionService {

    async connectBank(
        userId: number,
        setupToken: string,
        friendlyName = "Connected Bank"
    ) {
        const accessUrl = await simplefin.claimSetupToken(setupToken);
        const accounts = await simplefin.fetchAccounts(accessUrl);

        const encryptedAccessUrl = encryption.encrypt(accessUrl);

        const connectionResult = db.prepare(`
            INSERT INTO bank_connections (
                user_id,
                provider,
                friendly_name,
                encrypted_access_url,
                enabled
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            userId,
            "simplefin",
            friendlyName,
            encryptedAccessUrl,
            1
        );

        const connectionId = Number(connectionResult.lastInsertRowid);

        this.saveAccounts(connectionId, accounts);

        return {
            connectionId,
            provider: "simplefin",
            friendlyName,
            accounts: this.getAccounts(connectionId)
        };
    }

    getConnections(userId: number) {
        return db.prepare(`
            SELECT
                id,
                provider,
                friendly_name AS friendlyName,
                last_sync AS lastSync,
                enabled,
                created_at AS createdAt
            FROM bank_connections
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).all(userId);
    }

    getAccounts(connectionId: number): SavedBankAccount[] {
        return db.prepare(`
            SELECT
                id,
                connection_id AS connectionId,
                external_id AS externalId,
                account_name AS accountName,
                account_type AS accountType,
                enabled
            FROM bank_accounts
            WHERE connection_id = ?
            ORDER BY account_name
        `).all(connectionId).map((row: any) => ({
            ...row,
            enabled: Boolean(row.enabled)
        }));
    }

    getDecryptedAccessUrl(connectionId: number): string {
        const row = db.prepare(`
            SELECT encrypted_access_url
            FROM bank_connections
            WHERE id = ?
              AND enabled = 1
        `).get(connectionId) as any;

        if (!row) {
            throw new Error("Bank connection not found.");
        }

        return encryption.decrypt(row.encrypted_access_url);
    }

    private saveAccounts(
        connectionId: number,
        accounts: SimpleFINAccount[]
    ) {
        const insert = db.prepare(`
            INSERT OR REPLACE INTO bank_accounts (
                connection_id,
                external_id,
                account_name,
                account_type,
                enabled
            )
            VALUES (?, ?, ?, ?, COALESCE(
                (SELECT enabled FROM bank_accounts WHERE external_id = ?),
                1
            ))
        `);

        const transaction = db.transaction(() => {
            for (const account of accounts) {
                insert.run(
                    connectionId,
                    account.id,
                    account.name || "Unnamed Account",
                    account.org?.name || null,
                    account.id
                );
            }
        });

        transaction();
    }

}

export const bankConnectionService = new BankConnectionService();