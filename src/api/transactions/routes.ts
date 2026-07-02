import express from "express";
import { db } from "../../database/db";

const router = express.Router();

router.get("/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const limit = Number(req.query.limit ?? 100);

    const transactions = db.prepare(`
      SELECT
        t.id,
        t.transaction_date AS transactionDate,
        t.merchant,
        t.description,
        t.amount,
        t.category,
        t.pending,
        t.reviewed,
        ba.account_name AS accountName
      FROM transactions t
      LEFT JOIN bank_accounts ba ON ba.id = t.account_id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT ?
    `).all(userId, limit);

    res.json({ ok: true, transactions });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;