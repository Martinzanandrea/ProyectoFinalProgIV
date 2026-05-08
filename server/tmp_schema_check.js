const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fcad_cursos',
  password: 'martin',
  port: 5432,
});

(async () => {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'estudiantes';");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('ERR', err.message);
  } finally {
    await pool.end();
  }
})();
