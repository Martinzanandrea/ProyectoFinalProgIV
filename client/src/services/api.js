import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth
export const login = (usuario, contrasenia) => 
  api.post('/auth/login', { usuario, contrasenia });

// Estudiantes
export const getEstudiantes = (page, limit, search) => 
  api.get(`/estudiantes?page=${page}&limit=${limit}&search=${search}`);

export const getEstudiante = (id) => 
  api.get(`/estudiantes/${id}`);

export const createEstudiante = (data) => 
  api.post('/estudiantes', data);

export const updateEstudiante = (id, data) => 
  api.put(`/estudiantes/${id}`, data);

export const deleteEstudiante = (id) => 
  api.delete(`/estudiantes/${id}`);

export const getTotalEstudiantes = () => 
  api.get('/estudiantes/totales');

// Cursos
export const getCursos = (page, limit, search) => 
  api.get(`/cursos?page=${page}&limit=${limit}&search=${search}`);

export const getCurso = (id) => 
  api.get(`/cursos/${id}`);

export const createCurso = (data) => 
  api.post('/cursos', data);

export const updateCurso = (id, data) => 
  api.put(`/cursos/${id}`, data);

export const deleteCurso = (id) => 
  api.delete(`/cursos/${id}`);

export const getCursosActivos = () => 
  api.get('/cursos/activos');

export const getTotalCursos = () => 
  api.get('/cursos/totales');

export const getDiplomaCurso = (id) => 
  api.get(`/cursos/${id}/diploma`);

// Inscripciones
export const getInscripciones = (page, limit) => 
  api.get(`/inscripciones?page=${page}&limit=${limit}`);

export const getInscripcion = (id) => 
  api.get(`/inscripciones/${id}`);

export const createInscripcion = (data) => 
  api.post('/inscripciones', data);

export const deleteInscripcion = (id) => 
  api.delete(`/inscripciones/${id}`);

export const getDiplomaInscripcion = (id) => 
  api.get(`/inscripciones/${id}/diploma`);

export default api;