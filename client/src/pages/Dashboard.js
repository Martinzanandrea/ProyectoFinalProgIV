import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getTotalEstudiantes,
  getTotalCursos,
  getCursosActivos,
  getTotalInscriptos,
} from "../services/api";

// ─── Skeleton loader para las stat cards ─────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100" />
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
    <div className="h-8 w-16 bg-slate-100 rounded" />
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, href, icon, accent }) => (
  <Link
    to={href}
    className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-150 p-5 flex flex-col gap-3 group"
  >
    <div className="flex items-center justify-between">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent.bg, color: accent.icon }}
      >
        {icon}
      </div>
      <svg
        className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-800 leading-none">
        {value.toLocaleString("es-AR")}
      </p>
    </div>
  </Link>
);

// ─── Barra de cupo ────────────────────────────────────────────────────────────
const CupoBar = ({ actual, max }) => {
  const pct = max ? Math.min((actual / max) * 100, 100) : 0;
  const color = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#10b981";
  const textColor =
    pct >= 100
      ? "text-red-600"
      : pct >= 80
        ? "text-amber-600"
        : "text-emerald-600";

  return (
    <div className="flex items-center gap-2.5">
      <span className={`font-semibold text-sm ${textColor}`}>{actual}</span>
      <span className="text-slate-300 text-xs">/</span>
      <span className="text-slate-500 text-sm">{max ?? "∞"}</span>
      {max && (
        <div className="w-16 bg-slate-100 rounded-full h-1 overflow-hidden">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const Dashboard = () => {
  const [totales, setTotales] = useState({
    estudiantes: 0,
    cursos: 0,
    inscriptos: 0,
    cursosActivos: 0,
  });
  const [cursosActivos, setCursosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [estRes, curRes, actRes, insRes] = await Promise.all([
          getTotalEstudiantes(),
          getTotalCursos(),
          getCursosActivos(),
          getTotalInscriptos(),
        ]);
        const activos = actRes.data.data || [];
        setTotales({
          estudiantes: estRes.data.total,
          cursos: curRes.data.total,
          inscriptos: insRes.data.total,
          cursosActivos: activos.length,
        });
        setCursosActivos(activos);
      } catch (err) {
        console.error("Error dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Estudiantes",
      value: totales.estudiantes,
      href: "/estudiantes",
      accent: { bg: "#eff6ff", icon: "#2563eb" },
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      label: "Cursos",
      value: totales.cursos,
      href: "/cursos",
      accent: { bg: "#ecfdf5", icon: "#059669" },
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      label: "Inscriptos activos",
      value: totales.inscriptos,
      href: "/inscripciones",
      accent: { bg: "#fffbeb", icon: "#d97706" },
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      label: "Cursos abiertos",
      value: totales.cursosActivos,
      href: "/cursos",
      accent: { bg: "#f5f3ff", icon: "#7c3aed" },
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    // ml-56 empuja el contenido para no quedar bajo el sidebar (w-56 del Navbar)
    <div className="min-h-screen flex flex-col">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ background: "#0f2a5e" }} className="px-8 pt-8 pb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <div className="mt-1 flex items-center gap-2 text-white/80">
          <p className="text-slate-400 text-xs mt-0.5 capitalize">{today}</p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-8 -mt-4 flex-1 pb-10 space-y-8">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            No se pudieron cargar los datos. Intentá recargar la página.
          </div>
        )}

        {/* Stats */}
        <section>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-6">
            Resumen general
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        </section>

        {/* Tabla cursos activos */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Inscripción abierta
              </p>
              {!loading && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {cursosActivos.length}
                </span>
              )}
            </div>
            <Link
              to="/cursos"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg" />
                ))}
              </div>
            ) : cursosActivos.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  No hay cursos con inscripción abierta
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Cambiá el estado de un curso para habilitarlo
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Curso", "Descripción", "Inicio", "Cupo", ""].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cursosActivos.map((curso) => (
                      <tr
                        key={curso.id_curso}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-[180px]">
                          <div className="truncate">{curso.nombre}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 max-w-[220px]">
                          <div className="truncate">
                            {curso.descripcion || "—"}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                          {curso.fecha_inicio
                            ? new Date(curso.fecha_inicio).toLocaleDateString(
                                "es-AR",
                              )
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <CupoBar
                            actual={curso.inscriptos_actual ?? 0}
                            max={curso.inscriptos_max}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            to="/inscripciones"
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                            style={{
                              background: "#0f2a5e",
                              color: "#fff",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#1e3a6e")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#0f2a5e")
                            }
                          >
                            Inscribir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
