import { db } from "../db";

const tommy = db.prepare("SELECT id FROM users WHERE username = ?").get("tommy") as { id: number };

if (!tommy) {
  throw new Error("Tommy user not found. Run database setup first.");
}

const existingRent = db.prepare(`
  SELECT id FROM recurring_bills
  WHERE user_id = ? AND name = ?
`).get(tommy.id, "Rent") as { id: number } | undefined;

let rentBillId = existingRent?.id;

if (!rentBillId) {
  const result = db.prepare(`
    INSERT INTO recurring_bills
    (user_id, name, category, due_day, frequency, autopay, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(tommy.id, "Rent", "Housing", 1, "biweekly", 0, 1);

  rentBillId = Number(result.lastInsertRowid);
}

db.prepare(`
  INSERT INTO bill_amount_history
  (bill_id, amount, effective_date)
  VALUES (?, ?, ?)
`).run(rentBillId, 650, "2026-01-01");

db.prepare(`
  INSERT INTO bill_amount_history
  (bill_id, amount, effective_date)
  VALUES (?, ?, ?)
`).run(rentBillId, 750, "2026-08-01");

console.log("Tommy rent seeded: $650 until August, $750 starting August.");
