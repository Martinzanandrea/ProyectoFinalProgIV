const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fcad_cursos',
  password: 'martin',
  port: 5432
});

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'estudiantes'")
  .then(r => {
    console.log('Columnas:', JSON.stringify(r.rows, null, 2));
    return pool.query('SELECT * FROM estudiantes LIMIT 5');
  })
  .then(r => {
    console.log('Datos:', JSON.stringify(r.rows, null, 2));
    pool.end();
  })
  .catch(e => {
    console.error('Error:', e.message);
    pool.end();
  });