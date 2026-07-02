import { db } from "./db";

db.prepare(`
  UPDATE bank_accounts
  SET enabled = 0
  WHERE connection_id = 2
    AND account_name IN ('REGULAR SAVINGS (9186)', 'Tommys Money (9767)')
`).run();

console.log("Disabled Tommy accounts under Ashley connection.");
console.table(db.prepare(`
  SELECT id, connection_id, account_name, enabled, current_balance
  FROM bank_accounts
  ORDER BY connection_id, id
`).all());
