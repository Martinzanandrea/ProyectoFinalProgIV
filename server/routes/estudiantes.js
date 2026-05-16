const express = require("express");
const router = express.Router();
const c = require("../controllers/estudiante.controller");
const validateEstudiante = require("../middlewares/validateEstudiante");

// ── Stats (antes de /:id para evitar conflictos) ──────────────
router.get("/totales", c.getTotales);

// ── Estudiantes ───────────────────────────────────────────────
router.get("/", c.getEstudiantes);
router.get("/:id", c.getEstudianteById);
router.post("/", validateEstudiante, c.createEstudiante);
router.put("/:id", validateEstudiante, c.updateEstudiante);
router.delete("/:id", c.deleteEstudiante);

module.exports = router;
