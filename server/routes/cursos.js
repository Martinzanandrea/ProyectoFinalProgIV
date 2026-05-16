const express = require("express");
const router = express.Router();
const c = require("../controllers/curso.controller");

// ── Stats (antes de /:id para evitar conflictos) ──────────────
router.get("/stats/total", c.getStatsTotal);
router.get("/stats/activos", c.getStatsActivos);
router.get("/stats/inscriptos-totales", c.getStatsInscriptosTotales);

// ── Cursos ────────────────────────────────────────────────────
router.get("/", c.getCursos);
router.get("/:id/inscriptos", c.getInscriptos);
router.get("/:id/diploma", c.getDiploma);
router.get("/:id", c.getCursoById);
router.post("/", c.createCurso);
router.put("/:id", c.updateCurso);
router.delete("/:id", c.deleteCurso);

module.exports = router;
