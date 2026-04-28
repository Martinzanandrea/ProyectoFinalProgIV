const express = require('express');
const router = express.Router();

// GET /api/inscripciones
router.get('/', async (req, res) => {
  res.json({ message: 'Listado de inscripciones' });
});

// POST /api/inscripciones
router.post('/', async (req, res) => {
  res.json({ message: 'Crear inscripción' });
});

// GET /api/inscripciones/:id
router.get('/:id', async (req, res) => {
  res.json({ message: 'Detalle de inscripción' });
});

// DELETE /api/inscripciones/:id
router.delete('/:id', async (req, res) => {
  res.json({ message: 'Eliminar inscripción' });
});

module.exports = router;
