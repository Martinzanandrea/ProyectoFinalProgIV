const express = require("express");
const router = express.Router();
const pool = require("../db");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "clave_secreta_cambiar_en_produccion";
const JWT_EXPIRES_IN = "8h";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { usuario, contrasenia } = req.body;

  if (!usuario || !contrasenia) {
    return res
      .status(400)
      .json({ error: "Usuario y contraseña son requeridos" });
  }

  try {
    const hashedPassword = hashPassword(contrasenia);

    const result = await pool.query(
      `SELECT id_usuario, nombre_usuario, nombre
       FROM usuarios
       WHERE nombre_usuario = $1 AND contrasenia = $2 AND activo = 1`,
      [usuario, hashedPassword],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // El payload del token incluye el id — así req.user.id llega a todos los routers
    const token = jwt.sign(
      {
        id: user.id_usuario,
        usuario: user.nombre_usuario,
        nombre: user.nombre,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id_usuario,
        usuario: user.nombre_usuario,
        nombre: user.nombre,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { usuario, contrasenia, nombre, apellido } = req.body;

  if (!usuario || !contrasenia || !nombre || !apellido) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE nombre_usuario = $1",
      [usuario],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = hashPassword(contrasenia);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre_usuario, contrasenia, nombre, apellido, activo)
       VALUES ($1, $2, $3, $4, 1)
       RETURNING id_usuario, nombre_usuario, nombre, apellido`,
      [usuario, hashedPassword, nombre, apellido],
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id_usuario,
        usuario: user.nombre_usuario,
        nombre: user.nombre,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id_usuario,
        usuario: user.nombre_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
