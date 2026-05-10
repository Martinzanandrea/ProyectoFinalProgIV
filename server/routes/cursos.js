const express = require("express");
const router = express.Router();
const pool = require("../db");
const { toCursoInputDTO, toCursoOutputDTO } = require("../dtos/curso.dto");

const toInt = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// GET /api/cursos — excluye eliminados (estado 4), incluye inscriptos_actual
router.get("/", async (req, res) => {
  const page = toInt(req.query.page) || 1;
  const limit = toInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const whereClause = search
      ? `WHERE c.id_curso_estado != 4 AND (c.nombre ILIKE $3 OR c.descripcion ILIKE $3)`
      : `WHERE c.id_curso_estado != 4`;
    const params = search ? [limit, offset, `%${search}%`] : [limit, offset];

    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT c.*,
                COUNT(i.id_inscripcion) FILTER (WHERE i.id_inscripcion_estado = 1) AS inscriptos_actual
         FROM cursos c
         LEFT JOIN inscripciones i ON i.id_curso = c.id_curso
         ${whereClause}
         GROUP BY c.id_curso
         ORDER BY c.id_curso
         LIMIT $1 OFFSET $2`,
        params,
      ),
      pool.query(
        `SELECT COUNT(*) FROM cursos c ${whereClause}`,
        search ? [`%${search}%`] : [],
      ),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: result.rows.map((row) => ({
        ...toCursoOutputDTO(row),
        inscriptos_actual: parseInt(row.inscriptos_actual, 10) || 0,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error GET /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Rutas /stats/* antes de /:id ─────────────────────────────

// GET /api/cursos/stats/total — excluye eliminados
router.get("/stats/total", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM cursos WHERE id_curso_estado != 4",
    );
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
    res.json({ data: result.rows.map(toCursoOutputDTO) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id/inscriptos
router.get("/:id/inscriptos", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const [cursoRes, inscriptosRes] = await Promise.all([
      pool.query(
        "SELECT * FROM cursos WHERE id_curso = $1 AND id_curso_estado != 4",
        [id],
      ),
      pool.query(
        `SELECT e.id_estudiante, e.nombres, e.apellido, e.documento, e.email,
                i.id_inscripcion, i.fecha_hora_inscripcion, i.id_inscripcion_estado
         FROM inscripciones i
         JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
         WHERE i.id_curso = $1 AND i.id_inscripcion_estado = 1
         ORDER BY e.apellido, e.nombres`,
        [id],
      ),
    ]);

    if (cursoRes.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const curso = cursoRes.rows[0];
    const inscriptos = inscriptosRes.rows;
    const max =
      curso.inscriptos_max !== null ? Number(curso.inscriptos_max) : null;

    res.json({
      data: {
        curso: toCursoOutputDTO(curso),
        inscriptos_actual: inscriptos.length,
        inscriptos_max: max,
        cupos_disponibles: max !== null ? max - inscriptos.length : null,
        estudiantes: inscriptos.map((e) => ({
          id_estudiante: e.id_estudiante,
          nombre: e.nombres,
          apellido: e.apellido,
          documento: e.documento,
          email: e.email,
          id_inscripcion: e.id_inscripcion,
          fecha_hora_inscripcion: e.fecha_hora_inscripcion,
        })),
      },
    });
  } catch (err) {
    console.error("Error GET /api/cursos/:id/inscriptos:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id
router.get("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await pool.query(
      "SELECT * FROM cursos WHERE id_curso = $1 AND id_curso_estado != 4",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ data: toCursoOutputDTO(result.rows[0]) });
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
      "SELECT * FROM cursos WHERE id_curso = $1 AND id_curso_estado != 4",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({
      success: true,
      data: { curso: toCursoOutputDTO(result.rows[0]), fecha: new Date() },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cursos
router.post("/", async (req, res) => {
  const dto = toCursoInputDTO(req.body);
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
      .json({ success: true, data: toCursoOutputDTO(result.rows[0]) });
  } catch (err) {
    console.error("Error POST /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cursos/:id
router.put("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const dto = toCursoInputDTO(req.body);
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
       WHERE id_curso = $8 AND id_curso_estado != 4
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
    res.json({ success: true, data: toCursoOutputDTO(result.rows[0]) });
  } catch (err) {
    console.error("Error PUT /api/cursos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cursos/:id — SOFT DELETE: cambia estado a 4 (ELIMINADO)
router.delete("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const result = await pool.query(
      `UPDATE cursos
       SET id_curso_estado = 4,
           id_usuario_modificacion = $2,
           fecha_hora_modificacion = NOW()
       WHERE id_curso = $1 AND id_curso_estado != 4
       RETURNING *`,
      [id, usuarioId],
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
