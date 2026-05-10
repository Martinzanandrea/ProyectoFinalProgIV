// ============================================================
// ESTUDIANTE DTO
// ============================================================
// Input: filtra y sanitiza lo que llega del front en el body
// Output: define exactamente qué se devuelve al front
// ============================================================

// Lo que se acepta al crear o editar un estudiante
const toEstudianteInputDTO = (body) => ({
  nombre: body.nombre,
  apellido: body.apellido,
  dni: body.dni,
  email: body.email || null,
  fecha_nacimiento: body.fecha_nacimiento || null,
});

// Lo que se devuelve al front (oculta columnas internas como id_usuario_modificacion)
const toEstudianteOutputDTO = (row) => ({
  id: row.id_estudiante,
  nombre: row.nombres,
  apellido: row.apellido,
  dni: row.documento,
  email: row.email,
  fecha_nacimiento: row.fecha_nacimiento,
  activo: row.activo,
});

module.exports = { toEstudianteInputDTO, toEstudianteOutputDTO };
