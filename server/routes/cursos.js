const express = require("express");
const router = express.Router();
const pool = require("../db");
const { toCursoInputDTO, toCursoOutputDTO } = require("../dtos/curso.dto");

const toInt = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// GET /api/cursos
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
      data: result.rows.map(toCursoOutputDTO), // Output DTO
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error GET /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Rutas /stats/* antes de /:id ─────────────────────────────

// GET /api/cursos/stats/total
router.get("/stats/total", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM cursos");
    res.json({ total: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/stats/activos
router.get("/stats/activos", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM cursos WHERE id_curso_estado = 2 ORDER BY fecha_inicio`,
    );
    res.json({ data: result.rows.map(toCursoOutputDTO) }); // Output DTO
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id
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
    res.json({ data: toCursoOutputDTO(result.rows[0]) }); // Output DTO
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id/diploma
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
      data: { curso: toCursoOutputDTO(result.rows[0]), fecha: new Date() }, // Output DTO
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cursos
router.post("/", async (req, res) => {
  const dto = toCursoInputDTO(req.body); // Input DTO
  const usuarioId = toInt(req.user?.id);

  if (
    !dto.nombre ||
    !dto.descripcion ||
    !dto.fecha_inicio ||
    !dto.cantidad_horas
  ) {
    return res.status(400).json({
      error:
        "nombre, descripcion, fecha_inicio y cantidad_horas son requeridos",
    });
  }
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const result = await pool.query(
      `INSERT INTO cursos
         (nombre, descripcion, fecha_inicio, cantidad_horas, inscriptos_max, id_curso_estado, id_usuario_modificacion, fecha_hora_modificacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        dto.nombre,
        dto.descripcion,
        dto.fecha_inicio,
        dto.cantidad_horas,
        dto.inscriptos_max,
        dto.id_curso_estado,
        usuarioId,
      ],
    );
    res
      .status(201)
      .json({ success: true, data: toCursoOutputDTO(result.rows[0]) }); // Output DTO
  } catch (err) {
    console.error("Error POST /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cursos/:id
router.put("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const dto = toCursoInputDTO(req.body); // Input DTO
  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

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
        dto.nombre || null,
        dto.descripcion || null,
        dto.fecha_inicio || null,
        dto.cantidad_horas || null,
        dto.inscriptos_max,
        dto.id_curso_estado || null,
        usuarioId,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ success: true, data: toCursoOutputDTO(result.rows[0]) }); // Output DTO
  } catch (err) {
    console.error("Error PUT /api/cursos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cursos/:id
router.delete("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    await pool.query(
      `UPDATE cursos SET id_usuario_modificacion = $1, fecha_hora_modificacion = NOW() WHERE id_curso = $2`,
      [usuarioId, id],
    );
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
