import React from "react";

const ESTADOS = {
  1: { label: "Confirmada", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  2: { label: "Cancelada",  bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-400"     },
};

const InscripcionCard = ({  inscripcion,
  onCancelar,
  onDelete,
  onDiploma,
}) => {
  if (!inscripcion) return null;

  const estado = ESTADOS[inscripcion.id_inscripcion_estado] ?? {
    label: "Desconocido",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  };
  const esCancelada = inscripcion.id_inscripcion_estado === 2;

  return (
    <div className={`bg-white rounded-xl border transition-all duration-150
      ${esCancelada
        ? "border-slate-200 opacity-75"
        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${estado.dot}`} />
          <h4 className="font-semibold text-slate-800 text-sm truncate">
            {inscripcion.estudiante_apellido}, {inscripcion.estudiante_nombre}
          </h4>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${estado.bg} ${estado.text}`}>
          {estado.label}
        </span>
      </div>

      {/* Detalles */}
      <div className="px-5 py-3.5 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="font-mono">#{inscripcion.id_inscripcion}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="truncate font-medium">{inscripcion.curso_nombre}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(inscripcion.fecha_hora_inscripcion).toLocaleDateString("es-AR")}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 py-3.5 border-t border-slate-100">
        {!esCancelada ? (
          <>
            <button
              onClick={() => onDiploma(inscripcion.id_inscripcion)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ background: "#0f2a5e" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e3a6e"}
              onMouseLeave={e => e.currentTarget.style.background = "#0f2a5e"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Diploma PDF
            </button>
            <button
              onClick={() => onCancelar(inscripcion.id_inscripcion)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => onDelete(inscripcion.id_inscripcion)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors w-full"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar inscripción
          </button>
        )}
      </div>
    </div>
  );
};

export default InscripcionCard;