import { db } from "../db";

db.exec(`
CREATE TABLE IF NOT EXISTS paycheck_budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paycheck_id INTEGER NOT NULL,
    grocery_budget REAL DEFAULT 0,
    misc_budget REAL DEFAULT 0,
    spending_budget REAL DEFAULT 0,
    recommended_savings REAL DEFAULT 0,
    recommended_cushion REAL DEFAULT 0,
    projected_balance REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paycheck_id) REFERENCES paycheck_schedule(id)
);

CREATE TABLE IF NOT EXISTS paycheck_bill_assignment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paycheck_id INTEGER NOT NULL,
    recurring_bill_id INTEGER NOT NULL,
    assigned_amount REAL NOT NULL,
    paid INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paycheck_id) REFERENCES paycheck_schedule(id),
    FOREIGN KEY(recurring_bill_id) REFERENCES recurring_bills(id)
);
`);

console.log("v0.3.2 Paycheck engine tables created.");
