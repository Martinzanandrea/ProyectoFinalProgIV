const inscripcionService = require("../services/inscripcion.service");

const toInt = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// GET /api/inscripciones
const getInscripciones = async (req, res) => {
  const page = toInt(req.query.page) || 1;
  const limit = toInt(req.query.limit) || 10;

  try {
    const result = await inscripcionService.getInscripciones({ page, limit });
    res.json(result);
  } catch (err) {
    console.error("Error GET /api/inscripciones:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/inscripciones/:id
const getInscripcionById = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const data = await inscripcionService.getInscripcionById(id);
    if (!data)
      return res.status(404).json({ error: "Inscripción no encontrada" });
    res.json({ data });
  } catch (err) {
    console.error("Error GET /api/inscripciones/:id", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/inscripciones
const createInscripcion = async (req, res) => {
  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  const { id_estudiante, id_curso } = req.body;
  if (!id_estudiante || !id_curso) {
    return res.status(400).json({ error: "Estudiante y curso son requeridos" });
  }

  try {
    const data = await inscripcionService.createInscripcion(
      req.body,
      usuarioId,
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    // El service lanza errores con .status para distinguir 400/404 de 500
    if (err.code === "23505" || err.message?.includes("ya está inscripto")) {
      return res
        .status(400)
        .json({ error: "El estudiante ya está inscripto en este curso" });
    }
    const status = err.status || 500;
    console.error("Error POST /api/inscripciones:", err.stack || err);
    res
      .status(status)
      .json({ error: err.message || "Error interno del servidor" });
  }
};

// PATCH /api/inscripciones/:id/cancelar
const cancelarInscripcion = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const data = await inscripcionService.cancelarInscripcion(id, usuarioId);
    if (!data) {
      return res
        .status(404)
        .json({ error: "Inscripción no encontrada o ya cancelada" });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error PATCH /api/inscripciones/:id/cancelar:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/inscripciones/:id
const deleteInscripcion = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const deleted = await inscripcionService.deleteInscripcion(id, usuarioId);
    if (!deleted)
      return res.status(404).json({ error: "Inscripción no encontrada" });
    res.json({ success: true, message: "Inscripción eliminada" });
  } catch (err) {
    console.error("Error DELETE /api/inscripciones/:id:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/inscripciones/:id/diploma
const getDiploma = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const found = await inscripcionService.generarDiploma(id, res);
    if (!found) {
      return res
        .status(404)
        .json({ error: "Inscripción no encontrada o no confirmada" });
    }
  } catch (err) {
    console.error("Error GET /api/inscripciones/:id/diploma", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = {
  getInscripciones,
  getInscripcionById,
  createInscripcion,
  cancelarInscripcion,
  deleteInscripcion,
  getDiploma,
};
