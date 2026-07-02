import { db } from "./db";

db.prepare(`
  UPDATE bank_accounts
  SET enabled = 0
  WHERE id = 8
`).run();

console.log("Disabled Tommy TOTAL CHECKING account id 8.");
