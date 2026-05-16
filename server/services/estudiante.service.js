const pool = require("../db");
const {
  toEstudianteInputDTO,
  toEstudianteOutputDTO,
} = require("../dtos/estudiante.dto");

// ── Service methods ───────────────────────────────────────────

/**
 * Total de estudiantes activos.
 */
const getTotales = async () => {
  const result = await pool.query(
    "SELECT COUNT(*) as total FROM estudiantes WHERE activo = 1",
  );
  return { total: parseInt(result.rows[0].total) };
};

/**
 * Lista paginada de estudiantes activos con búsqueda opcional.
 */
const getEstudiantes = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;

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
  params.push(limit, offset);

  const [result, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, countParams),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    data: result.rows.map(toEstudianteOutputDTO),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Busca un estudiante activo por ID.
 */
const getEstudianteById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM estudiantes WHERE id_estudiante = $1 AND activo = 1",
    [id],
  );
  return result.rows.length > 0 ? toEstudianteOutputDTO(result.rows[0]) : null;
};

/**
 * Crea un estudiante con ID manual (LOCK + MAX + 1).
 */
const createEstudiante = async (body, usuarioId) => {
  const dto = toEstudianteInputDTO(body);
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
        dto.nombres,
        dto.apellido,
        dto.documento,
        dto.email,
        dto.fecha_nacimiento,
        usuarioId,
      ],
    );

    await client.query("COMMIT");
    return toEstudianteOutputDTO(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Actualiza los datos de un estudiante.
 */
const updateEstudiante = async (id, body, usuarioId) => {
  const dto = toEstudianteInputDTO(body);

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
      dto.nombres,
      dto.apellido,
      dto.documento,
      dto.email,
      dto.fecha_nacimiento,
      usuarioId,
      id,
    ],
  );

  return result.rows.length > 0 ? toEstudianteOutputDTO(result.rows[0]) : null;
};

/**
 * Soft delete: pone activo = 0.
 */
const deleteEstudiante = async (id, usuarioId) => {
  const result = await pool.query(
    `UPDATE estudiantes
     SET activo = 0,
         id_usuario_modificacion = $2,
         fecha_hora_modificacion = NOW()
     WHERE id_estudiante = $1
     RETURNING *`,
    [id, usuarioId],
  );
  return result.rows.length > 0;
};

module.exports = {
  getTotales,
  getEstudiantes,
  getEstudianteById,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
};
