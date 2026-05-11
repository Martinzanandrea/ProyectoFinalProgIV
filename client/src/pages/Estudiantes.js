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
  const [modal, setModal] = useState({ open: false, mode: "", data: null });
  const [form, setForm] = useState(FORM_EMPTY);

  const fetchEstudiantes = useCallback(async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await getEstudiantes(pageNum, 10, searchTerm);
      setEstudiantes(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error:", err);
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

  const openModal = (mode, data = null) => {
    setModal({ open: true, mode, data });
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
    setModal({ open: false, mode: "", data: null });
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
    if (window.confirm("¿Eliminar este estudiante?")) {
      try {
        await deleteEstudiante(id);
        fetchEstudiantes(page, search);
      } catch (err) {
        alert(err.response?.data?.error || "Error al eliminar");
      }
    }
  };

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "—";
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Franja institucional */}
      <div className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold">Gestión de Estudiantes</h2>
          <p className="text-blue-300 text-xs">Administración de alumnos</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Buscador + botón */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Buscar
            </button>
          </form>
          <button
            onClick={() => openModal("add")}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
          >
            + Nuevo Estudiante
          </button>
        </div>

        {/* Tabla */}
        <DataTable
          columns={[
            "ID",
            "Apellido y Nombre",
            "DNI",
            "Email",
            "Edad",
            "Acciones",
          ]}
          data={estudiantes}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        >
          {(est) => (
            <>
              <td className="px-6 py-4 text-sm font-mono text-slate-500">
                #{est.id}
              </td>
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900">
                  {est.apellido}, {est.nombre}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-mono text-slate-700">
                {est.dni}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                {est.email}
              </td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                  {calcularEdad(est.fecha_nacimiento)} años
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal("view", est)}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => openModal("edit", est)}
                    className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(est.id)}
                    className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all"
                  >
                    Eliminar
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
            ? "Nuevo Estudiante"
            : modal.mode === "edit"
              ? "Editar Estudiante"
              : "Detalle del Estudiante"
        }
        size="md"
      >
        {modal.mode === "view" && modal.data ? (
          <div className="space-y-4 text-sm">
            {[
              ["Nombre", modal.data.nombre],
              ["Apellido", modal.data.apellido],
              ["DNI", modal.data.dni],
              ["Email", modal.data.email],
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
                className="flex gap-4 py-3 border-b border-slate-100 last:border-0"
              >
                <span className="w-36 text-slate-500 font-medium shrink-0">
                  {label}
                </span>
                <span className="text-slate-800 font-semibold">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nombre *
                </label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Apellido *
                </label>
                <input
                  value={form.apellido}
                  onChange={(e) =>
                    setForm({ ...form, apellido: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  DNI *
                </label>
                <input
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) =>
                  setForm({ ...form, fecha_nacimiento: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition-all"
              >
                {modal.mode === "add" ? "Crear Estudiante" : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Estudiantes;
