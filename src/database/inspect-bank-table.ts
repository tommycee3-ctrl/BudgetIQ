import { db } from "./db";

console.log(
  db.prepare("PRAGMA table_info(bank_connections)").all()
);
