import { db } from "./db";

console.table(
  db.prepare(`
    SELECT
      ba.id,
      u.username,
      ba.account_name,
      ba.current_balance,
      bc.display_name
    FROM bank_accounts ba
    JOIN bank_connections bc ON bc.id = ba.connection_id
    JOIN users u ON u.id = bc.user_id
    ORDER BY u.username, ba.account_name
  `).all()
);
