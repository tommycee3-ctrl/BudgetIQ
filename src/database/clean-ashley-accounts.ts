import { db } from "./db";

const cols = db.prepare("PRAGMA table_info(bank_accounts)").all() as any[];
const has = (name: string) => cols.some(c => c.name === name);

if (!has("hidden")) {
  db.exec("ALTER TABLE bank_accounts ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0");
}

db.prepare("UPDATE bank_connections SET enabled = 0 WHERE id = 2").run();

db.prepare(`
  UPDATE bank_accounts
  SET enabled = 0, hidden = 1
  WHERE id IN (3, 4, 9, 10)
`).run();

console.log("Cleaned Ashley account visibility.");
console.table(db.prepare(`
  SELECT ba.id, u.username, bc.id AS connection_id, bc.enabled AS connection_enabled,
         ba.account_name, ba.current_balance, ba.enabled, ba.hidden
  FROM bank_accounts ba
  JOIN bank_connections bc ON bc.id = ba.connection_id
  JOIN users u ON u.id = bc.user_id
  WHERE u.username = 'ashley'
  ORDER BY bc.id, ba.id
`).all());
