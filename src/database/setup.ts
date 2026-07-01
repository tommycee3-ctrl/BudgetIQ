import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcrypt";

const dbPath = path.join(process.cwd(), "database", "budget.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  theme TEXT NOT NULL,
  has_amazon_flex INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const insertUser = db.prepare(`
INSERT OR IGNORE INTO users
(name, username, password_hash, theme, has_amazon_flex)
VALUES (?, ?, ?, ?, ?)
`);

const tommyHash = bcrypt.hashSync("tommy123", 10);
const ashleyHash = bcrypt.hashSync("ashley123", 10);

insertUser.run("Tommy", "tommy", tommyHash, "tommy", 1);
insertUser.run("Ashley", "ashley", ashleyHash, "ashley", 0);

console.log("Database initialized.");
console.log("Tommy login: tommy / tommy123");
console.log("Ashley login: ashley / ashley123");
