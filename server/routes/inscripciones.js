const express = require("express");
const router = express.Router();
const c = require("../controllers/inscripcion.controller");

router.get("/", c.getInscripciones);
router.get("/:id/diploma", c.getDiploma);
router.get("/:id", c.getInscripcionById);
router.post("/", c.createInscripcion);
router.patch("/:id/cancelar", c.cancelarInscripcion);
router.delete("/:id", c.deleteInscripcion);

module.exports = router;
