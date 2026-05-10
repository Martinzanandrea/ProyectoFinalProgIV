import React, { useState, useEffect } from "react";
import {
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
  getDiplomaCurso,
  getInscriptosCurso,
} from "../services/api";

const ESTADOS = {
  1: "Borrador",
  2: "Inscripción Abierta",
  3: "Inscripción Cerrada",
  4: "Eliminado",
};

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [modal, setModal] = useState({ open: false, mode: "", data: null });
  const [modalInscriptos, setModalInscriptos] = useState({
    open: false,
    data: null,
    loading: false,
  });
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    inscriptos_max: 0,
    id_curso_estado: 1,
    fecha_inicio: null,
    cantidad_horas: 0,
  });

  const fetchCursos = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await getCursos(pageNum, 10, searchTerm);
      setCursos(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos(page, search);
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCursos(1, search);
  };

  const openModal = (mode, data = null) => {
    setModal({ open: true, mode, data });
    setForm(
      data || {
        nombre: "",
        descripcion: "",
        inscriptos_max: 0,
        id_curso_estado: 1,
        fecha_inicio: null,
        cantidad_horas: 0,
      },
    );
  };

  const closeModal = () => {
    setModal({ open: false, mode: "", data: null });
    setForm({
      nombre: "",
      descripcion: "",
      inscriptos_max: 0,
      id_curso_estado: 1,
      fecha_inicio: null,
      cantidad_horas: 0,
    });
  };

  // Abrir modal de inscriptos
  const openInscriptos = async (id) => {
    setModalInscriptos({ open: true, data: null, loading: true });
    try {
      const res = await getInscriptosCurso(id);
      setModalInscriptos({ open: true, data: res.data.data, loading: false });
    } catch (err) {
      console.error("Error completo:", err.response); // ← agregá esto
      alert("Error al cargar inscriptos");
      setModalInscriptos({ open: false, data: null, loading: false });
    }
  };

  const closeInscriptos = () =>
    setModalInscriptos({ open: false, data: null, loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        inscriptos_max:
          form.inscriptos_max !== null ? Number(form.inscriptos_max) : null,
      };
      if (modal.mode === "add") {
        await createCurso(data);
      } else if (modal.mode === "edit") {
        await updateCurso(modal.data.id_curso, data);
      }
      closeModal();
      fetchCursos(page, search);
    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este curso?")) {
      try {
        await deleteCurso(id);
        fetchCursos(page, search);
      } catch (err) {
        alert(err.response?.data?.error || "Error al eliminar");
      }
    }
  };

  const handleDiploma = async (id) => {
    try {
      const response = await getDiplomaCurso(id);
      const curso = response.data.data.curso;
      const contenido = `DIPLOMA\n\nSe certifica que el curso:\n"${curso.nombre}"\n\n${curso.descripcion || ""}\n\nFecha: ${new Date().toLocaleDateString()}`;
      alert(contenido);
      const ventana = window.open("", "_blank");
      ventana.document.write("<pre>" + contenido + "</pre>");
      ventana.print();
    } catch (err) {
      alert(err.response?.data?.error || "Error al generar diploma");
    }
  };

  // Barra de progreso de cupo
  const CupoBadge = ({ actual, max }) => {
    if (max === null || max === undefined) {
      return <span style={{ color: "#888" }}>{actual} / Sin límite</span>;
    }
    const pct = Math.min((actual / max) * 100, 100);
    const color = pct >= 100 ? "#e74c3c" : pct >= 80 ? "#f39c12" : "#27ae60";
    return (
      <div style={{ minWidth: 120 }}>
        <div style={{ fontSize: 13, marginBottom: 3 }}>
          <span style={{ color, fontWeight: "bold" }}>{actual}</span>
          <span style={{ color: "#888" }}> de {max} </span>
          <span style={{ color: "#aaa", fontSize: 11 }}>
            ({max - actual} libre{max - actual !== 1 ? "s" : ""})
          </span>
        </div>
        <div
          style={{
            background: "#eee",
            borderRadius: 4,
            height: 6,
            width: "100%",
          }}
        >
          <div
            style={{
              background: color,
              borderRadius: 4,
              height: 6,
              width: `${pct}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Cursos</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "300px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Buscar
        </button>
      </form>

      <button
        onClick={() => openModal("add")}
        style={{ marginBottom: "20px", padding: "8px 16px" }}
      >
        + Nuevo Curso
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
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Inscriptos / Cupo</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((cur) => (
              <tr key={cur.id_curso}>
                <td>{cur.id_curso}</td>
                <td>{cur.nombre}</td>
                <td>{cur.descripcion}</td>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CupoBadge
                      actual={cur.inscriptos_actual ?? 0}
                      max={cur.inscriptos_max}
                    />
                    <button
                      onClick={() => openInscriptos(cur.id_curso)}
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        cursor: "pointer",
                      }}
                      title="Ver listado de inscriptos"
                    >
                      Ver
                    </button>
                  </div>
                </td>
                <td>{ESTADOS[cur.id_curso_estado] || "Desconocido"}</td>
                <td>
                  {cur.fecha_inicio
                    ? new Date(cur.fecha_inicio).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <button onClick={() => openModal("view", cur)}>Ver</button>{" "}
                  <button onClick={() => openModal("edit", cur)}>Editar</button>{" "}
                  <button onClick={() => handleDelete(cur.id_curso)}>
                    Eliminar
                  </button>{" "}
                  <button onClick={() => handleDiploma(cur.id_curso)}>
                    Diploma
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

      {/* ── Modal inscriptos ── */}
      {modalInscriptos.open && (
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
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              minWidth: "600px",
              maxWidth: "800px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {modalInscriptos.loading ? (
              <p>Cargando inscriptos...</p>
            ) : modalInscriptos.data ? (
              <>
                <h3 style={{ marginTop: 0 }}>
                  Inscriptos — {modalInscriptos.data.curso.nombre}
                </h3>

                {/* Resumen de cupo */}
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 16,
                    padding: "12px 16px",
                    background: "#f8f9fa",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <span>
                    <strong>Inscriptos:</strong>{" "}
                    <span
                      style={{
                        color: "#2c3e50",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      {modalInscriptos.data.inscriptos_actual}
                    </span>
                  </span>
                  <span>
                    <strong>Cupo máximo:</strong>{" "}
                    {modalInscriptos.data.inscriptos_max ?? "Sin límite"}
                  </span>
                  <span>
                    <strong>Cupos disponibles:</strong>{" "}
                    <span
                      style={{
                        color:
                          modalInscriptos.data.cupos_disponibles === 0
                            ? "#e74c3c"
                            : "#27ae60",
                        fontWeight: "bold",
                      }}
                    >
                      {modalInscriptos.data.cupos_disponibles ?? "∞"}
                    </span>
                  </span>
                </div>

                {/* Tabla de estudiantes */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {modalInscriptos.data.estudiantes.length === 0 ? (
                    <p style={{ color: "#888" }}>
                      No hay inscriptos confirmados en este curso.
                    </p>
                  ) : (
                    <table
                      border="1"
                      cellPadding="6"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}
                    >
                      <thead style={{ background: "#f0f0f0" }}>
                        <tr>
                          <th>#</th>
                          <th>Apellido y Nombre</th>
                          <th>Documento</th>
                          <th>Email</th>
                          <th>Fecha Inscripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalInscriptos.data.estudiantes.map((est, idx) => (
                          <tr key={est.id_inscripcion}>
                            <td style={{ textAlign: "center" }}>{idx + 1}</td>
                            <td>
                              {est.apellido}, {est.nombre}
                            </td>
                            <td>{est.documento}</td>
                            <td>{est.email}</td>
                            <td>
                              {new Date(
                                est.fecha_hora_inscripcion,
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : null}

            <button
              onClick={closeInscriptos}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                alignSelf: "flex-end",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── Modal agregar/editar/ver curso ── */}
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
              {modal.mode === "add"
                ? "Nuevo Curso"
                : modal.mode === "edit"
                  ? "Editar Curso"
                  : "Ver Curso"}
            </h3>
            {modal.mode === "view" ? (
              <div>
                <p>
                  <strong>Nombre:</strong> {modal.data.nombre}
                </p>
                <p>
                  <strong>Descripción:</strong> {modal.data.descripcion}
                </p>
                <p>
                  <strong>Cupo Máximo:</strong>{" "}
                  {modal.data.inscriptos_max || "Sin límite"}
                </p>
                <p>
                  <strong>Estado:</strong> {ESTADOS[modal.data.id_curso_estado]}
                </p>
                <p>
                  <strong>Inicio:</strong>{" "}
                  {modal.data.fecha_inicio
                    ? new Date(modal.data.fecha_inicio).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Nombre</label>
                  <br />
                  <input
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Descripción</label>
                  <br />
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Cupo Máximo</label>
                  <br />
                  <input
                    type="number"
                    value={form.inscriptos_max ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        inscriptos_max:
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div>
                  <label>Estado</label>
                  <br />
                  <select
                    value={form.id_curso_estado}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        id_curso_estado: Number(e.target.value),
                      })
                    }
                  >
                    <option value={2}>Inscripcion Abierta</option>
                    <option value={3}>Inscripcion Cerrada</option>
                    <option value={1}>Borrador</option>
                    <option value={4}>Eliminado</option>
                  </select>
                </div>
                <div>
                  <label>Fecha Inicio</label>
                  <br />
                  <input
                    type="date"
                    value={form.fecha_inicio || ""}
                    onChange={(e) =>
                      setForm({ ...form, fecha_inicio: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Cantidad horas</label>
                  <br />
                  <input
                    type="number"
                    value={form.cantidad_horas}
                    onChange={(e) =>
                      setForm({ ...form, cantidad_horas: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  style={{ marginTop: "10px", padding: "8px 16px" }}
                >
                  Guardar
                </button>
              </form>
            )}
            <button
              onClick={closeModal}
              style={{ marginTop: "10px", padding: "8px 16px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cursos;
