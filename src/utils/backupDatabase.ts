import fs from "fs";
import path from "path";

export function backupDatabase(reason = "manual") {
  const source = path.join(process.cwd(), "database", "budget.db");

  if (!fs.existsSync(source)) {
    console.warn("No database found to back up.");
    return null;
  }

  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const destination = path.join(
    backupDir,
    "budget-" + reason + "-" + stamp + ".db"
  );

  fs.copyFileSync(source, destination);

  console.log("Database backup created:", destination);

  return destination;
}
