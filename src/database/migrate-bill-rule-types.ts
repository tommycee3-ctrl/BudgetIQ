import { db } from "./db";

const cols = db.prepare("PRAGMA table_info(bill_match_rules)").all() as any[];
const has = (name: string) => cols.some(c => c.name === name);

if (!has("match_type")) {
  db.exec("ALTER TABLE bill_match_rules ADD COLUMN match_type TEXT DEFAULT 'merchant_amount'");
}

console.log("Bill rule match types ready.");
