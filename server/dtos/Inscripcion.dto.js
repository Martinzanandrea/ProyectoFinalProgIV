// ============================================================
// INSCRIPCION DTO
// ============================================================

// Lo que se acepta al crear una inscripción
const toInscripcionInputDTO = (body) => ({
  id_estudiante: body.id_estudiante ? Number(body.id_estudiante) : null,
  id_curso: body.id_curso ? Number(body.id_curso) : null,
  fecha_hora_inscripcion: body.fecha_hora_inscripcion || null,
});

// Lo que se devuelve al front en el listado
const toInscripcionOutputDTO = (row) => ({
  id_inscripcion: row.id_inscripcion,
  id_estudiante: row.id_estudiante,
  id_curso: row.id_curso,
  fecha_hora_inscripcion: row.fecha_hora_inscripcion,
  id_inscripcion_estado: row.id_inscripcion_estado,
  estudiante_nombre: row.estudiante_nombre,
  estudiante_apellido: row.estudiante_apellido,
  curso_nombre: row.curso_nombre,
});

// Lo que se devuelve en el diploma
const toDiplomaOutputDTO = (row) => ({
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
  fecha: new Date(),
});

module.exports = {
  toInscripcionInputDTO,
  toInscripcionOutputDTO,
  toDiplomaOutputDTO,
};
