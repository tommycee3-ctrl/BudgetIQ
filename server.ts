import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    app: "BudgetIQ",
    version: "0.2.0"
  });
});

app.use(express.static(path.join(process.cwd(), "public")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BudgetIQ API running at http://localhost:${PORT}`);
});
