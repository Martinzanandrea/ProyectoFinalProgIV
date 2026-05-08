const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación
  if (err.status === 400) {
    return res.status(400).json({ error: err.message });
  }

  // Error de autenticación
  if (err.status === 401) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Error de no encontrado
  if (err.status === 404) {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }

  // Error genérico de base de datos
  if (err.code === '23505') {
    return res.status(400).json({ error: 'Registro duplicado. El DNI ya existe.' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'No se puede eliminar este registro, tiene dependencias.' });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
