const express = require("express");
const router = express.Router();
const pool = require("../db");
const validateEstudiante = require("../middlewares/validateEstudiante");
const {
  toEstudianteInputDTO,
  toEstudianteOutputDTO,
} = require("../dtos/estudiante.dto");

// GET /api/estudiantes/totales
router.get("/totales", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) as total FROM estudiantes WHERE activo = 1",
    );
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/estudiantes
router.get("/", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = "SELECT * FROM estudiantes WHERE activo = 1";
    let countQuery = "SELECT COUNT(*) FROM estudiantes WHERE activo = 1";
    let params = [];
    let countParams = [];

    if (search) {
      query +=
        " AND (nombres ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1)";
      countQuery +=
        " AND (nombres ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1)";
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query +=
      " ORDER BY id_estudiante LIMIT $" +
      (params.length + 1) +
      " OFFSET $" +
      (params.length + 2);
    params.push(limitNum, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      data: result.rows.map(toEstudianteOutputDTO),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/estudiantes
router.post("/", validateEstudiante, async (req, res) => {
  const dto = toEstudianteInputDTO(req.body);
  const usuarioId = req.user?.id;
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE estudiantes IN EXCLUSIVE MODE");

    const idResult = await client.query(
      "SELECT COALESCE(MAX(id_estudiante), 0) + 1 AS next_id FROM estudiantes",
    );
    const nextId = idResult.rows[0].next_id;

    const result = await client.query(
      `INSERT INTO estudiantes
         (id_estudiante, nombres, apellido, documento, email, fecha_nacimiento, activo, id_usuario_modificacion, fecha_hora_modificacion)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), 1, $7, NOW())
       RETURNING *`,
      [
        nextId,
        dto.nombres, // ✅ DTO usa "nombres"
        dto.apellido,
        dto.documento, // ✅ DTO usa "documento"
        dto.email,
        dto.fecha_nacimiento,
        usuarioId,
      ],
    );

    await client.query("COMMIT");
    res.json({ success: true, data: toEstudianteOutputDTO(result.rows[0]) });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/estudiantes/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM estudiantes WHERE id_estudiante = $1 AND activo = 1",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    res.json({ data: toEstudianteOutputDTO(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/estudiantes/:id
router.put("/:id", validateEstudiante, async (req, res) => {
  const dto = toEstudianteInputDTO(req.body);
  const usuarioId = req.user?.id;
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const result = await pool.query(
      `UPDATE estudiantes
       SET nombres = $1,
           apellido = $2,
           documento = $3,
           email = $4,
           fecha_nacimiento = COALESCE($5, fecha_nacimiento),
           id_usuario_modificacion = $6,
           fecha_hora_modificacion = NOW()
       WHERE id_estudiante = $7
       RETURNING *`,
      [
        dto.nombres, // ✅ DTO usa "nombres"
        dto.apellido,
        dto.documento, // ✅ DTO usa "documento"
        dto.email,
        dto.fecha_nacimiento,
        usuarioId,
        req.params.id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    res.json({ success: true, data: toEstudianteOutputDTO(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/estudiantes/:id
router.delete("/:id", async (req, res) => {
  const usuarioId = req.user?.id;
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const result = await pool.query(
      `UPDATE estudiantes
       SET activo = 0,
           id_usuario_modificacion = $2,
           fecha_hora_modificacion = NOW()
       WHERE id_estudiante = $1
       RETURNING *`,
      [req.params.id, usuarioId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    res.json({ success: true, message: "Estudiante eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
