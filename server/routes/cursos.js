const express = require('express');
const router = express.Router();

// GET /api/cursos
router.get('/', async (req, res) => {
  res.json({ message: 'Listado de cursos' });
});

// POST /api/cursos
router.post('/', async (req, res) => {
  res.json({ message: 'Crear curso' });
});

// GET /api/cursos/:id
router.get('/:id', async (req, res) => {
  res.json({ message: 'Detalle de curso' });
});

// PUT /api/cursos/:id
router.put('/:id', async (req, res) => {
  res.json({ message: 'Actualizar curso' });
});

// DELETE /api/cursos/:id
router.delete('/:id', async (req, res) => {
  res.json({ message: 'Eliminar curso' });
});

module.exports = router;
