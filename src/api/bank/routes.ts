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
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.get("/user-accounts/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const accounts = db.prepare(`
      SELECT
        ba.id,
        ba.account_name AS accountName,
        ba.current_balance AS currentBalance,
        ba.available_balance AS availableBalance,
        ba.enabled,
        bc.display_name AS bankName
      FROM bank_accounts ba
      JOIN bank_connections bc ON bc.id = ba.connection_id
      WHERE bc.user_id = ?
      ORDER BY bc.display_name, ba.account_name
    `).all(userId).map((row: any) => ({
      ...row,
      enabled: Boolean(row.enabled)
    }));

    res.json({ ok: true, accounts });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.put("/accounts/:accountId/enabled", (req, res) => {
  try {
    const accountId = Number(req.params.accountId);
    const { enabled } = req.body;

    db.prepare(`
      UPDATE bank_accounts
      SET enabled = ?
      WHERE id = ?
    `).run(enabled ? 1 : 0, accountId);

    res.json({ ok: true });
  } catch (error: any) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.get("/accounts/:connectionId", (req, res) => {
  try {
    const connectionId = Number(req.params.connectionId);
    const accounts = bankConnectionService.getAccounts(connectionId);
    res.json({ ok: true, accounts });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.post("/sync/:connectionId", async (req, res) => {
  try {
    const connectionId = Number(req.params.connectionId);
    const result = await bankConnectionService.syncTransactions(connectionId);
    res.json({ ok: true, ...result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;
