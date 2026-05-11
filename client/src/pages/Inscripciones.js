import React, { useState, useEffect, useCallback } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import {
  getInscripciones,
  createInscripcion,
  deleteInscripcion,
  cancelarInscripcion,
  getEstudiantes,
  getCursos,
} from "../services/api";
import axios from "axios";

const ESTADOS = {
  1: {
    label: "Confirmada",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  2: {
    label: "Cancelada",
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

// ─── Fila de la tabla ─────────────────────────────────────────────────────────
const InscripcionRow = ({
  inscripcion,
  onCancelar,
  onDelete,
  onDiploma,
  onView,
}) => {
  const estado = ESTADOS[inscripcion.id_inscripcion_estado];
  const esCancelada = inscripcion.id_inscripcion_estado === 2;

  return (
    <>
      <td className="px-5 py-3.5 text-xs font-mono text-slate-400">
        #{inscripcion.id_inscripcion}
      </td>
      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
        {inscripcion.estudiante_apellido}, {inscripcion.estudiante_nombre}
      </td>
      <td className="px-5 py-3.5 text-sm text-slate-600 max-w-[200px]">
        <span className="truncate block">{inscripcion.curso_nombre}</span>
      </td>
      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
        {new Date(inscripcion.fecha_hora_inscripcion).toLocaleDateString(
          "es-AR",
        )}
      </td>
      <td className="px-5 py-3.5">
        {estado && (
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${estado.bg} ${estado.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
            {estado.label}
          </span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          {/* Ver detalle */}
          <button
            onClick={onView}
            title="Ver detalle"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          {!esCancelada && (
            <>
              {/* Diploma */}
              <button
                onClick={() => onDiploma(inscripcion.id_inscripcion)}
                title="Descargar diploma"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
              {/* Cancelar */}
              <button
                onClick={() => onCancelar(inscripcion.id_inscripcion)}
                title="Cancelar inscripción"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}

          {esCancelada && (
            <button
              onClick={() => onDelete(inscripcion.id_inscripcion)}
              title="Eliminar"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </td>
    </>
  );
};

// ─── Formulario nueva inscripción ─────────────────────────────────────────────
const InscripcionForm = ({ form, setForm, estudiantes, cursos, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-5">
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Estudiante
        </label>
        <select
          value={form.id_estudiante}
          onChange={(e) => setForm({ ...form, id_estudiante: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
          required
        >
          <option value="">Seleccionar estudiante...</option>
          {estudiantes.map((est) => (
            <option key={est.id_estudiante} value={est.id_estudiante}>
              {est.apellido}, {est.nombres} — {est.documento}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Curso abierto
        </label>
        <select
          value={form.id_curso}
          onChange={(e) => setForm({ ...form, id_curso: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
          required
        >
          <option value="">Seleccionar curso...</option>
          {cursos.map((cur) => (
            <option key={cur.id_curso} value={cur.id_curso}>
              {cur.nombre}
              {cur.inscriptos_max ? ` (Cupo: ${cur.inscriptos_max})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        Fecha de inscripción
        <span className="text-slate-400 font-normal ml-1 normal-case">
          (opcional — por defecto hoy)
        </span>
      </label>
      <input
        type="datetime-local"
        value={form.fecha_hora_inscripcion}
        onChange={(e) =>
          setForm({ ...form, fecha_hora_inscripcion: e.target.value })
        }
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
      />
    </div>

    <div className="pt-1">
      <button
        type="submit"
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
        style={{ background: "#0f2a5e" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#1e3a6e")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#0f2a5e")}
      >
        Confirmar inscripción
      </button>
    </div>
  </form>
);

// ─── Modal ver detalle ────────────────────────────────────────────────────────
const InscripcionView = ({ inscripcion }) => {
  if (!inscripcion) return null;
  const estado = ESTADOS[inscripcion.id_inscripcion_estado];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-3 border-b border-slate-100">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          ID
        </span>
        <span className="text-sm font-mono font-semibold text-slate-700">
          #{inscripcion.id_inscripcion}
        </span>
      </div>
      <div className="flex items-center justify-between py-3 border-b border-slate-100">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Estudiante
        </span>
        <span className="text-sm font-semibold text-slate-800">
          {inscripcion.estudiante_apellido}, {inscripcion.estudiante_nombre}
        </span>
      </div>
      <div className="flex items-center justify-between py-3 border-b border-slate-100">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Curso
        </span>
        <span className="text-sm font-semibold text-slate-800">
          {inscripcion.curso_nombre}
        </span>
      </div>
      <div className="flex items-center justify-between py-3 border-b border-slate-100">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Fecha
        </span>
        <span className="text-sm text-slate-600">
          {new Date(inscripcion.fecha_hora_inscripcion).toLocaleString("es-AR")}
        </span>
      </div>
      <div className="flex items-center justify-between py-3">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Estado
        </span>
        {estado && (
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${estado.bg} ${estado.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
            {estado.label}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const Inscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
  });
  const [modal, setModal] = useState({ open: false, mode: "", data: null });
  const [form, setForm] = useState({
    id_estudiante: "",
    id_curso: "",
    fecha_hora_inscripcion: "",
  });

  const fetchInscripciones = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getInscripciones(pageNum, 10);
      setInscripciones(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      console.error("Error options:", err);
    }
  };

  useEffect(() => {
    fetchInscripciones(page);
  }, [page, fetchInscripciones]);

  const openModal = (mode, data = null) => {
    if (mode === "add") {
      fetchOptions();
      setForm({ id_estudiante: "", id_curso: "", fecha_hora_inscripcion: "" });
    }
    setModal({ open: true, mode, data });
  };

  const closeModal = () => setModal({ open: false, mode: "", data: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Number(form.id_estudiante) || !Number(form.id_curso))
      return alert("Seleccioná estudiante y curso");
    try {
      const fechaISO = form.fecha_hora_inscripcion
        ? new Date(form.fecha_hora_inscripcion).toISOString()
        : new Date().toISOString();
      await createInscripcion({
        id_estudiante: Number(form.id_estudiante),
        id_curso: Number(form.id_curso),
        fecha_hora_inscripcion: fechaISO,
      });
      closeModal();
      fetchInscripciones(page);
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear");
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm("¿Cancelar esta inscripción?")) return;
    try {
      await cancelarInscripcion(id);
      fetchInscripciones(page);
    } catch {
      alert("Error al cancelar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar definitivamente esta inscripción?")) return;
    try {
      await deleteInscripcion(id);
      fetchInscripciones(page);
    } catch {
      alert("Error al eliminar");
    }
  };

  const handleDiploma = async (id_inscripcion) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/inscripciones/${id_inscripcion}/diploma`,
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `diploma_${id_inscripcion}.pdf`;
      link.click();
    } catch {
      alert("Error al generar el diploma");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f8fafc" }}
    >
      {/* Page header */}
      <div style={{ background: "#0f2a5e" }} className="px-8 pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Inscripciones
        </h1>
        <p className="text-white/40 text-xs mt-1">
          Gestión de inscripciones y diplomas
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 md:px-8 -mt-4 flex-1 pb-10 space-y-5">
        {/* Barra de acciones */}
        <div className="flex items-center justify-between">
          <div /> {/* espacio para filtros futuros */}
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "#0f2a5e" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e3a6e")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0f2a5e")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nueva inscripción
          </button>
        </div>

        {/* Tabla */}
        <DataTable
          columns={["#", "Estudiante", "Curso", "Fecha", "Estado", "Acciones"]}
          data={inscripciones}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        >
          {(inscripcion) => (
            <InscripcionRow
              inscripcion={inscripcion}
              onCancelar={handleCancelar}
              onDelete={handleDelete}
              onDiploma={handleDiploma}
              onView={() => openModal("view", inscripcion)}
            />
          )}
        </DataTable>
      </div>

      {/* Modal — nueva inscripción */}
      <Modal
        isOpen={modal.open && modal.mode === "add"}
        onClose={closeModal}
        title="Nueva inscripción"
        size="lg"
      >
        <InscripcionForm
          form={form}
          setForm={setForm}
          estudiantes={estudiantes}
          cursos={cursos}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* Modal — detalle */}
      <Modal
        isOpen={modal.open && modal.mode === "view"}
        onClose={closeModal}
        title="Detalle de inscripción"
      >
        <InscripcionView inscripcion={modal.data} />
      </Modal>
    </div>
  );
};

export default Inscripciones;
