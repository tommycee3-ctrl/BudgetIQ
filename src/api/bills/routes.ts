import express from "express";
import { db } from "../../database/db";

const router = express.Router();

router.get("/:userId", (req, res) => {
  const userId = Number(req.params.userId);

  const bills = db.prepare(`
    SELECT id, name, amount, due_date AS dueDate, due_day AS dueDay,
           paid, active, split_each_payday AS splitEachPayday
    FROM bills
    WHERE user_id = ? AND active = 1
    ORDER BY due_day, name
  `).all(userId);

  res.json({ ok: true, bills });
});

router.post("/", (req, res) => {
  const { userId, name, amount, dueDay, splitEachPayday } = req.body;

  const result = db.prepare(`
    INSERT INTO bills (user_id, name, amount, due_date, due_day, paid, active, split_each_payday)
    VALUES (?, ?, ?, ?, ?, 0, 1, ?)
  `).run(userId, name, Number(amount), String(dueDay), Number(dueDay), splitEachPayday ? 1 : 0);

  res.json({ ok: true, id: result.lastInsertRowid });
});

router.put("/:id", (req, res) => {
  const { name, amount, dueDay, splitEachPayday, paid } = req.body;

  db.prepare(`
    UPDATE bills
    SET name = ?, amount = ?, due_date = ?, due_day = ?, split_each_payday = ?, paid = ?
    WHERE id = ?
  `).run(name, Number(amount), String(dueDay), Number(dueDay), splitEachPayday ? 1 : 0, paid ? 1 : 0, req.params.id);

  res.json({ ok: true });
});

router.delete("/:id", (req, res) => {
  db.prepare(`UPDATE bills SET active = 0 WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});

export default router;