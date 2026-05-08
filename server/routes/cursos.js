const express = require("express");
const router = express.Router();
const pool = require("../db");
const validateCurso = require("../middlewares/validateCurso");

// GET /api/cursos - Listado con búsqueda y paginación
router.get("/", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query =
      "SELECT id_curso, nombre, descripcion,fecha_inicio,cantidad_horas,inscriptos_max, id_curso_estado FROM cursos WHERE id_curso_estado = 1 OR id_curso_estado = 2 OR id_curso_estado = 3";
    let countQuery =
      "SELECT COUNT(*) FROM cursos WHERE id_curso_estado = 1 OR id_curso_estado = 2 OR id_curso_estado = 3";
    let params = [];
    let countParams = [];

    if (search) {
      query += " AND (nombre ILIKE $1 OR descripcion ILIKE $1)";
      countQuery += " AND (nombre ILIKE $1 OR descripcion ILIKE $1)";
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query +=
      " ORDER BY id_curso LIMIT $" +
      (params.length + 1) +
      " OFFSET $" +
      (params.length + 2);
    params.push(limitNum, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/activos - Cursos activos para el dashboard
router.get("/activos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cursos WHERE id_curso_estado = 1 OR id_curso_estado = 2 OR id_curso_estado = 3 ORDER BY id_curso LIMIT 5",
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/totales - Totales para el dashboard
router.get("/totales", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) as total FROM cursos");
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cursos - Crear curso
router.post("/", validateCurso, async (req, res) => {
  const {
    nombre,
    descripcion,
    inscriptos_max,
    id_curso_estado,
    fecha_inicio,
    cantidad_horas,
  } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO cursos (nombre, descripcion, inscriptos_max, id_curso_estado, id_usuario_modificacion, fecha_hora_modificacion, fecha_inicio,cantidad_horas) VALUES ($1, $2, $3, $4, 1, NOW(), $5,$6) RETURNING *",
      [
        nombre,
        descripcion || null,
        inscriptos_max !== undefined && inscriptos_max !== null
          ? inscriptos_max
          : null,
        Number(id_curso_estado) || 1,
        fecha_inicio || null,
        cantidad_horas || null,
      ],
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id - Ver curso
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cursos WHERE id_curso = $1 AND id_curso_estado = $2",
      [req.params.id, 1],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cursos/:id - Editar curso
router.put("/:id", validateCurso, async (req, res) => {
  const {
    nombre,
    descripcion,
    inscriptos_max,
    id_curso_estado,
    fecha_inicio,
    cantidad_horas,
  } = req.body;

  const max =
    inscriptos_max !== undefined &&
    inscriptos_max !== null &&
    inscriptos_max !== ""
      ? parseInt(inscriptos_max, 10)
      : null;

  try {
    const result = await pool.query(
      `UPDATE cursos 
       SET nombre = $2,
           descripcion = $3,
           inscriptos_max = $4,
           id_curso_estado = $5,
           fecha_inicio = $6,
           id_usuario_modificacion = 1,
           fecha_hora_modificacion = NOW(),
            cantidad_horas = $7
       WHERE id_curso = $1
       RETURNING *`,
      [
        req.params.id,
        nombre,
        descripcion || null,
        max,
        Number(id_curso_estado) || 1,
        fecha_inicio || null,
        cantidad_horas || null,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cursos/:id - Eliminar curso
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE cursos SET id_curso_estado = 4, id_usuario_modificacion = 1, fecha_hora_modificacion = NOW() WHERE id_curso = $1 RETURNING *",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ success: true, message: "Curso eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id/diploma - Generar diploma del curso
router.get("/:id/diploma", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cursos WHERE id_curso_estado = $1",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    // Devuelve los datos para generar el diploma
    res.json({
      success: true,
      data: {
        curso: result.rows[0],
        fecha: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
