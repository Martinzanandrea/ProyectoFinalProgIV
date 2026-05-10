const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./db");
const errorHandler = require("./middlewares/errorHandler");
const authMiddleware = require("./middlewares/authMiddleware");

app.use(cors());
app.use(express.json());

// ── Rutas públicas (sin token) ──────────────────────────────
app.get("/api/ping", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    res.json({ tables: result.rows.map((r) => r.table_name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login y register no requieren token
app.use("/api/auth", require("./routes/auth"));

// ── Middleware JWT: protege todo lo que viene abajo ─────────
app.use(authMiddleware);

// ── Rutas protegidas ────────────────────────────────────────
app.use("/api/estudiantes", require("./routes/estudiantes"));
app.use("/api/cursos", require("./routes/cursos"));
app.use("/api/inscripciones", require("./routes/inscripciones"));

// Middleware de error centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
