import { db } from "./db";

const cols = db.prepare("PRAGMA table_info(bills)").all() as any[];
const has = (name: string) => cols.some(c => c.name === name);

if (!has("due_day")) db.exec("ALTER TABLE bills ADD COLUMN due_day INTEGER");
if (!has("active")) db.exec("ALTER TABLE bills ADD COLUMN active INTEGER NOT NULL DEFAULT 1");
if (!has("split_each_payday")) db.exec("ALTER TABLE bills ADD COLUMN split_each_payday INTEGER NOT NULL DEFAULT 0");

const tommy = db.prepare("SELECT id FROM users WHERE username = ?").get("tommy") as any;
if (!tommy) throw new Error("Tommy user not found.");

const bills = [
  ["House", 1300, 1, 1],
  ["Mowing", 110, 1, 1],
  ["Cricket", 98, 7, 0],
  ["Progressive", 95, 12, 0],
  ["OPPD", 192, 14, 1],
  ["DashPass", 10, 14, 0],
  ["State Farm", 16, 28, 0],
  ["MUD", 153, 25, 1],
  ["YouTube Premium", 17, 28, 0],
  ["VASA", 24.99, 21, 0],
  ["Google Fiber", 153, 19, 0],
  ["Plex", 8, 24, 0],
  ["Crunchyroll", 13, 28, 0],
  ["Cornhusker Wash", 25, 8, 0]
];

const upsert = db.prepare(`
  INSERT INTO bills (user_id, name, amount, due_date, due_day, paid, active, split_each_payday)
  VALUES (?, ?, ?, ?, ?, 0, 1, ?)
  ON CONFLICT(id) DO NOTHING
`);

const existing = db.prepare(`
  SELECT id FROM bills
  WHERE user_id = ? AND name = ?
`).get;

for (const [name, amount, dueDay, split] of bills) {
  const row = db.prepare(`
    SELECT id FROM bills WHERE user_id = ? AND name = ?
  `).get(tommy.id, name) as any;

  if (row) {
    db.prepare(`
      UPDATE bills
      SET amount = ?, due_date = ?, due_day = ?, active = 1, split_each_payday = ?
      WHERE id = ?
    `).run(amount, String(dueDay), dueDay, split, row.id);
  } else {
    upsert.run(tommy.id, name, amount, String(dueDay), dueDay, split);
  }
}

console.log("Tommy bills seeded.");
