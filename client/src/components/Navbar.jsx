import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "../assets/LOGO-fcad.png";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/estudiantes", label: "Estudiantes", icon: "👨‍🎓" },
  { to: "/cursos", label: "Cursos", icon: "📚" },
  { to: "/inscripciones", label: "Inscripciones", icon: "📝" },
];

// ─── Subcomponente: ítem de navegación ───────────────────────────────────────
const NavItem = ({ link, active, onClick }) => (
  <Link
    to={link.to}
    onClick={onClick}
    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
      ${
        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/7 hover:text-white/90"
      }`}
  >
    {/* Indicador de ruta activa */}
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-blue-400 rounded-r-full" />
    )}

    {/* Ícono con contenedor */}
    <span
      className={`w-[30px] h-[30px] flex items-center justify-center rounded-md text-sm flex-shrink-0 transition-colors
        ${active ? "bg-blue-400/20" : "bg-white/6"}`}
    >
      {link.icon}
    </span>

    <span>{link.label}</span>
  </Link>
);

// ─── Subcomponente: botón de acción (topbar) ──────────────────────────────────
const IconBtn = ({ children, badge = false }) => (
  <button className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white/7 text-white/70 hover:bg-white/12 hover:text-white transition-all">
    {children}
    {badge && (
      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full border-[1.5px] border-[#0f2a5e]" />
    )}
  </button>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const Navbar = ({
  onLogout,
  userName = "Admin",
  userRole = "Administrador",
}) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentLabel = links.find((l) => isActive(l.to))?.label ?? "Panel";

  return (
    <>
      {/* ── SIDEBAR — desktop ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-56 z-50 shadow-xl"
        style={{ background: "#0f2a5e" }}
      >
        {/* Logo / branding */}
        <div className="px-5 py-5 border-b border-white/8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src={logo}
              alt="FCAD - UNER"
              className="h-8 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>
          <p className="text-white/35 text-[10px] mt-3 font-semibold tracking-widest uppercase">
            Gestión Académica
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[9.5px] font-semibold tracking-widest text-white/30 uppercase px-3 pb-2 pt-1">
            Principal
          </p>
          {links.map((link) => (
            <NavItem key={link.to} link={link} active={isActive(link.to)} />
          ))}
        </nav>

        {/* Footer: usuario + logout */}
        <div className="px-3 pb-4 pt-3 border-t border-white/8 flex flex-col gap-1">
          {/* Tarjeta de usuario */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/7 transition-all cursor-default">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-semibold text-white truncate leading-tight">
                {userName}
              </p>
              <p className="text-[10px] text-white/40 truncate leading-tight">
                {userRole}
              </p>
            </div>
          </div>

          {/* Botón logout */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium text-white/45 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>

      {/* ── TOPBAR — mobile ───────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 shadow-lg"
        style={{ background: "#0f2a5e" }}
      >
        {/* Barra principal */}
        <div className="flex items-center justify-between px-4 h-13">
          <Link to="/dashboard">
            <img
              src={logo}
              alt="FCAD - UNER"
              className="h-7 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>

          <div className="flex items-center gap-2">
            {/* Acciones rápidas */}
            <IconBtn badge>
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </IconBtn>

            {/* Hamburguesa / X */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/7 text-white/70 hover:bg-white/12 hover:text-white transition-all"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? (
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {!menuOpen && (
          <div className="flex items-center gap-1.5 px-4 pb-2 text-[11px] text-white/40">
            <span>Inicio</span>
            <svg
              className="w-3 h-3"
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
            <span className="text-white/80 font-semibold">{currentLabel}</span>
          </div>
        )}

        {/* Menú desplegable */}
        {menuOpen && (
          <div className="border-t border-white/8 px-3 py-3 flex flex-col gap-0.5">
            {links.map((link) => (
              <NavItem
                key={link.to}
                link={link}
                active={isActive(link.to)}
                onClick={() => setMenuOpen(false)}
              />
            ))}

            {/* Separador + usuario */}
            <div className="flex items-center gap-2.5 px-3 py-2 mt-2 border-t border-white/8 cursor-default">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-white/40 leading-tight">
                  {userRole}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium text-white/45 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Cerrar sesión
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
