import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head><title>BudgetIQ</title></head>
<body style="background:#0b1220;color:white;font-family:Arial;text-align:center;padding-top:100px;">
  <h1 style="color:#37b4ff;">BudgetIQ</h1>
  <h2>? Development Server Running</h2>
  <p>Version 0.0.1</p>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`BudgetIQ running at http://localhost:${PORT}`);
});
