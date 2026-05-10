// ============================================================
// CURSO DTO
// ============================================================

const ESTADOS_CURSO = {
  1: "Borrador",
  2: "Inscripción Abierta",
  3: "Inscripción Cerrada",
  4: "Eliminado",
};

// Lo que se acepta al crear o editar un curso
const toCursoInputDTO = (body) => ({
  nombre: body.nombre,
  descripcion: body.descripcion,
  fecha_inicio: body.fecha_inicio || null,
  cantidad_horas: body.cantidad_horas ? Number(body.cantidad_horas) : null,
  inscriptos_max:
    body.inscriptos_max !== undefined ? Number(body.inscriptos_max) : null,
  id_curso_estado: body.id_curso_estado ? Number(body.id_curso_estado) : 1,
});

// Lo que se devuelve al front
const toCursoOutputDTO = (row) => ({
  id_curso: row.id_curso,
  nombre: row.nombre,
  descripcion: row.descripcion,
  fecha_inicio: row.fecha_inicio,
  cantidad_horas: row.cantidad_horas,
  inscriptos_max: row.inscriptos_max,
  id_curso_estado: row.id_curso_estado,
  estado_descripcion: ESTADOS_CURSO[row.id_curso_estado] || "Desconocido",
});

module.exports = { toCursoInputDTO, toCursoOutputDTO };
