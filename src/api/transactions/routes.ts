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
      INNER JOIN bank_accounts ba ON ba.id = t.account_id
      INNER JOIN bank_connections bc ON bc.id = ba.connection_id
      WHERE t.user_id = ?
        AND bc.user_id = ?
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT ?
    `).all(userId, userId, limit);

    res.json({ ok: true, transactions });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.put("/:id/category", (req, res) => {
  try {
    const id = Number(req.params.id);
    const { category, applyToMerchant } = req.body;

    const tx = db.prepare(`
      SELECT user_id, merchant, description
      FROM transactions
      WHERE id = ?
    `).get(id) as any;

    if (!tx) {
      return res.status(404).json({ ok: false, message: "Transaction not found." });
    }

    const merchantText = String(tx.merchant || tx.description || "").trim();

    if (applyToMerchant && merchantText) {
      db.prepare(`
        UPDATE transactions
        SET category = ?, reviewed = 1
        WHERE user_id = ?
          AND (
            LOWER(COALESCE(merchant, '')) LIKE ?
            OR LOWER(COALESCE(description, '')) LIKE ?
          )
      `).run(
        category,
        tx.user_id,
        "%" + merchantText.toLowerCase() + "%",
        "%" + merchantText.toLowerCase() + "%"
      );
    } else {
      db.prepare(`
        UPDATE transactions
        SET category = ?, reviewed = 1
        WHERE id = ?
      `).run(category, id);
    }

    res.json({ ok: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;
