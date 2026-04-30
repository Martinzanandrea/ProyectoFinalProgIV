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
    let query = 'SELECT id_estudiante as id, documento as dni, apellido, nombres as nombre, email, fecha_nacimiento, activo FROM estudiantes';
    let countQuery = 'SELECT COUNT(*) FROM estudiantes';
    let params = [];
    let countParams = [];

    if (search) {
      query += ' WHERE nombres ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1';
      countQuery += ' WHERE nombres ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ' ORDER BY id_estudiante LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
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
      'INSERT INTO estudiantes (nombres, apellido, documento, email, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, apellido, dni, email, null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/estudiantes/:id - Ver estudiante
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_estudiante as id, documento as dni, apellido, nombres as nombre, email, fecha_nacimiento, activo FROM estudiantes WHERE id_estudiante = $1', [req.params.id]);
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
      'UPDATE estudiantes SET nombres = $1, apellido = $2, documento = $3, email = $4 WHERE id_estudiante = $5 RETURNING *',
      [nombre, apellido, dni, email, req.params.id]
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
    const result = await pool.query('DELETE FROM estudiantes WHERE id_estudiante = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ success: true, message: 'Estudiante eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
