import React, { useState, useEffect, useCallback } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import {
  getEstudiantes,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
} from "../services/api";

const FORM_EMPTY = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  fecha_nacimiento: "",
};

const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
  });
  const [modal, setModal] = useState({ open: false, mode: "", data: null });
  const [form, setForm] = useState(FORM_EMPTY);

  const fetchEstudiantes = useCallback(async (pageNum = 1, term = "") => {
    setLoading(true);
    try {
      const res = await getEstudiantes(pageNum, 10, term);
      setEstudiantes(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstudiantes(page, search);
  }, [page, search, fetchEstudiantes]);

  const formatDateForInput = (d) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "—";
    const hoy = new Date(),
      nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const openModal = (mode, data = null) => {
    setForm(
      data
        ? {
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            dni: data.dni || "",
            email: data.email || "",
            fecha_nacimiento: formatDateForInput(data.fecha_nacimiento),
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
      if (modal.mode === "add") await createEstudiante(form);
      if (modal.mode === "edit") await updateEstudiante(modal.data.id, form);
      closeModal();
      fetchEstudiantes(page, search);
    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este estudiante?")) return;
    try {
      await deleteEstudiante(id);
      fetchEstudiantes(page, search);
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar");
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
          Estudiantes
        </h1>
        <p className="text-white/40 text-xs mt-1">
          Gestión y administración de alumnos
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
              fetchEstudiantes(1, search);
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
                placeholder="Buscar por nombre, apellido o DNI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 transition-colors"
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
            Nuevo estudiante
          </button>
        </div>

        {/* Tabla */}
        <DataTable
          columns={["#", "Estudiante", "DNI", "Email", "Edad", "Acciones"]}
          data={estudiantes}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        >
          {(est) => (
            <>
              <td className="px-5 py-3.5 text-xs font-mono text-slate-400">
                #{est.id}
              </td>
              <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                {est.apellido}, {est.nombre}
              </td>
              <td className="px-5 py-3.5 text-sm font-mono text-slate-500">
                {est.dni}
              </td>
              <td className="px-5 py-3.5 text-sm text-slate-400 max-w-[200px]">
                <span className="truncate block">{est.email || "—"}</span>
              </td>
              <td className="px-5 py-3.5">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  {calcularEdad(est.fecha_nacimiento)} años
                </span>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  {/* Ver */}
                  <button
                    onClick={() => openModal("view", est)}
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
                  {/* Editar */}
                  <button
                    onClick={() => openModal("edit", est)}
                    title="Editar"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(est.id)}
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
                </div>
              </td>
            </>
          )}
        </DataTable>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={
          modal.mode === "add"
            ? "Nuevo estudiante"
            : modal.mode === "edit"
              ? "Editar estudiante"
              : "Detalle del estudiante"
        }
        size="md"
      >
        {modal.mode === "view" && modal.data ? (
          /* Vista detalle */
          <div className="space-y-0">
            {[
              ["Nombre", modal.data.nombre],
              ["Apellido", modal.data.apellido],
              ["DNI", modal.data.dni],
              ["Email", modal.data.email || "—"],
              [
                "Fecha nacimiento",
                modal.data.fecha_nacimiento
                  ? new Date(modal.data.fecha_nacimiento).toLocaleDateString(
                      "es-AR",
                    )
                  : "—",
              ],
              ["Edad", `${calcularEdad(modal.data.fecha_nacimiento)} años`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {label}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Formulario add/edit */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombre" required>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className={inputCls}
                  placeholder="Ej: María"
                />
              </Field>
              <Field label="Apellido" required>
                <input
                  value={form.apellido}
                  onChange={(e) =>
                    setForm({ ...form, apellido: e.target.value })
                  }
                  required
                  className={inputCls}
                  placeholder="Ej: González"
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="DNI" required>
                <input
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  required
                  className={`${inputCls} font-mono`}
                  placeholder="Ej: 30123456"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="Ej: maria@email.com"
                />
              </Field>
            </div>

            <Field label="Fecha de nacimiento">
              <input
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) =>
                  setForm({ ...form, fecha_nacimiento: e.target.value })
                }
                className={inputCls}
              />
            </Field>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: "#0f2a5e" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1e3a6e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#0f2a5e")
                }
              >
                {modal.mode === "add" ? "Crear estudiante" : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Estudiantes;
