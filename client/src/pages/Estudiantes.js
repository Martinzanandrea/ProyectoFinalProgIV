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

  const [modal, setModal] = useState({
    open: false,
    mode: "",
    data: null,
  });

  const [form, setForm] = useState(FORM_EMPTY);

  const fetchEstudiantes = useCallback(async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const response = await getEstudiantes(pageNum, 10, searchTerm);

      setEstudiantes(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstudiantes(page, search);
  }, [page, search, fetchEstudiantes]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "—";

    const hoy = new Date();
    const nac = new Date(fechaNac);

    let edad = hoy.getFullYear() - nac.getFullYear();

    const m = hoy.getMonth() - nac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }

    return edad;
  };

  const openModal = (mode, data = null) => {
    setModal({
      open: true,
      mode,
      data,
    });

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
  };

  const closeModal = () => {
    setModal({
      open: false,
      mode: "",
      data: null,
    });

    setForm(FORM_EMPTY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modal.mode === "add") {
        await createEstudiante(form);
      } else if (modal.mode === "edit") {
        await updateEstudiante(modal.data.id, form);
      }

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
      {/* Header */}
      <div style={{ background: "#0f2a5e" }} className="px-8 pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Estudiantes
        </h1>

        <p className="text-white/40 text-xs mt-1">
          Gestión y administración de alumnos
        </p>
      </div>

      {/* Content */}
      <div className="px-6 md:px-8 -mt-4 flex-1 pb-10 space-y-5">
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchEstudiantes(1, search);
            }}
            className="flex-1 flex gap-3"
          >
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
            />

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "#0f2a5e" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1e3a6e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#0f2a5e")
              }
            >
              Buscar
            </button>
          </form>

          {/* Add */}
          <button
            onClick={() => openModal("add")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
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

        {/* Table */}
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

              <td className="px-5 py-3.5">
                <div className="font-semibold text-slate-800">
                  {est.apellido}, {est.nombre}
                </div>
              </td>

              <td className="px-5 py-3.5 text-sm font-mono text-slate-600">
                {est.dni}
              </td>

              <td className="px-5 py-3.5 text-sm text-slate-500 max-w-[220px]">
                <span className="truncate block">{est.email || "—"}</span>
              </td>

              <td className="px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  {calcularEdad(est.fecha_nacimiento)} años
                </span>
              </td>

              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  {/* View */}
                  <button
                    onClick={() => openModal("view", est)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    👁
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openModal("edit", est)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                  >
                    ✏️
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(est.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  >
                    🗑
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
          <div className="space-y-4">
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
                className="flex items-center justify-between py-3 border-b border-slate-100"
              >
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {label}
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nombre
                </label>

                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Apellido
                </label>

                <input
                  value={form.apellido}
                  onChange={(e) =>
                    setForm({ ...form, apellido: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  DNI
                </label>

                <input
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Fecha de nacimiento
              </label>

              <input
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fecha_nacimiento: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white"
              />
            </div>

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
