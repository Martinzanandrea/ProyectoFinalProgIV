const express = require("express");
const router = express.Router();
const pool = require("../db");

const toInt = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// GET /api/cursos - Listado con paginación y búsqueda
router.get("/", async (req, res) => {
  const page = toInt(req.query.page) || 1;
  const limit = toInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const whereClause = search
      ? `WHERE nombre ILIKE $3 OR descripcion ILIKE $3`
      : "";
    const params = search ? [limit, offset, `%${search}%`] : [limit, offset];

    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM cursos ${whereClause} ORDER BY id_curso LIMIT $1 OFFSET $2`,
        params,
      ),
      pool.query(
        `SELECT COUNT(*) FROM cursos ${whereClause}`,
        search ? [`%${search}%`] : [],
      ),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error GET /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── IMPORTANTE: rutas /stats/* antes de /:id ─────────────────
// Si van después, Express interpreta "stats" como un :id y falla.

// GET /api/cursos/stats/total — usado por Dashboard
router.get("/stats/total", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM cursos");
    res.json({ total: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Error GET /api/cursos/stats/total:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/stats/activos — cursos con inscripción abierta (estado 2), usado por Dashboard
router.get("/stats/activos", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_curso, nombre, descripcion, fecha_inicio, inscriptos_max
       FROM cursos
       WHERE id_curso_estado = 2
       ORDER BY fecha_inicio`,
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error GET /api/cursos/stats/activos:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id — Ver curso individual
router.get("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await pool.query(
      "SELECT * FROM cursos WHERE id_curso = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error GET /api/cursos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id/diploma — usado por Cursos.js
router.get("/:id/diploma", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await pool.query(
      "SELECT * FROM cursos WHERE id_curso = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({
      success: true,
      data: {
        curso: result.rows[0],
        fecha: new Date(),
      },
    });
  } catch (err) {
    console.error("Error GET /api/cursos/:id/diploma:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cursos
router.post("/", async (req, res) => {
  const {
    nombre,
    descripcion,
    fecha_inicio,
    cantidad_horas,
    inscriptos_max,
    id_curso_estado,
  } = req.body;
  const usuarioId = toInt(req.user?.id);

  if (!nombre || !descripcion || !fecha_inicio || !cantidad_horas) {
    return res
      .status(400)
      .json({
        error:
          "nombre, descripcion, fecha_inicio y cantidad_horas son requeridos",
      });
  }
  if (!usuarioId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cursos
         (nombre, descripcion, fecha_inicio, cantidad_horas, inscriptos_max, id_curso_estado, id_usuario_modificacion, fecha_hora_modificacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        nombre,
        descripcion,
        fecha_inicio,
        Number(cantidad_horas),
        inscriptos_max !== undefined ? Number(inscriptos_max) : null,
        toInt(id_curso_estado) || 1,
        usuarioId,
      ],
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error POST /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cursos/:id
router.put("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const {
    nombre,
    descripcion,
    fecha_inicio,
    cantidad_horas,
    inscriptos_max,
    id_curso_estado,
  } = req.body;
  const usuarioId = toInt(req.user?.id);

  if (!usuarioId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    const result = await pool.query(
      `UPDATE cursos SET
         nombre = COALESCE($1, nombre),
         descripcion = COALESCE($2, descripcion),
         fecha_inicio = COALESCE($3, fecha_inicio),
         cantidad_horas = COALESCE($4, cantidad_horas),
         inscriptos_max = $5,
         id_curso_estado = COALESCE($6, id_curso_estado),
         id_usuario_modificacion = $7,
         fecha_hora_modificacion = NOW()
       WHERE id_curso = $8
       RETURNING *`,
      [
        nombre || null,
        descripcion || null,
        fecha_inicio || null,
        cantidad_horas ? Number(cantidad_horas) : null,
        inscriptos_max !== undefined ? Number(inscriptos_max) : null,
        id_curso_estado ? toInt(id_curso_estado) : null,
        usuarioId,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error PUT /api/cursos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cursos/:id
router.delete("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await pool.query(
      "DELETE FROM cursos WHERE id_curso = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ success: true, message: "Curso eliminado" });
  } catch (err) {
    console.error("Error DELETE /api/cursos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
