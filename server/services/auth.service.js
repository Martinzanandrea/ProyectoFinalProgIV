const pool = require("../db");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "clave_secreta_cambiar_en_produccion";
const JWT_EXPIRES_IN = "8h";

// ── Helpers ───────────────────────────────────────────────────

const hashPassword = (password) =>
  crypto.createHash("sha256").update(password).digest("hex");

const generateToken = (user) =>
  jwt.sign(
    { id: user.id_usuario, usuario: user.nombre_usuario, nombre: user.nombre },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

const toUserOutput = (user) => ({
  id: user.id_usuario,
  usuario: user.nombre_usuario,
  nombre: user.nombre,
  ...(user.apellido !== undefined && { apellido: user.apellido }),
});

// ── Service methods ───────────────────────────────────────────

/**
 * Valida credenciales y retorna token + datos del usuario.
 * Lanza error con .status si las credenciales son inválidas.
 */
const login = async ({ usuario, contrasenia }) => {
  const result = await pool.query(
    `SELECT id_usuario, nombre_usuario, nombre
     FROM usuarios
     WHERE nombre_usuario = $1 AND contrasenia = $2 AND activo = 1`,
    [usuario, hashPassword(contrasenia)],
  );

  if (result.rows.length === 0) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  const user = result.rows[0];
  return { token: generateToken(user), user: toUserOutput(user) };
};

/**
 * Registra un nuevo usuario y retorna token + datos.
 * Lanza error con .status si el usuario ya existe.
 */
const register = async ({ usuario, contrasenia, nombre, apellido }) => {
  const existing = await pool.query(
    "SELECT id_usuario FROM usuarios WHERE nombre_usuario = $1",
    [usuario],
  );
  if (existing.rows.length > 0) {
    const err = new Error("El usuario ya existe");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO usuarios (nombre_usuario, contrasenia, nombre, apellido, activo)
     VALUES ($1, $2, $3, $4, 1)
     RETURNING id_usuario, nombre_usuario, nombre, apellido`,
    [usuario, hashPassword(contrasenia), nombre, apellido],
  );

  const user = result.rows[0];
  return { token: generateToken(user), user: toUserOutput(user) };
};

module.exports = { login, register };
