import React from "react";

const DataTable = ({ columns, data, loading, pagination, onPageChange, children }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Scroll horizontal en mobile */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-100">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div
                        className="h-3 bg-slate-100 rounded animate-pulse"
                        style={{ width: `${55 + Math.random() * 35}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Sin resultados</p>
                  <p className="text-slate-400 text-xs mt-1">No hay registros que mostrar</p>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id_inscripcion ?? row.id_curso ?? row.id_estudiante ?? row.id ?? i}
                  className="hover:bg-slate-50 transition-colors duration-100"
                >
                  {children(row)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Página <span className="font-semibold text-slate-600">{pagination.page}</span> de{" "}
            <span className="font-semibold text-slate-600">{pagination.totalPages}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-semibold text-slate-600">{pagination.total}</span> registros
          </p>
          <div className="flex gap-2 self-end sm:self-auto">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600
                hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: "#0f2a5e" }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "#1e3a6e"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#0f2a5e"; }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;