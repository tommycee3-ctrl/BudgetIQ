import { db } from "./db";

console.table(
  db.prepare(`
    SELECT
      t.id,
      t.user_id,
      t.account_id,
      u.username,
      ba.account_name,
      bc.user_id AS connection_user,
      u2.username AS connection_owner,
      t.description
    FROM transactions t
    JOIN users u
      ON u.id = t.user_id
    JOIN bank_accounts ba
      ON ba.id = t.account_id
    JOIN bank_connections bc
      ON bc.id = ba.connection_id
    JOIN users u2
      ON u2.id = bc.user_id
    WHERE ba.account_name = 'TOTAL CHECKING (4979)'
    LIMIT 20
  `).all()
);
