const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, contrasenia } = req.body;
  
  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const result = await pool.query(
      'SELECT id, usuario, nombre FROM usuarios WHERE usuario = $1 AND contrasenia = $2',
      [usuario, contrasenia]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ 
      success: true, 
      user: { 
        id: result.rows[0].id, 
        usuario: result.rows[0].usuario, 
        nombre: result.rows[0].nombre 
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
