import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav style={{ padding: '1rem', background: '#daa9a9' }}>
    <Link to="/dashboard">Dashboard</Link> |{' '}
    <Link to="/estudiantes">Estudiantes</Link> |{' '}
    <Link to="/cursos">Cursos</Link> |{' '}
    <Link to="/inscripciones">Inscripciones</Link>
  </nav>
);

export default Navbar;
