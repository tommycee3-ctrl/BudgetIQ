import express from "express";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import { db } from "./src/database/db";

import bankRoutes from "./src/api/bank/routes";
import transactionRoutes from "./src/api/transactions/routes";
import dashboardRoutes from "./src/api/dashboard/routes";
import billRoutes from "./src/api/bills/routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    app: "CasellaIQ",
    version: "0.8.1"
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare(`
    SELECT
      id,
      name,
      username,
      password_hash,
      theme,
      has_amazon_flex
    FROM users
    WHERE username = ?
  `).get(username) as any;

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Invalid username or password."
    });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({
      ok: false,
      message: "Invalid username or password."
    });
  }

  res.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      theme: user.theme,
      hasAmazonFlex: Boolean(user.has_amazon_flex)
    }
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bills", billRoutes);

app.use(express.static(path.join(process.cwd(), "public")));

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("======================================");
  console.log(" CasellaIQ v0.8.1");
  console.log("======================================");
  console.log(`Listening on http://localhost:${PORT}`);
  console.log("");
});