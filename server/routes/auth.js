// ============================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================

// Módulos necesarios
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Conexión a PostgreSQL
const crypto = require('crypto');  // Para hashear contraseñas

// ============================================================
// FUNCIÓN: hashear contraseña
// ============================================================
// Convierte "miPass123" en algo como "a1b2c3d4..."
// Por seguridad, las contraseñas no se guardan en texto plano
// ============================================================
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ============================================================
// LOGIN - Iniciar sesión
// ============================================================
// Recibe: { usuario, contrasenia }
// Proceso:
//   1. Hashea la contraseña recibida
//   2. Busca en la DB el usuario con esa contraseña hasheada
//   3. Verifica que esté activo (activo = 1)
// Devuelve: datos del usuario o error
// ============================================================
router.post('/login', async (req, res) => {
  const { usuario, contrasenia } = req.body;

  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    // COMPLEJO: Hashear contraseña para comparar con la DB
    const hashedPassword = hashPassword(contrasenia);
    
    // Busca usuario con nombre y contraseña hasheada
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

// ============================================================
// REGISTER - Registrar nuevo usuario
// ============================================================
// Recibe: { usuario, contrasenia, nombre, apellido }
// Proceso:
//   1. Verifica que el usuario no exista
//   2. Hashea la contraseña
//   3. Inserta en la DB con activo = 1
// Devuelve: datos del nuevo usuario o error
// ============================================================
router.post('/register', async (req, res) => {
  const { usuario, contrasenia, nombre, apellido } = req.body;

  if (!usuario || !contrasenia || !nombre || !apellido) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    // Verifica si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE nombre_usuario = $1',
      [usuario]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // COMPLEJO: Hashea la contraseña antes de guardar
    const hashedPassword = hashPassword(contrasenia);

    // Inserta nuevo usuario
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
