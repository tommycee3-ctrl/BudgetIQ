import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "database", "budget.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS bank_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    display_name TEXT NOT NULL,
    encrypted_access_url TEXT NOT NULL,
    last_sync TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

console.log("Bank connection table created.");
