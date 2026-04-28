const express = require('express');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  // Aquí irá la lógica de autenticación
  res.json({ message: 'Login endpoint' });
  res.send("<p>Login exitoso></p>");
});

module.exports = router;
