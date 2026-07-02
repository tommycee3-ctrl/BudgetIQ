import { db } from "./db";

const bills = db.prepare(`
    SELECT *
    FROM bills
    ORDER BY due_date
`).all();

console.table(bills);
