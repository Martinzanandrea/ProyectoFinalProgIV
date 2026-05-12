import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";

const inputCls =
  "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all";

const labelCls =
  "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const response = await register({
          usuario,
          contrasenia,
          nombre,
          apellido,
        });

        if (response.data.success) {
          setIsRegister(false);

          setError(
            "Usuario registrado correctamente. Ya puedes iniciar sesión.",
          );

          setUsuario("");
          setContrasenia("");
          setNombre("");
          setApellido("");
        }
      } else {
        const response = await login(usuario, contrasenia);

        if (response.data.success) {
          onLogin(response.data.token, response.data.user);

          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: "#f8fafc" }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div
          className="rounded-t-3xl px-8 pt-8 pb-12"
          style={{ background: "#0f2a5e" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              {isRegister ? (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isRegister ? "Crear cuenta" : "Bienvenido"}
              </h1>

              <p className="text-white/50 text-sm mt-0.5">
                {isRegister ? "Regístrate para comenzar" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="-mt-6 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          {/* Alert */}
          {error && (
            <div
              className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium border ${
                error.includes("correctamente")
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Nombre <span className="text-red-400">*</span>
                  </label>

                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={inputCls}
                    placeholder="Martín"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Apellido <span className="text-red-400">*</span>
                  </label>

                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className={inputCls}
                    placeholder="Zanandrea"
                    required
                  />
                </div>
              </div>
            )}

            {/* Usuario */}
            <div>
              <label className={labelCls}>
                Usuario <span className="text-red-400">*</span>
              </label>

              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className={inputCls}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className={labelCls}>
                Contraseña <span className="text-red-400">*</span>
              </label>

              <input
                type="password"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "#0f2a5e" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1e3a6e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#0f2a5e")
              }
            >
              {loading
                ? "Procesando..."
                : isRegister
                  ? "Crear cuenta"
                  : "Ingresar"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta aún?"}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isRegister ? "Iniciar sesión" : "Crear una cuenta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
