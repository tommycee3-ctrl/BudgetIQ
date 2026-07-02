import { db } from "./db";

console.table(
  db.prepare(`
    SELECT
      id,
      account_name,
      enabled,
      connection_id,
      current_balance
    FROM bank_accounts
    ORDER BY id
  `).all()
);
