import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Estudiantes from "./pages/Estudiantes";
import Cursos from "./pages/Cursos";
import Inscripciones from "./pages/Inscripciones";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token"),
  );

  const handleLogin = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}

        {/*
          Layout responsivo:
          - Desktop (md+): sidebar fijo de 224px (w-56), contenido con ml-56
          - Mobile: topbar fijo de 48px (h-12) + breadcrumb ~24px ≈ mt-16
        */}
        <main
          className={`flex-1 min-w-0 ${
            isAuthenticated ? "md:ml-56 mt-16 md:mt-0" : ""
          }`}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/estudiantes"
              element={
                isAuthenticated ? <Estudiantes /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/cursos"
              element={isAuthenticated ? <Cursos /> : <Navigate to="/login" />}
            />
            <Route
              path="/inscripciones"
              element={
                isAuthenticated ? <Inscripciones /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
