import { db } from "./db";

db.exec(`
CREATE TABLE IF NOT EXISTS transaction_category_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  match_text TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, match_text),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

console.log("Category rules table ready.");
