const cursoService = require("../services/curso.service");

const toInt = cursoService.toInt;

// GET /api/cursos
const getCursos = async (req, res) => {
  const page = toInt(req.query.page) || 1;
  const limit = toInt(req.query.limit) || 10;
  const search = req.query.search || "";

  try {
    const result = await cursoService.getCursos({ page, limit, search });
    res.json(result);
  } catch (err) {
    console.error("Error GET /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cursos/stats/total
const getStatsTotal = async (req, res) => {
  try {
    const result = await cursoService.getStatsTotal();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cursos/stats/activos
const getStatsActivos = async (req, res) => {
  try {
    const result = await cursoService.getStatsActivos();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cursos/stats/inscriptos-totales
const getStatsInscriptosTotales = async (req, res) => {
  try {
    const result = await cursoService.getStatsInscriptosTotales();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cursos/:id/inscriptos
const getInscriptos = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const data = await cursoService.getInscriptosByCurso(id);
    if (!data) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ data });
  } catch (err) {
    console.error("Error GET /api/cursos/:id/inscriptos:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cursos/:id
const getCursoById = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const data = await cursoService.getCursoById(id);
    if (!data) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cursos/:id/diploma
const getDiploma = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const curso = await cursoService.getCursoById(id);
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ success: true, data: { curso, fecha: new Date() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cursos
const createCurso = async (req, res) => {
  const { nombre, descripcion, fecha_inicio, cantidad_horas } = req.body;
  const usuarioId = toInt(req.user?.id);

  if (!nombre || !descripcion || !fecha_inicio || !cantidad_horas) {
    return res.status(400).json({
      error:
        "nombre, descripcion, fecha_inicio y cantidad_horas son requeridos",
    });
  }
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const data = await cursoService.createCurso(req.body, usuarioId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("Error POST /api/cursos:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/cursos/:id
const updateCurso = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const data = await cursoService.updateCurso(id, req.body, usuarioId);
    if (!data) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error PUT /api/cursos/:id:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/cursos/:id
const deleteCurso = async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const usuarioId = toInt(req.user?.id);
  if (!usuarioId)
    return res.status(401).json({ error: "Usuario no autenticado" });

  try {
    const deleted = await cursoService.deleteCurso(id, usuarioId);
    if (!deleted) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ success: true, message: "Curso eliminado" });
  } catch (err) {
    console.error("Error DELETE /api/cursos/:id:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCursos,
  getStatsTotal,
  getStatsActivos,
  getStatsInscriptosTotales,
  getInscriptos,
  getCursoById,
  getDiploma,
  createCurso,
  updateCurso,
  deleteCurso,
};
