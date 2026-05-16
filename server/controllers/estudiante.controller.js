const estudianteService = require("../services/estudiante.service");

// GET /api/estudiantes/totales
const getTotales = async (req, res) => {
  try {
    const result = await estudianteService.getTotales();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/estudiantes
const getEstudiantes = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || "";

  try {
    const result = await estudianteService.getEstudiantes({
      page,
      limit,
      search,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/estudiantes/:id
const getEstudianteById = async (req, res) => {
  try {
    const data = await estudianteService.getEstudianteById(req.params.id);
    if (!data)
      return res.status(404).json({ error: "Estudiante no encontrado" });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/estudiantes
const createEstudiante = async (req, res) => {
  const usuarioId = req.user?.id;
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const data = await estudianteService.createEstudiante(req.body, usuarioId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/estudiantes/:id
const updateEstudiante = async (req, res) => {
  const usuarioId = req.user?.id;
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const data = await estudianteService.updateEstudiante(
      req.params.id,
      req.body,
      usuarioId,
    );
    if (!data)
      return res.status(404).json({ error: "Estudiante no encontrado" });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/estudiantes/:id
const deleteEstudiante = async (req, res) => {
  const usuarioId = req.user?.id;
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const deleted = await estudianteService.deleteEstudiante(
      req.params.id,
      usuarioId,
    );
    if (!deleted)
      return res.status(404).json({ error: "Estudiante no encontrado" });
    res.json({ success: true, message: "Estudiante eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTotales,
  getEstudiantes,
  getEstudianteById,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
};
