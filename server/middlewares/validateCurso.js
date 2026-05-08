const validateCurso = (req, res, next) => {
  const { nombre, descripcion, inscriptos_max, id_curso_estado } = req.body;

  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      error: "El nombre del curso es requerido y debe ser texto",
    });
  }

  if (descripcion && typeof descripcion !== "string") {
    return res.status(400).json({
      error: "La descripción debe ser texto",
    });
  }

  if (
    inscriptos_max !== undefined &&
    inscriptos_max !== null &&
    inscriptos_max !== ""
  ) {
    const max = parseInt(inscriptos_max, 10);

    if (Number.isNaN(max) || max < 0) {
      return res.status(400).json({
        error: "El cupo máximo debe ser un número entero positivo",
      });
    }

    req.body.inscriptos_max = max;
  } else {
    req.body.inscriptos_max = null;
  }

  if (
    id_curso_estado !== undefined &&
    id_curso_estado !== null &&
    id_curso_estado !== ""
  ) {
    const estado = parseInt(id_curso_estado, 10);

    if (Number.isNaN(estado) || estado < 1) {
      return res.status(400).json({
        error: "El estado del curso debe ser un entero válido",
      });
    }

    req.body.id_curso_estado = estado;
  } else {
    req.body.id_curso_estado = 1;
  }

  req.body.nombre = nombre.trim();

  if (descripcion) {
    req.body.descripcion = descripcion.trim();
  }

  next();
};

module.exports = validateCurso;
