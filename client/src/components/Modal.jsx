const ESTADOS = {
  1: { label: "Confirmada", color: "from-emerald-500 to-emerald-600 bg-emerald-100 text-emerald-800" },
  2: { label: "Cancelada", color: "from-red-500 to-red-600 bg-red-100 text-red-800" },
};

const InscripcionCard = ({ inscripcion, onCancelar, onDelete, onDiploma }) => {
     if (!inscripcion) return null;

  const estado =
    ESTADOS[inscripcion.id_inscripcion_estado] || {
      label: "Desconocido",
      color: "#999",
    };
  const esCancelada = inscripcion.id_inscripcion_estado === 2;

  return (
    <div className={`group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 ${esCancelada ? 'border-red-200/50 bg-red-50/50' : 'border-emerald-200/50 bg-emerald-50/30'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${esCancelada ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
          <h4 className="text-2xl font-bold text-slate-900">
            {inscripcion.estudiante_apellido}, {inscripcion.estudiante_nombre}
          </h4>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${esCancelada ? 'bg-red-100 text-red-800 border-2 border-red-200' : 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200'}`}>
          {estado.label}
        </span>
      </div>

      {/* Detalles */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-slate-700">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-semibold">#{inscripcion.id_inscripcion}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {inscripcion.curso_nombre}
        </div>
        <div className="text-sm text-slate-500">
          📅 {new Date(inscripcion.fecha_hora_inscripcion).toLocaleDateString('es-AR')}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200/50">
        {!esCancelada ? (
          <>
            <button
              onClick={() => onDiploma(inscripcion.id_inscripcion)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 justify-center"
            >
              📄 Diploma PDF
            </button>
            <button
              onClick={() => onCancelar(inscripcion.id_inscripcion)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
            >
              ❌ Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => onDelete(inscripcion.id_inscripcion)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default InscripcionCard;