import { db } from "./db";

console.table(db.prepare(`
  SELECT bc.id, u.username, bc.display_name, bc.provider, bc.created_at
  FROM bank_connections bc
  JOIN users u ON u.id = bc.user_id
  ORDER BY bc.created_at DESC
`).all());
