import express from "express";
import { bankConnectionService } from "../../services/BankConnectionService";

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

router.post("/connect", async (req, res) => {
  try {
    const { userId, setupToken, friendlyName } = req.body;

    if (!userId || !setupToken) {
      return res.status(400).json({ ok: false, message: "Missing required fields." });
    }

    const result = await bankConnectionService.connectBank(
      Number(userId),
      setupToken,
      friendlyName
    );

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