import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("expenses.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('salary', '0');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'EUR');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Settings API
  app.get("/api/settings", (req, res) => {
    try {
      const settings = db.prepare("SELECT * FROM settings").all();
      const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", (req, res) => {
    const { salary, currency } = req.body;
    try {
      if (salary !== undefined) {
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('salary', ?)").run(salary.toString());
      }
      if (currency !== undefined) {
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('currency', ?)").run(currency);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Savings API
  app.get("/api/savings", (req, res) => {
    try {
      const savings = db.prepare("SELECT * FROM savings ORDER BY date DESC").all();
      res.json(savings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch savings" });
    }
  });

  app.post("/api/savings", (req, res) => {
    const { description, amount, date } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO savings (description, amount, date) VALUES (?, ?, ?)"
      ).run(description, amount, date);
      const newSaving = db.prepare("SELECT * FROM savings WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json(newSaving);
    } catch (error) {
      res.status(500).json({ error: "Failed to add saving" });
    }
  });

  app.delete("/api/savings/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM savings WHERE id = ?").run(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saving" });
    }
  });

  // API Routes
  app.get("/api/expenses", (req, res) => {
    try {
      const expenses = db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", (req, res) => {
    const { description, amount, category, date } = req.body;
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const info = db.prepare(
        "INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)"
      ).run(description, amount, category, date);
      
      const newExpense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json(newExpense);
    } catch (error) {
      res.status(500).json({ error: "Failed to add expense" });
    }
  });

  app.delete("/api/expenses/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
