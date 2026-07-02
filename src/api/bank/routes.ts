import express from "express";
import { bankConnectionService } from "../../services/BankConnectionService";
import { db } from "../../database/db";

const router = express.Router();

router.get("/status/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const connections = bankConnectionService.getConnections(userId);
    res.json({ ok: true, connections });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.get("/user-accounts/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const rows = db.prepare(`
      SELECT
        bc.id AS connectionId,
        bc.display_name AS bankName,
        bc.provider,
        bc.last_sync AS lastSync,
        ba.id AS accountId,
        ba.account_name AS accountName,
        ba.current_balance AS currentBalance,
        ba.available_balance AS availableBalance,
        ba.enabled
      FROM bank_connections bc
      LEFT JOIN bank_accounts ba ON ba.connection_id = bc.id
      WHERE bc.user_id = ?
        AND bc.enabled = 1
        AND (ba.hidden = 0 OR ba.hidden IS NULL)
      ORDER BY bc.created_at DESC, ba.account_name
    `).all(userId) as any[];

    const connections = rows.reduce((acc: any[], row: any) => {
      let connection = acc.find(item => item.id === row.connectionId);

      if (!connection) {
        connection = {
          id: row.connectionId,
          bankName: row.bankName,
          provider: row.provider,
          lastSync: row.lastSync,
          accounts: []
        };
        acc.push(connection);
      }

      if (row.accountId) {
        connection.accounts.push({
          id: row.accountId,
          accountName: row.accountName,
          currentBalance: row.currentBalance,
          availableBalance: row.availableBalance,
          enabled: Boolean(row.enabled)
        });
      }

      return acc;
    }, []);

    res.json({ ok: true, connections });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.put("/connection-accounts/:connectionId", (req, res) => {
  try {
    const connectionId = Number(req.params.connectionId);
    const { accountIds } = req.body;

    if (!Array.isArray(accountIds)) {
      return res.status(400).json({ ok: false, message: "accountIds must be an array." });
    }

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE bank_accounts
        SET enabled = 0
        WHERE connection_id = ?
      `).run(connectionId);

      const enable = db.prepare(`
        UPDATE bank_accounts
        SET enabled = 1
        WHERE connection_id = ?
          AND id = ?
      `);

      for (const accountId of accountIds) {
        enable.run(connectionId, Number(accountId));
      }
    });

    tx();

    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.post("/connect", async (req, res) => {
  try {
    const { userId, setupToken, friendlyName } = req.body;

    if (!userId || !setupToken) {
      return res.status(400).json({ ok: false, message: "Missing required fields." });
    }

    const result = await bankConnectionService.connectBank(Number(userId), setupToken, friendlyName);
    res.json({ ok: true, ...result });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.post("/sync/:connectionId", async (req, res) => {
  try {
    const connectionId = Number(req.params.connectionId);
    const result = await bankConnectionService.syncTransactions(connectionId);
    res.json({ ok: true, ...result });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;

