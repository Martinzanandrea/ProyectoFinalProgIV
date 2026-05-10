import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getTotalEstudiantes,
  getTotalCursos,
  getCursosActivos,
} from "../services/api";

const Dashboard = () => {
  const [totales, setTotales] = useState({ estudiantes: 0, cursos: 0 });
  const [cursosActivos, setCursosActivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estRes, curRes, actRes] = await Promise.all([
          getTotalEstudiantes(),
          getTotalCursos(),
          getCursosActivos(),
        ]);
        setTotales({
          estudiantes: estRes.data.total,
          cursos: curRes.data.total,
        });
        setCursosActivos(actRes.data.data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "150px",
          }}
        >
          <h3>Estudiantes</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {totales.estudiantes}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "150px",
          }}
        >
          <h3>Cursos</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {totales.cursos}
          </p>
        </div>
      </div>

      <h3>Cursos con Inscripción Abierta</h3>
      {cursosActivos.length === 0 ? (
        <p>No hay cursos con inscripción abierta</p>
      ) : (
        <ul>
          {cursosActivos.map((curso) => (
            // FIX: PK real es id_curso, no id
            <li key={curso.id_curso}>
              <Link to={`/cursos?id=${curso.id_curso}`}>{curso.nombre}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
