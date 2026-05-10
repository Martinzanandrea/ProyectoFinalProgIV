import React, { useState, useEffect } from "react";
import {
  getInscripciones,
  createInscripcion,
  deleteInscripcion,
  getEstudiantes,
  getCursos,
} from "../services/api";
import axios from "axios";

const Inscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [modal, setModal] = useState({ open: false, mode: "", data: null });
  const [form, setForm] = useState({
    id_estudiante: "",
    id_curso: "",
    fecha_hora_inscripcion: "",
  });

  const fetchInscripciones = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await getInscripciones(pageNum, 10);
      setInscripciones(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetchInscripciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [estRes, curRes] = await Promise.all([
        getEstudiantes(1, 1000, ""),
        getCursos(1, 1000, ""),
      ]);
      setEstudiantes(estRes.data.data || []);
      setCursos(
        (curRes.data.data || []).filter((c) => Number(c.id_curso_estado) === 2),
      );
    } catch (err) {
      console.error("Error fetchOptions:", err);
    }
  };

  useEffect(() => {
    fetchInscripciones(page);
  }, [page]);

  const openModal = (mode, data = null) => {
    if (mode === "add") {
      fetchOptions();
      setForm({ id_estudiante: "", id_curso: "", fecha_hora_inscripcion: "" });
    } else if (mode === "view" && data) {
      setForm({
        id_estudiante: data.id_estudiante ?? "",
        id_curso: data.id_curso ?? "",
        fecha_hora_inscripcion: data.fecha_hora_inscripcion ?? "",
      });
    }
    setModal({ open: true, mode, data });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "", data: null });
    setForm({ id_estudiante: "", id_curso: "", fecha_hora_inscripcion: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const estudianteId = Number(form.id_estudiante);
    const cursoId = Number(form.id_curso);
    if (!estudianteId || !cursoId) {
      alert("Debe seleccionar un estudiante y un curso");
      return;
    }
    try {
      const fechaISO = form.fecha_hora_inscripcion
        ? new Date(form.fecha_hora_inscripcion).toISOString()
        : new Date().toISOString();
      await createInscripcion({
        id_estudiante: estudianteId,
        id_curso: cursoId,
        fecha_hora_inscripcion: fechaISO,
      });
      closeModal();
      fetchInscripciones(page);
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear inscripción");
      console.error("Error createInscripcion:", err.response || err);
    }
  };

  const handleCancelInscripcion = async () => {
    try {
      // solo si empezó a completar algo
      if (form.id_estudiante && form.id_curso) {
        const fechaISO = form.fecha_hora_inscripcion
          ? new Date(form.fecha_hora_inscripcion).toISOString()
          : new Date().toISOString();

        await createInscripcion({
          id_estudiante: Number(form.id_estudiante),
          id_curso: Number(form.id_curso),
          fecha_hora_inscripcion: fechaISO,
          id_inscripcion_estado: 2, // cancelada
        });

        fetchInscripciones(page);
      }

      closeModal();
    } catch (err) {
      console.error("Error guardando inscripción cancelada:", err);
      alert("Error al cancelar inscripción");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta inscripción?")) {
      try {
        await deleteInscripcion(id);
        fetchInscripciones(page);
      } catch (err) {
        alert(err.response?.data?.error || "Error al eliminar");
      }
    }
  };

  const handleDiploma = async (id_inscripcion) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:3001/api/inscripciones/${id_inscripcion}/diploma`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;

      link.setAttribute(
        "download",
        `diploma_inscripcion_${id_inscripcion}.pdf`,
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error descargando diploma:", error);
    }
  };

  return (
    <div>
      <h2>Inscripciones</h2>

      <button
        onClick={() => openModal("add")}
        style={{ marginBottom: "20px", padding: "8px 16px" }}
      >
        + Nueva Inscripción
      </button>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((ins) => (
              <tr key={ins.id_inscripcion}>
                <td>{ins.id_inscripcion}</td>
                <td>
                  {ins.estudiante_apellido}, {ins.estudiante_nombre}
                </td>
                <td>{ins.curso_nombre}</td>
                <td>
                  {new Date(ins.fecha_hora_inscripcion).toLocaleDateString()}
                </td>
                <td>
                  {ins.id_inscripcion_estado === 1 ? "Confirmada" : "Cancelada"}
                </td>
                <td>
                  <button onClick={() => openModal("view", ins)}>Ver</button>{" "}
                  <button onClick={() => handleDelete(ins.id_inscripcion)}>
                    Eliminar
                  </button>{" "}
                  <button onClick={() => handleDiploma(ins.id_inscripcion)}>
                    📄 Diploma PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 10px" }}>
          Página {pagination.page} de {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          disabled={page >= pagination.totalPages}
        >
          Siguiente
        </button>
      </div>

      {modal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "400px",
            }}
          >
            <h3>
              {modal.mode === "add" ? "Nueva Inscripción" : "Ver Inscripción"}
            </h3>

            {modal.mode === "view" ? (
              <div>
                <p>
                  <strong>Estudiante:</strong> {modal.data.estudiante_apellido},{" "}
                  {modal.data.estudiante_nombre}
                </p>
                <p>
                  <strong>Curso:</strong> {modal.data.curso_nombre}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(
                    modal.data.fecha_hora_inscripcion,
                  ).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Estudiante</label>
                  <br />
                  <select
                    value={form.id_estudiante}
                    onChange={(e) =>
                      setForm({ ...form, id_estudiante: e.target.value })
                    }
                    required
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="">Seleccionar estudiante</option>
                    {estudiantes.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.apellido}, {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <label>Curso</label>
                  <br />
                  <select
                    value={form.id_curso}
                    onChange={(e) =>
                      setForm({ ...form, id_curso: e.target.value })
                    }
                    required
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map((cur) => (
                      <option key={cur.id_curso} value={cur.id_curso}>
                        {cur.nombre} (Cupo: {cur.inscriptos_max ?? "sin límite"}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <label>Fecha de Inscripción</label>
                  <br />
                  <input
                    type="date"
                    value={form.fecha_hora_inscripcion}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fecha_hora_inscripcion: e.target.value,
                      })
                    }
                    style={{ padding: "8px", width: "100%" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ marginTop: "15px", padding: "8px 16px" }}
                >
                  Guardar
                </button>
              </form>
            )}

            <button
              onClick={() => {
                if (modal.mode === "add") {
                  handleCancelInscripcion();
                } else {
                  closeModal();
                }
              }}
              style={{ marginTop: "10px", padding: "8px 16px" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inscripciones;
