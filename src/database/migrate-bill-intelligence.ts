import { db } from "./db";

db.exec(`
CREATE TABLE IF NOT EXISTS bill_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  bill_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL,
  pay_period_start TEXT NOT NULL,
  pay_period_end TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bill_id, pay_period_start, pay_period_end),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(bill_id) REFERENCES bills(id),
  FOREIGN KEY(transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS bill_match_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  bill_id INTEGER NOT NULL,
  match_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, bill_id, match_text),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(bill_id) REFERENCES bills(id)
);
`);

console.log("Bill intelligence tables ready.");
