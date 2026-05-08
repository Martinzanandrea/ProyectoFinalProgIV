const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/inscripciones - Listado con paginación
router.get("/", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT i.*, e.nombres as estudiante_nombre, e.apellido as estudiante_apellido, 
             c.nombre as curso_nombre
      FROM inscripciones i
      JOIN estudiantes e ON i.id_estudiante = e.id
      JOIN cursos c ON i.id_curso = c.id
      ORDER BY i.id_inscripcion LIMIT $1 OFFSET $2
    `;
    const countQuery = "SELECT COUNT(*) FROM inscripciones";

    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inscripciones - Crear inscripción con validaciones
router.post("/", async (req, res) => {
  const { id_estudiante, id_curso, fecha_inscripcion } = req.body;

  if (!id_estudiante || !id_curso) {
    return res.status(400).json({ error: "Estudiante y curso son requeridos" });
  }

  try {
    // 1. Verificar si ya existe una inscripción duplicada
    const duplicado = await pool.query(
      "SELECT * FROM inscripciones WHERE id_estudiante = $1 AND id_curso = $2",
      [id_estudiante, id_curso],
    );
    if (duplicado.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "El estudiante ya está inscripto en este curso" });
    }

    // 2. Verificar el curso y su cupo máximo
    const curso = await pool.query("SELECT * FROM cursos WHERE id = $1", [
      id_curso,
    ]);
    if (curso.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    // 3. Verificar si la inscripción está habilitada
    if (curso.rows[0].estado !== "activo") {
      return res
        .status(400)
        .json({
          error: "Las inscripciones no están habilitadas para este curso",
        });
    }

    // 4. Verificar si se alcanzó el cupo máximo
    const inscriptosActuales = await pool.query(
      "SELECT COUNT(*) FROM inscripciones WHERE curso_id = $1",
      [curso_id],
    );
    const cantidadActual = parseInt(inscriptosActuales.rows[0].count);
    const inscriptosMax = curso.rows[0].inscriptos_max;

    if (inscriptosMax && cantidadActual >= inscriptosMax) {
      return res
        .status(400)
        .json({ error: "No hay cupo disponible en este curso" });
    }

    // 5. Crear la inscripción
    const result = await pool.query(
      "INSERT INTO inscripciones (estudiante_id, curso_id, fecha_inscripcion) VALUES ($1, $2, $3) RETURNING *",
      [estudiante_id, curso_id, fecha_inscripcion || new Date()],
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inscripciones/:id - Ver inscripción
router.get("/:id", async (req, res) => {
  try {
    const query = `
      SELECT i.*, e.nombres as estudiante_nombre, e.apellido as estudiante_apellido, 
             e.dni as estudiante_dni, c.nombre as curso_nombre, c.descripcion as curso_descripcion
      FROM inscripciones i
      JOIN estudiantes e ON i.id_estudiante = e.id
      JOIN cursos c ON i.id_curso = c.id
      WHERE i.id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inscripciones/:id - Eliminar inscripción
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM inscripciones WHERE id = $1 RETURNING *",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    res.json({ success: true, message: "Inscripción eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inscripciones/:id/diploma - Generar diploma individual
router.get("/:id/diploma", async (req, res) => {
  try {
    const query = `
      SELECT i.*, e.nombres as estudiante_nombre, e.apellido as estudiante_apellido, 
             e.dni as estudiante_dni, c.nombre as curso_nombre, c.descripcion as curso_descripcion
      FROM inscripciones i
      JOIN estudiantes e ON i.id_estudiante = e.id
      JOIN cursos c ON i.id_curso = c.id
      WHERE i.id_inscripcion = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }

    // Devuelve los datos para generar el diploma
    res.json({
      success: true,
      data: {
        inscripcion: result.rows[0],
        estudiante: {
          nombre: result.rows[0].estudiante_nombre,
          apellido: result.rows[0].estudiante_apellido,
          dni: result.rows[0].estudiante_dni,
        },
        curso: {
          nombre: result.rows[0].curso_nombre,
          descripcion: result.rows[0].curso_descripcion,
        },
        fecha: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
