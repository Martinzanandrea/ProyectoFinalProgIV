import React, { useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/*
        En mobile: hoja que sube desde abajo (full width, rounded top)
        En desktop: modal centrado con max-width
      */}
      <div
        className={`
          relative w-full bg-white shadow-2xl overflow-hidden
          rounded-t-2xl sm:rounded-2xl
          max-h-[92vh] sm:max-h-[90vh]
          ${sizes[size]}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          {/* Handle en mobile */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-200 rounded-full sm:hidden" />
          <h2 className="text-base font-bold text-slate-800 pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content con scroll si hace falta */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;