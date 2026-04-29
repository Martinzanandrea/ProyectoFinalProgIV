const pool = require('./db');

async function testLogin() {
  try {
    // Ver usuarios y sus contraseñas (si existen)
    const users = await pool.query('SELECT id_usuario, nombre_usuario, nombre, contrasenia FROM usuarios');
    console.log('Usuarios y contraseñas:');
    users.rows.forEach(u => console.log(`  - ${u.nombre_usuario}: "${u.contrasenia}"`));
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testLogin();