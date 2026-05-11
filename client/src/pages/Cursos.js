import React, { useState, useEffect, useCallback } from "react";
import DataTable from "../components/DataTable";
import CupoProgress from "../components/CupoProgress";
import Modal from "../components/Modal";
import {
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
  getInscriptosCurso,
} from "../services/api";

const ESTADOS = {
  1: { label: "Borrador", bg: "bg-slate-100", text: "text-slate-500" },
  2: { label: "Abierta", bg: "bg-emerald-100", text: "text-emerald-700" },
  3: { label: "Cerrada", bg: "bg-red-100", text: "text-red-600" },
  4: { label: "Eliminado", bg: "bg-slate-100", text: "text-slate-400" },
};

const FORM_EMPTY = {
  nombre: "",
  descripcion: "",
  inscriptos_max: "",
  id_curso_estado: 1,
  fecha_inicio: "",
  cantidad_horas: "",
};

// ─── Campos reutilizables del formulario ──────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white";

// ─── Formulario add/edit ──────────────────────────────────────────────────────
const CursoForm = ({ form, setForm, onSubmit, onClose, mode }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Field label="Nombre" required>
      <input
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        required
        className={inputCls}
        placeholder="Ej: Programación Web con React"
      />
    </Field>

    <Field label="Descripción">
      <textarea
        value={form.descripcion}
        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        rows={3}
        className={`${inputCls} resize-none`}
        placeholder="Descripción del curso"
      />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Cupo máximo">
        <input
          type="number"
          min={0}
          value={form.inscriptos_max}
          onChange={(e) => setForm({ ...form, inscriptos_max: e.target.value })}
          className={inputCls}
          placeholder="Sin límite"
        />
      </Field>
      <Field label="Cantidad de horas" required>
        <input
          type="number"
          min={1}
          value={form.cantidad_horas}
          onChange={(e) => setForm({ ...form, cantidad_horas: e.target.value })}
          required
          className={inputCls}
          placeholder="Ej: 40"
        />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Estado">
        <select
          value={form.id_curso_estado}
          onChange={(e) =>
            setForm({ ...form, id_curso_estado: Number(e.target.value) })
          }
          className={inputCls}
        >
          <option value={1}>Borrador</option>
          <option value={2}>Inscripción abierta</option>
          <option value={3}>Inscripción cerrada</option>
        </select>
      </Field>
      <Field label="Fecha de inicio" required>
        <input
          type="date"
          value={form.fecha_inicio}
          onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
          required
          className={inputCls}
        />
      </Field>
    </div>

    <div className="flex gap-2 pt-1">
      <button
        type="submit"
        className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
        style={{ background: "#0f2a5e" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#1e3a6e")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#0f2a5e")}
      >
        {mode === "add" ? "Crear curso" : "Guardar cambios"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        Cancelar
      </button>
    </div>
  </form>
);

// ─── Vista detalle (mode=view) ────────────────────────────────────────────────
const CursoView = ({ data }) => {
  const estado = ESTADOS[data.id_curso_estado];
  const rows = [
    ["Nombre", data.nombre],
    ["Descripción", data.descripcion || "—"],
    ["Cupo máximo", data.inscriptos_max ?? "Sin límite"],
    ["Horas", data.cantidad_horas],
    [
      "Fecha de inicio",
      data.fecha_inicio
        ? new Date(data.fecha_inicio).toLocaleDateString("es-AR")
        : "—",
    ],
  ];
  return (
    <div className="space-y-0">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <span className="text-sm font-semibold text-slate-800">{value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between py-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Estado
        </span>
        {estado && (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${estado.bg} ${estado.text}`}
          >
            {estado.label}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Modal inscriptos ─────────────────────────────────────────────────────────
const InscriptosModal = ({ data, loading }) => {
  if (loading)
    return (
      <div className="py-12 flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Cargando inscriptos...</p>
      </div>
    );
  if (!data) return null;

  const { inscriptos_actual, inscriptos_max, cupos_disponibles, estudiantes } =
    data;

  return (
    <div className="space-y-4">
      {/* Resumen de cupo */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Inscriptos", inscriptos_actual, "text-slate-800"],
          ["Cupo máximo", inscriptos_max ?? "∞", "text-slate-800"],
          [
            "Disponibles",
            cupos_disponibles ?? "∞",
            cupos_disponibles === 0 ? "text-red-500" : "text-emerald-600",
          ],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100"
          >
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {estudiantes.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Sin inscriptos confirmados
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["#", "Apellido y nombre", "Documento", "Email", "Fecha"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {estudiantes.map((est, idx) => (
                <tr
                  key={est.id_inscripcion}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {est.apellido}, {est.nombre}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {est.documento}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {est.email}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(est.fecha_hora_inscripcion).toLocaleDateString(
                      "es-AR",
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
  });
  const [modal, setModal] = useState({ open: false, mode: "", data: null });
  const [showInscriptos, setShowInscriptos] = useState(false);
  const [inscriptosData, setInscriptosData] = useState(null);
  const [inscriptosLoading, setInscriptosLoading] = useState(false);
  const [form, setForm] = useState(FORM_EMPTY);

  const fetchCursos = useCallback(async (pageNum = 1, term = "") => {
    setLoading(true);
    try {
      const res = await getCursos(pageNum, 10, term);
      setCursos(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCursos(page, search);
  }, [page, search, fetchCursos]);

  const openModal = (mode, data = null) => {
    setForm(
      data
        ? {
            nombre: data.nombre || "",
            descripcion: data.descripcion || "",
            inscriptos_max: data.inscriptos_max ?? "",
            id_curso_estado: data.id_curso_estado || 1,
            fecha_inicio: data.fecha_inicio
              ? new Date(data.fecha_inicio).toISOString().split("T")[0]
              : "",
            cantidad_horas: data.cantidad_horas || "",
          }
        : FORM_EMPTY,
    );
    setModal({ open: true, mode, data });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "", data: null });
    setForm(FORM_EMPTY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        inscriptos_max:
          form.inscriptos_max !== "" ? Number(form.inscriptos_max) : null,
        cantidad_horas: Number(form.cantidad_horas),
        id_curso_estado: Number(form.id_curso_estado),
      };
      if (modal.mode === "add") await createCurso(payload);
      if (modal.mode === "edit")
        await updateCurso(modal.data.id_curso, payload);
      closeModal();
      fetchCursos(page, search);
    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este curso?")) return;
    try {
      await deleteCurso(id);
      fetchCursos(page, search);
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar");
    }
  };

  const openInscriptos = async (id) => {
    setInscriptosData(null);
    setInscriptosLoading(true);
    setShowInscriptos(true);
    try {
      const res = await getInscriptosCurso(id);
      setInscriptosData(res.data.data);
    } catch {
      alert("Error al cargar inscriptos");
      setShowInscriptos(false);
    } finally {
      setInscriptosLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f8fafc" }}
    >
      {/* Page header */}
      <div style={{ background: "#0f2a5e" }} className="px-8 pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">Cursos</h1>
        <p className="text-white/40 text-xs mt-1">
          Administración de cursos y cupos
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 md:px-8 -mt-4 flex-1 pb-10 space-y-5">
        {/* Barra búsqueda + acción */}
        <div className="flex items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchCursos(1, search);
            }}
            className="flex flex-1 gap-2"
          >
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors bg-slate-600 hover:bg-slate-700"
            >
              Buscar
            </button>
          </form>

          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors flex-shrink-0"
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
            Nuevo curso
          </button>
        </div>

        {/* Tabla */}
        <DataTable
          columns={[
            "ID",
            "Nombre",
            "Descripción",
            "Cupo",
            "Estado",
            "Inicio",
            "Acciones",
          ]}
          data={cursos}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        >
          {(curso) => {
            const estado = ESTADOS[curso.id_curso_estado];
            return (
              <>
                <td className="px-5 py-3.5 text-xs font-mono text-slate-400">
                  {curso.id_curso}
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 max-w-[160px]">
                  <span className="truncate block">{curso.nombre}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-400 max-w-[180px]">
                  <span className="truncate block">
                    {curso.descripcion || "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <CupoProgress
                      actual={curso.inscriptos_actual ?? 0}
                      max={curso.inscriptos_max}
                    />
                    <button
                      onClick={() => openInscriptos(curso.id_curso)}
                      title="Ver inscriptos"
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
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
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {estado && (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${estado.bg} ${estado.text}`}
                    >
                      {estado.label}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                  {curso.fecha_inicio
                    ? new Date(curso.fecha_inicio).toLocaleDateString("es-AR")
                    : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openModal("view", curso)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                      title="Ver detalle"
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
                    <button
                      onClick={() => openModal("edit", curso)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Editar"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(curso.id_curso)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                      title="Eliminar"
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
                  </div>
                </td>
              </>
            );
          }}
        </DataTable>
      </div>

      {/* Modal — inscriptos */}
      <Modal
        isOpen={showInscriptos}
        onClose={() => {
          setShowInscriptos(false);
          setInscriptosData(null);
        }}
        title={
          inscriptosData
            ? `Inscriptos — ${inscriptosData.curso?.nombre ?? ""}`
            : "Inscriptos"
        }
        size="lg"
      >
        <InscriptosModal data={inscriptosData} loading={inscriptosLoading} />
      </Modal>

      {/* Modal — add / edit / view */}
      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={
          modal.mode === "add"
            ? "Nuevo curso"
            : modal.mode === "edit"
              ? "Editar curso"
              : "Detalle del curso"
        }
        size="md"
      >
        {modal.mode === "view" && modal.data ? (
          <CursoView data={modal.data} />
        ) : (
          <CursoForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={closeModal}
            mode={modal.mode}
          />
        )}
      </Modal>
    </div>
  );
};

export default Cursos;
