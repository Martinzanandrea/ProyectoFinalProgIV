const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/cursos - Listado con búsqueda y paginación
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM cursos';
    let countQuery = 'SELECT COUNT(*) FROM cursos';
    let params = [];
    let countParams = [];

    if (search) {
      query += ' WHERE nombre ILIKE $1 OR descripcion ILIKE $1';
      countQuery += ' WHERE nombre ILIKE $1 OR descripcion ILIKE $1';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ' ORDER BY id LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/activos - Cursos activos para el dashboard
router.get('/activos', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cursos WHERE estado = 'activo' ORDER BY id LIMIT 5"
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/totales - Totales para el dashboard
router.get('/totales', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM cursos');
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cursos - Crear curso
router.post('/', async (req, res) => {
  const { nombre, descripcion, inscriptos_max, estado } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del curso es requerido' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO cursos (nombre, descripcion, inscriptos_max, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, inscriptos_max, estado || 'activo']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id - Ver curso
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cursos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cursos/:id - Editar curso
router.put('/:id', async (req, res) => {
  const { nombre, descripcion, inscriptos_max, estado } = req.body;

  try {
    const result = await pool.query(
      'UPDATE cursos SET nombre = $1, descripcion = $2, inscriptos_max = $3, estado = $4 WHERE id = $5 RETURNING *',
      [nombre, descripcion, inscriptos_max, estado, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cursos/:id - Eliminar curso
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cursos WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.json({ success: true, message: 'Curso eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id/diploma - Generar diploma del curso
router.get('/:id/diploma', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cursos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    // Devuelve los datos para generar el diploma
    res.json({ 
      success: true, 
      data: {
        curso: result.rows[0],
        fecha: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
