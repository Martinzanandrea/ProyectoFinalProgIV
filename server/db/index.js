// Configuración de la conexión a PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', 
  database: 'fcad_cursos', 
  password: 'martin', 
  port: 5432, 
});

module.exports = pool;