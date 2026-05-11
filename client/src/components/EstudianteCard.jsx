import React from "react";

const EstudianteCard = ({ estudiante, onEdit, onDelete }) => {
  const initials = `${estudiante.nombre?.charAt(0) ?? ""}${estudiante.apellido?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-150 p-5">
      <div className="flex items-start gap-4">

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "#0f2a5e" }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm truncate leading-tight">
            {estudiante.nombre} {estudiante.apellido}
          </h4>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">#{estudiante.id}</p>

          <div className="mt-2.5 space-y-1.5">
            {estudiante.email && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{estudiante.email}</span>
              </div>
            )}
            {estudiante.dni && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span className="font-mono">{estudiante.dni}</span>
              </div>
            )}
            {estudiante.fecha_nacimiento && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(estudiante.fecha_nacimiento).toLocaleDateString("es-AR")}
              </div>
            )}
          </div>
        </div>

        {/* Actions — visibles en hover */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          <button
            onClick={onEdit}
            title="Editar"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            title="Eliminar"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstudianteCard;