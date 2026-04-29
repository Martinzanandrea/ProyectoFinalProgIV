
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Cursos from './pages/Cursos';
import Inscripciones from './pages/Inscripciones';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/estudiantes" 
            element={isAuthenticated ? <Estudiantes /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cursos" 
            element={isAuthenticated ? <Cursos /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/inscripciones" 
            element={isAuthenticated ? <Inscripciones /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
