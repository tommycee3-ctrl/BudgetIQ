import express from "express";
import { db } from "../../database/db";

const router = express.Router();

function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function isDueInPeriod(dueDay: number, start: Date, end: Date) {
  const year = end.getFullYear();
  const month = end.getMonth();
  const dueDate = new Date(year, month, dueDay);

  return dueDate > start && dueDate <= end;
}

router.get("/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const settings = db.prepare(`
      SELECT *
      FROM paycheck_settings
      WHERE user_id = ?
    `).get(userId) as any;

    const today = new Date();
    const lastPayday = settings ? new Date(settings.last_payday + "T00:00:00") : new Date("2026-06-26T00:00:00");
    const nextPayday = settings ? new Date(settings.next_payday + "T00:00:00") : new Date("2026-07-10T00:00:00");

    const accounts = db.prepare(`
      SELECT ba.*
      FROM bank_accounts ba
      JOIN bank_connections bc ON bc.id = ba.connection_id
      WHERE ba.enabled = 1
        AND bc.enabled = 1
        AND bc.user_id = ?
      ORDER BY ba.account_name
    `).all(userId) as any[];

    const checkingBalance = accounts.reduce((sum, a) => {
      const name = String(a.account_name || "").toLowerCase();
      const balance = Number(a.current_balance || 0);

      if (balance <= 0) return sum;

      if (
        name.includes("checking") ||
        name.includes("money") ||
        name.includes("9767")
      ) {
        return sum + balance;
      }

      return sum;
    }, 0);

    const spendingCardBalance = accounts.reduce((sum, a) => {
      const name = String(a.account_name || "").toLowerCase();
      const balance = Number(a.current_balance || 0);

      if (balance <= 0) return sum;

      if (
        name.includes("spending") ||
        name.includes("card")
      ) {
        return sum + balance;
      }

      return sum;
    }, 0);

    const allBills = db.prepare(`
      SELECT *
      FROM bills
      WHERE user_id = ?
        AND active = 1
        AND (paid = 0 OR paid IS NULL)
    `).all(userId) as any[];

    const currentBills = allBills.filter(bill => {
      if (Number(bill.split_each_payday) === 1) return true;
      return isDueInPeriod(Number(bill.due_day || bill.due_date), lastPayday, nextPayday);
    });

    let billsRemaining = 0;

    for (const bill of currentBills) {
      const amount = Number(bill.amount || 0);
      billsRemaining += Number(bill.split_each_payday) === 1 ? amount / 2 : amount;
    }

    const recentSpending = db.prepare(`
      SELECT COALESCE(SUM(t.amount), 0) AS total
      FROM transactions t
      LEFT JOIN bank_accounts ba ON ba.id = t.account_id
      LEFT JOIN bank_connections bc ON bc.id = ba.connection_id
      WHERE t.user_id = ?
        AND bc.user_id = ?
        AND t.amount < 0
        AND t.transaction_date >= ?
        AND t.transaction_date < ?
    `).get(
      userId,
      userId,
      lastPayday.toISOString().slice(0, 10),
      nextPayday.toISOString().slice(0, 10)
    ) as any;

    const daysUntilPayday = Math.max(0, daysBetween(today, nextPayday));
    const suggestedCushion = Math.max(75, daysUntilPayday * 20);

    const safeToSave = Math.max(0, checkingBalance - billsRemaining - suggestedCushion);
    const safeToSpend = Math.max(0, checkingBalance - billsRemaining - suggestedCushion - safeToSave);

    res.json({
      ok: true,
      payPeriod: {
        lastPayday: lastPayday.toISOString().slice(0, 10),
        nextPayday: nextPayday.toISOString().slice(0, 10),
        paycheckAmount: settings?.paycheck_amount ?? 2164.59,
        daysUntilPayday
      },
      accounts: {
        checkingBalance,
        spendingCardBalance,
        count: accounts.length
      },
      bills: {
        remaining: billsRemaining,
        count: currentBills.length,
        items: currentBills.map(b => ({
          name: b.name,
          amount: Number(b.split_each_payday) === 1 ? Number(b.amount) / 2 : Number(b.amount),
          split: Boolean(b.split_each_payday)
        }))
      },
      spending: {
        currentPeriod: Math.abs(Number(recentSpending.total || 0))
      },
      recommendations: {
        suggestedCushion,
        safeToSave,
        safeToSpend
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;
