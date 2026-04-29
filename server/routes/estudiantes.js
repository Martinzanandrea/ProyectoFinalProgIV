const express = require('express');
const router = express.Router();
const pool = require('../db');

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
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM estudiantes';
    let countQuery = 'SELECT COUNT(*) FROM estudiantes';
    let params = [];
    let countParams = [];

    if (search) {
      query += ' WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR dni ILIKE $1';
      countQuery += ' WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR dni ILIKE $1';
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

// POST /api/estudiantes - Crear estudiante
router.post('/', async (req, res) => {
  const { nombre, apellido, dni, email, telefono } = req.body;

  if (!nombre || !apellido || !dni) {
    return res.status(400).json({ error: 'Nombre, apellido y DNI son requeridos' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO estudiantes (nombre, apellido, dni, email, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, apellido, dni, email, telefono]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/estudiantes/:id - Ver estudiante
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudiantes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/estudiantes/:id - Editar estudiante
router.put('/:id', async (req, res) => {
  const { nombre, apellido, dni, email, telefono } = req.body;

  try {
    const result = await pool.query(
      'UPDATE estudiantes SET nombre = $1, apellido = $2, dni = $3, email = $4, telefono = $5 WHERE id = $6 RETURNING *',
      [nombre, apellido, dni, email, telefono, req.params.id]
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
    const result = await pool.query('DELETE FROM estudiantes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ success: true, message: 'Estudiante eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
