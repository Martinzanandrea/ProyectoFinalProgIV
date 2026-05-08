const validateInscripcion = (req, res, next) => {
  const { estudiante_id, curso_id } = req.body;
  if (!estudiante_id || !curso_id) {
    return res.status(400).json({ error: "Faltan datos de la inscripción" });
  }
  next();
};

module.exports = validateInscripcion;
