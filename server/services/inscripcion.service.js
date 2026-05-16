const pool = require("../db");
const {
  toInscripcionInputDTO,
  toInscripcionOutputDTO,
} = require("../dtos/inscripcion.dto");
const { generarDiplomaPDF } = require("./diplomaService");

// ── Query reutilizable ────────────────────────────────────────

/**
 * SELECT completo de inscripción con joins a estudiantes y cursos.
 */
const queryInscripcionCompleta = (whereClause, params) =>
  pool.query(
    `SELECT i.*,
            e.nombres    AS estudiante_nombre,
            e.apellido   AS estudiante_apellido,
            e.documento  AS estudiante_documento,
            c.nombre     AS curso_nombre,
            c.descripcion AS curso_descripcion
     FROM inscripciones i
     JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
     JOIN cursos c      ON i.id_curso      = c.id_curso
     ${whereClause}`,
    params,
  );

// ── Service methods ───────────────────────────────────────────

/**
 * Lista paginada de inscripciones (excluye eliminadas, estado 3).
 */
const getInscripciones = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT i.*,
              e.nombres  AS estudiante_nombre,
              e.apellido AS estudiante_apellido,
              c.nombre   AS curso_nombre
       FROM inscripciones i
       JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       JOIN cursos c      ON i.id_curso      = c.id_curso
       WHERE i.id_inscripcion_estado != 3
       ORDER BY i.id_inscripcion
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    ),
    pool.query(
      "SELECT COUNT(*) FROM inscripciones WHERE id_inscripcion_estado != 3",
    ),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: result.rows.map(toInscripcionOutputDTO),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Busca una inscripción por ID (excluye eliminadas).
 */
const getInscripcionById = async (id) => {
  const result = await queryInscripcionCompleta(
    "WHERE i.id_inscripcion = $1 AND i.id_inscripcion_estado != 3",
    [id],
  );
  return result.rows.length > 0 ? toInscripcionOutputDTO(result.rows[0]) : null;
};

/**
 * Crea una inscripción con todas las validaciones de negocio dentro de una transacción.
 * Retorna { data } si fue exitoso, o lanza un error con { status, message }.
 */
const createInscripcion = async (body, usuarioId) => {
  const dto = toInscripcionInputDTO(body);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [123456789]);

    // Verificar duplicado (confirmadas y canceladas, no eliminadas)
    const dup = await client.query(
      `SELECT 1 FROM inscripciones
       WHERE id_estudiante = $1 AND id_curso = $2 AND id_inscripcion_estado != 3`,
      [dto.id_estudiante, dto.id_curso],
    );
    if (dup.rows.length > 0) {
      const err = new Error("El estudiante ya está inscripto en este curso");
      err.status = 400;
      throw err;
    }

    // Verificar que el curso existe y está activo (estado 2)
    const cursoRes = await client.query(
      "SELECT id_curso, inscriptos_max, id_curso_estado FROM cursos WHERE id_curso = $1 AND id_curso_estado != 4",
      [dto.id_curso],
    );
    if (cursoRes.rows.length === 0) {
      const err = new Error("Curso no encontrado");
      err.status = 404;
      throw err;
    }
    if (Number(cursoRes.rows[0].id_curso_estado) !== 2) {
      const err = new Error(
        "Las inscripciones no están habilitadas para este curso",
      );
      err.status = 400;
      throw err;
    }

    // Verificar cupo disponible
    const insCountRes = await client.query(
      "SELECT COUNT(*) FROM inscripciones WHERE id_curso = $1 AND id_inscripcion_estado = 1",
      [dto.id_curso],
    );
    const cantidadActual = parseInt(insCountRes.rows[0].count, 10);
    const inscriptosMax =
      cursoRes.rows[0].inscriptos_max !== null
        ? Number(cursoRes.rows[0].inscriptos_max)
        : null;
    if (inscriptosMax !== null && cantidadActual >= inscriptosMax) {
      const err = new Error("No hay cupo disponible en este curso");
      err.status = 400;
      throw err;
    }

    // Verificar que el estudiante existe y está activo
    const estRes = await client.query(
      "SELECT id_estudiante FROM estudiantes WHERE id_estudiante = $1 AND activo = 1",
      [dto.id_estudiante],
    );
    if (estRes.rows.length === 0) {
      const err = new Error("Estudiante no encontrado o inactivo");
      err.status = 404;
      throw err;
    }

    // Insertar inscripción
    const insertRes = await client.query(
      `INSERT INTO inscripciones
         (id_curso, id_estudiante, fecha_hora_inscripcion, id_inscripcion_estado, id_usuario_modificacion, fecha_hora_modificacion)
       VALUES ($1, $2, COALESCE($3, NOW()), 1, $4, NOW())
       RETURNING id_inscripcion`,
      [dto.id_curso, dto.id_estudiante, dto.fecha_hora_inscripcion, usuarioId],
    );

    // Traer la inscripción completa para retornar
    const nuevaInscripcion = await client.query(
      `SELECT i.*,
              e.nombres  AS estudiante_nombre,
              e.apellido AS estudiante_apellido,
              c.nombre   AS curso_nombre
       FROM inscripciones i
       JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       JOIN cursos c      ON i.id_curso = c.id_curso
       WHERE i.id_inscripcion = $1`,
      [insertRes.rows[0].id_inscripcion],
    );

    await client.query("COMMIT");
    return toInscripcionOutputDTO(nuevaInscripcion.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Cancela una inscripción confirmada (estado 1 → 2).
 */
const cancelarInscripcion = async (id, usuarioId) => {
  const result = await pool.query(
    `UPDATE inscripciones
     SET id_inscripcion_estado = 2,
         id_usuario_modificacion = $2,
         fecha_hora_modificacion = NOW()
     WHERE id_inscripcion = $1 AND id_inscripcion_estado = 1
     RETURNING *`,
    [id, usuarioId],
  );
  return result.rows.length > 0 ? toInscripcionOutputDTO(result.rows[0]) : null;
};

/**
 * Soft delete: pone estado 3 a la inscripción.
 */
const deleteInscripcion = async (id, usuarioId) => {
  const result = await pool.query(
    `UPDATE inscripciones
     SET id_inscripcion_estado = 3,
         id_usuario_modificacion = $2,
         fecha_hora_modificacion = NOW()
     WHERE id_inscripcion = $1 AND id_inscripcion_estado != 3
     RETURNING *`,
    [id, usuarioId],
  );
  return result.rows.length > 0;
};

/**
 * Genera el PDF del diploma de una inscripción confirmada (estado 1).
 * Escribe directamente en res via generarDiplomaPDF.
 */
const generarDiploma = async (id, res) => {
  const result = await queryInscripcionCompleta(
    "WHERE i.id_inscripcion = $1 AND i.id_inscripcion_estado = 1",
    [id],
  );

  if (result.rows.length === 0) return false;

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

  return true;
};

module.exports = {
  getInscripciones,
  getInscripcionById,
  createInscripcion,
  cancelarInscripcion,
  deleteInscripcion,
  generarDiploma,
};
