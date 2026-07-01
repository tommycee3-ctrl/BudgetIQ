import { db } from "./db";

const columns = db.prepare("PRAGMA table_info(transactions)").all() as any[];
const hasColumn = (name: string) => columns.some(c => c.name === name);

if (!hasColumn("account_id")) {
  db.exec("ALTER TABLE transactions ADD COLUMN account_id INTEGER");
}

if (!hasColumn("external_id")) {
  db.exec("ALTER TABLE transactions ADD COLUMN external_id TEXT");
}

if (!hasColumn("description")) {
  db.exec("ALTER TABLE transactions ADD COLUMN description TEXT DEFAULT ''");
}

if (!hasColumn("pending")) {
  db.exec("ALTER TABLE transactions ADD COLUMN pending INTEGER NOT NULL DEFAULT 0");
}

try {
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id)");
} catch {}

console.log("Transactions table migrated.");
