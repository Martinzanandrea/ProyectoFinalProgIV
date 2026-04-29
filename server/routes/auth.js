const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

// Función para hashear contraseña con SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, contrasenia } = req.body;

  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    // Hashear la contraseña antes de buscar
    const hashedPassword = hashPassword(contrasenia);
    
    const result = await pool.query(
      'SELECT id_usuario, nombre_usuario, nombre FROM usuarios WHERE nombre_usuario = $1 AND contrasenia = $2 AND activo = 1',
      [usuario, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      success: true,
      user: {
        id: result.rows[0].id_usuario,
        usuario: result.rows[0].nombre_usuario,
        nombre: result.rows[0].nombre
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register - Registro de nuevos usuarios
router.post('/register', async (req, res) => {
  const { usuario, contrasenia, nombre, apellido } = req.body;

  if (!usuario || !contrasenia || !nombre || !apellido) {
    return res.status(400).json({ error: 'Usuario, contraseña, nombre y apellido son requeridos' });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE nombre_usuario = $1',
      [usuario]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = hashPassword(contrasenia);

    // Insertar nuevo usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nombre_usuario, contrasenia, nombre, apellido, activo) VALUES ($1, $2, $3, $4, 1) RETURNING id_usuario, nombre_usuario, nombre, apellido',
      [usuario, hashedPassword, nombre, apellido]
    );

    res.json({
      success: true,
      user: {
        id: result.rows[0].id_usuario,
        usuario: result.rows[0].nombre_usuario,
        nombre: result.rows[0].nombre,
        apellido: result.rows[0].apellido
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;