// Configuración de la conexión a PostgreSQL
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fcad_cursos",
  password: "martin",
  port: 5432,
});

pool
  .connect()
  .then(() => console.log("Conexión a PostgreSQL exitosa"))
  .catch((err) => console.error("Error al conectar a PostgreSQL:", err));

module.exports = pool;
