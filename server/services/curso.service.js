const pool = require("../db");
const { toCursoInputDTO, toCursoOutputDTO } = require("../dtos/curso.dto");

// ── Helpers ──────────────────────────────────────────────────

const toInt = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/**
 * Mapea una fila de DB a DTO de salida, agregando inscriptos_actual si viene.
 */
const mapCursoRow = (row) => ({
  ...toCursoOutputDTO(row),
  ...(row.inscriptos_actual !== undefined && {
    inscriptos_actual: parseInt(row.inscriptos_actual, 10) || 0,
  }),
});

// ── Queries reutilizables ─────────────────────────────────────

/**
 * Query base que trae cursos con inscriptos_actual.
 * Recibe un WHERE clause y params opcionales.
 */
const queryCursosConInscriptos = (whereClause, params = []) =>
  pool.query(
    `SELECT c.*,
            COUNT(i.id_inscripcion) FILTER (WHERE i.id_inscripcion_estado = 1) AS inscriptos_actual
     FROM cursos c
     LEFT JOIN inscripciones i ON i.id_curso = c.id_curso
     ${whereClause}
     GROUP BY c.id_curso
     ORDER BY c.id_curso`,
    params,
  );

// ── Service methods ───────────────────────────────────────────

/**
 * Lista paginada de cursos (excluye eliminados, estado 4).
 */
const getCursos = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;

  const whereClause = search
    ? `WHERE c.id_curso_estado != 4 AND (c.nombre ILIKE $3 OR c.descripcion ILIKE $3)`
    : `WHERE c.id_curso_estado != 4`;

  const countWhereClause = search
    ? `WHERE c.id_curso_estado != 4 AND (c.nombre ILIKE $1 OR c.descripcion ILIKE $1)`
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
      `SELECT COUNT(*) FROM cursos c ${countWhereClause}`,
      search ? [`%${search}%`] : [],
    ),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: result.rows.map(mapCursoRow),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Cantidad total de cursos (excluye eliminados).
 */
const getStatsTotal = async () => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM cursos WHERE id_curso_estado != 4",
  );
  return { total: parseInt(result.rows[0].count, 10) };
};

/**
 * Cursos activos (estado 2) con inscriptos_actual.
 */
const getStatsActivos = async () => {
  const result = await pool.query(
    `SELECT c.*,
            COUNT(i.id_inscripcion) FILTER (WHERE i.id_inscripcion_estado = 1) AS inscriptos_actual
     FROM cursos c
     LEFT JOIN inscripciones i ON i.id_curso = c.id_curso
     WHERE c.id_curso_estado = 2
     GROUP BY c.id_curso
     ORDER BY c.fecha_inicio`,
  );
  return { data: result.rows.map(mapCursoRow) };
};

/**
 * Total de inscripciones confirmadas (estado 1).
 */
const getStatsInscriptosTotales = async () => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM inscripciones WHERE id_inscripcion_estado = 1",
  );
  return { total: parseInt(result.rows[0].count, 10) };
};

/**
 * Detalle de un curso con su lista de inscriptos confirmados.
 */
const getInscriptosByCurso = async (id) => {
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

  if (cursoRes.rows.length === 0) return null;

  const curso = cursoRes.rows[0];
  const inscriptos = inscriptosRes.rows;
  const max =
    curso.inscriptos_max !== null ? Number(curso.inscriptos_max) : null;

  return {
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
  };
};

/**
 * Busca un curso por ID (excluye eliminados).
 */
const getCursoById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM cursos WHERE id_curso = $1 AND id_curso_estado != 4",
    [id],
  );
  return result.rows.length > 0 ? toCursoOutputDTO(result.rows[0]) : null;
};

/**
 * Crea un nuevo curso.
 */
const createCurso = async (body, usuarioId) => {
  const dto = toCursoInputDTO(body);
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
  return toCursoOutputDTO(result.rows[0]);
};

/**
 * Actualiza un curso existente.
 */
const updateCurso = async (id, body, usuarioId) => {
  const dto = toCursoInputDTO(body);
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
  return result.rows.length > 0 ? toCursoOutputDTO(result.rows[0]) : null;
};

/**
 * Soft delete: pone estado 4 al curso.
 */
const deleteCurso = async (id, usuarioId) => {
  const result = await pool.query(
    `UPDATE cursos
     SET id_curso_estado = 4,
         id_usuario_modificacion = $2,
         fecha_hora_modificacion = NOW()
     WHERE id_curso = $1 AND id_curso_estado != 4
     RETURNING *`,
    [id, usuarioId],
  );
  return result.rows.length > 0;
};

module.exports = {
  toInt,
  getCursos,
  getStatsTotal,
  getStatsActivos,
  getStatsInscriptosTotales,
  getInscriptosByCurso,
  getCursoById,
  createCurso,
  updateCurso,
  deleteCurso,
};
