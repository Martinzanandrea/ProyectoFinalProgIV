const express = require("express");
const router = express.Router();
const pool = require("../db");
const {
  toInscripcionInputDTO,
  toInscripcionOutputDTO,
} = require("../dtos/inscripcion.dto");
const { generarDiplomaPDF } = require("../services/diplomaService");

const toInt = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// GET /api/inscripciones
router.get("/", async (req, res) => {
  const page = toInt(req.query.page) || 1;
  const limit = toInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT i.*,
                e.nombres  AS estudiante_nombre,
                e.apellido AS estudiante_apellido,
                c.nombre   AS curso_nombre
         FROM inscripciones i
         JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
         JOIN cursos c      ON i.id_curso      = c.id_curso
         ORDER BY i.id_inscripcion
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query("SELECT COUNT(*) FROM inscripciones"),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    res.json({
      data: result.rows.map(toInscripcionOutputDTO),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error GET /api/inscripciones:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inscripciones
router.post("/", async (req, res) => {
  const dto = toInscripcionInputDTO(req.body);
  const usuarioId = toInt(req.user?.id);

  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });
  if (!dto.id_estudiante || !dto.id_curso) {
    return res.status(400).json({ error: "Estudiante y curso son requeridos" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [123456789]);

    const dup = await client.query(
      "SELECT 1 FROM inscripciones WHERE id_estudiante = $1 AND id_curso = $2",
      [dto.id_estudiante, dto.id_curso],
    );
    if (dup.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "El estudiante ya está inscripto en este curso" });
    }

    const cursoRes = await client.query(
      "SELECT id_curso, inscriptos_max, id_curso_estado FROM cursos WHERE id_curso = $1",
      [dto.id_curso],
    );
    if (cursoRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    if (toInt(cursoRes.rows[0].id_curso_estado) !== 2) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
          error: "Las inscripciones no están habilitadas para este curso",
        });
    }

    const insCountRes = await client.query(
      "SELECT COUNT(*) FROM inscripciones WHERE id_curso = $1",
      [dto.id_curso],
    );
    const cantidadActual = parseInt(insCountRes.rows[0].count, 10);
    const inscriptosMax =
      cursoRes.rows[0].inscriptos_max !== null
        ? Number(cursoRes.rows[0].inscriptos_max)
        : null;
    if (inscriptosMax !== null && cantidadActual >= inscriptosMax) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "No hay cupo disponible en este curso" });
    }

    const estRes = await client.query(
      "SELECT id_estudiante FROM estudiantes WHERE id_estudiante = $1 AND activo = 1",
      [dto.id_estudiante],
    );
    if (estRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Estudiante no encontrado o inactivo" });
    }

    const insertRes = await client.query(
      `INSERT INTO inscripciones
         (id_curso, id_estudiante, fecha_hora_inscripcion, id_inscripcion_estado, id_usuario_modificacion, fecha_hora_modificacion)
       VALUES ($1, $2, COALESCE($3, NOW()), 1, $4, NOW())
       RETURNING *`,
      [dto.id_curso, dto.id_estudiante, dto.fecha_hora_inscripcion, usuarioId],
    );

    await client.query("COMMIT");
    return res
      .status(201)
      .json({ success: true, data: toInscripcionOutputDTO(insertRes.rows[0]) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error POST /api/inscripciones:", err.stack || err);
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "El estudiante ya está inscripto en este curso" });
    }
    return res
      .status(500)
      .json({ error: err.message || "Error interno del servidor" });
  } finally {
    client.release();
  }
});

// GET /api/inscripciones/:id
router.get("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await pool.query(
      `SELECT i.*,
              e.nombres    AS estudiante_nombre,
              e.apellido   AS estudiante_apellido,
              e.documento  AS estudiante_documento,
              c.nombre     AS curso_nombre,
              c.descripcion AS curso_descripcion
       FROM inscripciones i
       JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       JOIN cursos c      ON i.id_curso      = c.id_curso
       WHERE i.id_inscripcion = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    res.json({ data: toInscripcionOutputDTO(result.rows[0]) });
  } catch (err) {
    console.error("Error GET /api/inscripciones/:id", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inscripciones/:id
router.delete("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await pool.query(
      "DELETE FROM inscripciones WHERE id_inscripcion = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    res.json({ success: true, message: "Inscripción eliminada" });
  } catch (err) {
    console.error("Error DELETE /api/inscripciones/:id", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inscripciones/:id/diploma — genera y descarga el PDF con QR
router.get("/:id/diploma", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await pool.query(
      `SELECT i.*,
              e.nombres    AS estudiante_nombre,
              e.apellido   AS estudiante_apellido,
              e.documento  AS estudiante_documento,
              c.nombre     AS curso_nombre,
              c.descripcion AS curso_descripcion
       FROM inscripciones i
       JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       JOIN cursos c      ON i.id_curso      = c.id_curso
       WHERE i.id_inscripcion = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }

    const row = result.rows[0];

    await generarDiplomaPDF(res, {
      inscripcion: {
        id_inscripcion: row.id_inscripcion,
        fecha_hora_inscripcion: row.fecha_hora_inscripcion,
      },
      estudiante: {
        nombre: row.estudiante_nombre,
        apellido: row.estudiante_apellido,
        documento: row.estudiante_documento,
      },
      curso: {
        nombre: row.curso_nombre,
        descripcion: row.curso_descripcion,
      },
    });
  } catch (err) {
    console.error("Error GET /api/inscripciones/:id/diploma", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
