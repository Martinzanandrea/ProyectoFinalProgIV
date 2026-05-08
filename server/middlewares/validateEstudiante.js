const validateEstudiante = (req, res, next) => {
  const { nombre, apellido, dni, email, fecha_nacimiento } = req.body;

  // Validar campos requeridos
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'Nombre es requerido y debe ser texto' });
  }

  if (!apellido || typeof apellido !== 'string' || apellido.trim() === '') {
    return res.status(400).json({ error: 'Apellido es requerido y debe ser texto' });
  }

  if (!dni || typeof dni !== 'string' || dni.trim() === '') {
    return res.status(400).json({ error: 'DNI es requerido y debe ser texto' });
  }

  // Validar DNI - al menos 7 caracteres
  if (dni.trim().length < 7) {
    return res.status(400).json({ error: 'DNI debe tener al menos 7 caracteres' });
  }

  // Validar email si se proporciona
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email no es válido' });
    }
  }

  // Validar fecha_nacimiento si se proporciona
  if (fecha_nacimiento && fecha_nacimiento.trim() !== '') {
    const date = new Date(fecha_nacimiento);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Fecha de nacimiento no es válida' });
    }
    // Validar que la fecha no sea en el futuro
    if (date > new Date()) {
      return res.status(400).json({ error: 'Fecha de nacimiento no puede ser en el futuro' });
    }
  }

  // Sanitizar y pasar al siguiente middleware
  req.body.nombre = nombre.trim();
  req.body.apellido = apellido.trim();
  req.body.dni = dni.trim();
  if (email) {
    req.body.email = email.trim();
  }

  next();
};

module.exports = validateEstudiante;
