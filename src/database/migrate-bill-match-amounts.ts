import { db } from "./db";

const cols = db.prepare("PRAGMA table_info(bill_match_rules)").all() as any[];
const has = (name: string) => cols.some(c => c.name === name);

if (!has("expected_amount")) {
  db.exec("ALTER TABLE bill_match_rules ADD COLUMN expected_amount REAL");
}

if (!has("amount_tolerance_percent")) {
  db.exec("ALTER TABLE bill_match_rules ADD COLUMN amount_tolerance_percent REAL DEFAULT 20");
}

console.log("Bill match rules upgraded with amount matching.");
