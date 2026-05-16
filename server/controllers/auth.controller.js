const authService = require("../services/auth.service");

// POST /api/auth/login
const login = async (req, res) => {
  const { usuario, contrasenia } = req.body;

  if (!usuario || !contrasenia) {
    return res
      .status(400)
      .json({ error: "Usuario y contraseña son requeridos" });
  }

  try {
    const result = await authService.login({ usuario, contrasenia });
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { usuario, contrasenia, nombre, apellido } = req.body;

  if (!usuario || !contrasenia || !nombre || !apellido) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const result = await authService.register({
      usuario,
      contrasenia,
      nombre,
      apellido,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
};

module.exports = { login, register };
