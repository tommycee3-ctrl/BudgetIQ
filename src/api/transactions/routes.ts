import express from "express";
import { db } from "../../database/db";

const router = express.Router();

function getPayPeriod(userId: number) {
  return db.prepare(`
    SELECT last_payday AS lastPayday, next_payday AS nextPayday
    FROM paycheck_settings
    WHERE user_id = ?
  `).get(userId) as any;
}

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
        AND ba.enabled = 1
        AND bc.enabled = 1
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT ?
    `).all(userId, userId, limit);

    res.json({ ok: true, transactions });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.put("/:id/categorize", (req, res) => {
  try {
    const id = Number(req.params.id);
    const { category, applyToMerchant, billId } = req.body;

    const tx = db.prepare(`
      SELECT id, user_id, merchant, description, amount
      FROM transactions
      WHERE id = ?
    `).get(id) as any;

    if (!tx) return res.status(404).json({ ok: false, message: "Transaction not found." });

    const matchText = String(tx.merchant || tx.description || "").trim();

    db.prepare(`
      UPDATE transactions
      SET category = ?, reviewed = 1
      WHERE id = ?
    `).run(category, id);

    if (applyToMerchant && matchText && !billId) {
      db.prepare(`
        INSERT INTO transaction_category_rules (user_id, match_text, category)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, match_text) DO UPDATE SET category = excluded.category
      `).run(tx.user_id, matchText, category);
    }

    if (billId) {
      const period = getPayPeriod(tx.user_id);

      db.prepare(`
        UPDATE bills
        SET paid = 1,
            paid_transaction_id = ?
        WHERE id = ?
          AND user_id = ?
      `).run(id, Number(billId), tx.user_id);

      db.prepare(`
        INSERT INTO bill_payments (
          user_id, bill_id, transaction_id, pay_period_start, pay_period_end
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(bill_id, pay_period_start, pay_period_end)
        DO UPDATE SET transaction_id = excluded.transaction_id
      `).run(tx.user_id, Number(billId), id, period.lastPayday, period.nextPayday);

      if (applyToMerchant && matchText) {
        db.prepare(`
          INSERT INTO bill_match_rules (
            user_id,
            bill_id,
            match_text,
            expected_amount,
            amount_tolerance_percent
          )
          VALUES (?, ?, ?, ?, 20)
          ON CONFLICT(user_id, bill_id, match_text)
          DO UPDATE SET
            expected_amount = excluded.expected_amount,
            amount_tolerance_percent = excluded.amount_tolerance_percent
        `).run(
          tx.user_id,
          Number(billId),
          matchText,
          Math.abs(Number(tx.amount || 0))
        );
      }
    }

    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;
