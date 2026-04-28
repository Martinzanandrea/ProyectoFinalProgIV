
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Cursos from './pages/Cursos';
import Inscripciones from './pages/Inscripciones';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/inscripciones" element={<Inscripciones />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
