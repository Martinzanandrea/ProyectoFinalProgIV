import axios from "axios";

const API_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
});

// Adjunta el token JWT en cada request automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Si el token expiró o es inválido, limpia storage y redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ── Auth ─────────────────────────────────────────────────────
export const login = (usuario, contrasenia) =>
  api.post("/auth/login", { usuario, contrasenia });

export const register = (datos) => api.post("/auth/register", datos);

// ── Estudiantes ──────────────────────────────────────────────
export const getEstudiantes = (page = 1, limit = 10, search = "") =>
  api.get("/estudiantes", { params: { page, limit, search } });

export const getEstudiante = (id) => api.get(`/estudiantes/${id}`);

export const createEstudiante = (data) => api.post("/estudiantes", data);

export const updateEstudiante = (id, data) =>
  api.put(`/estudiantes/${id}`, data);

export const deleteEstudiante = (id) => api.delete(`/estudiantes/${id}`);

// FIX: el backend define /totales, no /stats/total
export const getTotalEstudiantes = () => api.get("/estudiantes/totales");

// ── Cursos ───────────────────────────────────────────────────
export const getCursos = (page = 1, limit = 10, search = "") =>
  api.get("/cursos", { params: { page, limit, search } });

export const getCurso = (id) => api.get(`/cursos/${id}`);

export const createCurso = (data) => api.post("/cursos", data);

export const updateCurso = (id, data) => api.put(`/cursos/${id}`, data);

export const deleteCurso = (id) => api.delete(`/cursos/${id}`);

// Estos tres endpoints están definidos en cursos-router.js
export const getTotalCursos = () => api.get("/cursos/stats/total");

export const getCursosActivos = () => api.get("/cursos/stats/activos");

export const getDiplomaCurso = (id) => api.get(`/cursos/${id}/diploma`);

// ── Inscripciones ────────────────────────────────────────────
export const getInscripciones = (page = 1, limit = 10) =>
  api.get("/inscripciones", { params: { page, limit } });

export const getInscripcion = (id) => api.get(`/inscripciones/${id}`);

export const createInscripcion = (data) => api.post("/inscripciones", data);

export const deleteInscripcion = (id) => api.delete(`/inscripciones/${id}`);

export const getDiplomaInscripcion = (id) =>
  api.get(`/inscripciones/${id}/diploma`);

export default api;
