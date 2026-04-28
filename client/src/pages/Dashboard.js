import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        {/* Aquí irán los totales y links rápidos */}
        <p>Total de cursos: ...</p>
        <p>Total de estudiantes: ...</p>
        <a href="/cursos">Ver cursos activos</a>
      </div>
    </div>
  );
};

export default Dashboard;
