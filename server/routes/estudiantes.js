const express = require('express');
const router = express.Router();

// GET /api/estudiantes
router.get('/', async (req, res) => {
  res.json({ message: 'Listado de estudiantes' });
});

// POST /api/estudiantes
router.post('/', async (req, res) => {
  res.json({ message: 'Crear estudiante' });
});

// GET /api/estudiantes/:id
router.get('/:id', async (req, res) => {
  res.json({ message: 'Detalle de estudiante' });
});

// PUT /api/estudiantes/:id
router.put('/:id', async (req, res) => {
  res.json({ message: 'Actualizar estudiante' });
});

// DELETE /api/estudiantes/:id
router.delete('/:id', async (req, res) => {
  res.json({ message: 'Eliminar estudiante' });
});

module.exports = router;
