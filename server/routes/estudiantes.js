const express = require('express');
const router = express.Router();
const pool = require('../db');
const validateEstudiante = require('../middlewares/validateEstudiante');

// GET /api/estudiantes/totales - Totales para el dashboard
router.get('/totales', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM estudiantes');
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/estudiantes - Listado con búsqueda y paginación
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = 'SELECT id_estudiante as id, documento as dni, apellido, nombres as nombre, email, fecha_nacimiento, activo FROM estudiantes WHERE activo = 1';
    let countQuery = 'SELECT COUNT(*) FROM estudiantes WHERE activo = 1';
    let params = [];
    let countParams = [];

    if (search) {
      query += ' AND (nombres ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1)';
      countQuery += ' AND (nombres ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1)';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ' ORDER BY id_estudiante LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limitNum, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const createEstudianteWithGeneratedId = async ({ nombre, apellido, dni, email, fecha_nacimiento }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE estudiantes IN EXCLUSIVE MODE');

    const idResult = await client.query(
      'SELECT COALESCE(MAX(id_estudiante), 0) + 1 AS next_id FROM estudiantes'
    );
    const nextId = idResult.rows[0].next_id;

    const result = await client.query(
      'INSERT INTO estudiantes (id_estudiante, nombres, apellido, documento, email, fecha_nacimiento, activo, id_usuario_modificacion, fecha_hora_modificacion) VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), 1, 1, NOW()) RETURNING *',
      [nextId, nombre, apellido, dni, email || null, fecha_nacimiento || null]
    );

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// POST /api/estudiantes - Crear estudiante
router.post('/', validateEstudiante, async (req, res) => {
  const { nombre, apellido, dni, email, fecha_nacimiento } = req.body;

  try {
    const result = await createEstudianteWithGeneratedId({ nombre, apellido, dni, email, fecha_nacimiento });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/estudiantes/:id - Ver estudiante
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_estudiante as id, documento as dni, apellido, nombres as nombre, email, fecha_nacimiento, activo FROM estudiantes WHERE id_estudiante = $1 AND activo = 1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/estudiantes/:id - Editar estudiante
router.put('/:id', validateEstudiante, async (req, res) => {
  const { nombre, apellido, dni, email, fecha_nacimiento } = req.body;

  try {
    const result = await pool.query(
      'UPDATE estudiantes SET nombres = $1, apellido = $2, documento = $3, email = $4, fecha_nacimiento = COALESCE($5, fecha_nacimiento), id_usuario_modificacion = 1, fecha_hora_modificacion = NOW() WHERE id_estudiante = $6 RETURNING *',
      [nombre, apellido, dni, email || null, fecha_nacimiento || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/estudiantes/:id - Eliminar estudiante
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE estudiantes SET activo = 0, id_usuario_modificacion = 1, fecha_hora_modificacion = NOW() WHERE id_estudiante = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ success: true, message: 'Estudiante eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
