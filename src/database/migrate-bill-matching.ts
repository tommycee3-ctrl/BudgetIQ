import { db } from "./db";

const billCols = db.prepare("PRAGMA table_info(bills)").all() as any[];
const hasBillCol = (name: string) => billCols.some(c => c.name === name);

if (!hasBillCol("paid_transaction_id")) {
  db.exec("ALTER TABLE bills ADD COLUMN paid_transaction_id INTEGER");
}

console.log("Bill matching migration complete.");
