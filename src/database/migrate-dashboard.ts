import { db } from "./db";

const accountCols = db.prepare("PRAGMA table_info(bank_accounts)").all() as any[];
const hasAccountCol = (name: string) => accountCols.some(c => c.name === name);

if (!hasAccountCol("current_balance")) db.exec("ALTER TABLE bank_accounts ADD COLUMN current_balance REAL DEFAULT 0");
if (!hasAccountCol("available_balance")) db.exec("ALTER TABLE bank_accounts ADD COLUMN available_balance REAL DEFAULT 0");
if (!hasAccountCol("currency")) db.exec("ALTER TABLE bank_accounts ADD COLUMN currency TEXT DEFAULT 'USD'");
if (!hasAccountCol("last_seen_at")) db.exec("ALTER TABLE bank_accounts ADD COLUMN last_seen_at TEXT");

db.exec(`
CREATE TABLE IF NOT EXISTS paycheck_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  last_payday TEXT NOT NULL,
  next_payday TEXT NOT NULL,
  paycheck_amount REAL NOT NULL,
  frequency_days INTEGER NOT NULL DEFAULT 14,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

const tommy = db.prepare("SELECT id FROM users WHERE username = ?").get("tommy") as any;

if (tommy) {
  db.prepare(`
    INSERT INTO paycheck_settings (user_id, last_payday, next_payday, paycheck_amount, frequency_days)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      last_payday = excluded.last_payday,
      next_payday = excluded.next_payday,
      paycheck_amount = excluded.paycheck_amount,
      frequency_days = excluded.frequency_days
  `).run(tommy.id, "2026-06-26", "2026-07-10", 2164.59, 14);
}

console.log("Dashboard foundation migrated.");
