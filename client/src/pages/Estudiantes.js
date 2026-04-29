import React, { useState, useEffect } from 'react';
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante } from '../services/api';

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', email: '', telefono: '' });

  const fetchEstudiantes = async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const response = await getEstudiantes(pageNum, 10, searchTerm);
      setEstudiantes(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes(page, search);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEstudiantes(1, search);
  };

  const openModal = (mode, data = null) => {
    setModal({ open: true, mode, data });
    setForm(data || { nombre: '', apellido: '', dni: '', email: '', telefono: '' });
  };

  const closeModal = () => {
    setModal({ open: false, mode: '', data: null });
    setForm({ nombre: '', apellido: '', dni: '', email: '', telefono: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'add') {
        await createEstudiante(form);
      } else if (modal.mode === 'edit') {
        await updateEstudiante(modal.data.id, form);
      }
      closeModal();
      fetchEstudiantes(page, search);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este estudiante?')) {
      try {
        await deleteEstudiante(id);
        fetchEstudiantes(page, search);
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  return (
    <div>
      <h2>Estudiantes</h2>
      
      {/* Buscador */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre, apellido o DNI" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Buscar</button>
      </form>

      {/* Botón agregar */}
      <button onClick={() => openModal('add')} style={{ marginBottom: '20px', padding: '8px 16px' }}>
        + Nuevo Estudiante
      </button>

      {/* Tabla */}
      {loading ? <p>Cargando...</p> : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map(est => (
              <tr key={est.id}>
                <td>{est.id}</td>
                <td>{est.nombre}</td>
                <td>{est.apellido}</td>
                <td>{est.dni}</td>
                <td>{est.email}</td>
                <td>{est.telefono}</td>
                <td>
                  <button onClick={() => openModal('view', est)}>Ver</button>{' '}
                  <button onClick={() => openModal('edit', est)}>Editar</button>{' '}
                  <button onClick={() => handleDelete(est.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
        <span style={{ margin: '0 10px' }}>Página {pagination.page} de {pagination.totalPages}</span>
        <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Siguiente</button>
      </div>

      {/* Modal */}
      {modal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '400px' }}>
            <h3>{modal.mode === 'add' ? 'Nuevo Estudiante' : modal.mode === 'edit' ? 'Editar Estudiante' : 'Ver Estudiante'}</h3>
            {modal.mode === 'view' ? (
              <div>
                <p><strong>Nombre:</strong> {modal.data.nombre}</p>
                <p><strong>Apellido:</strong> {modal.data.apellido}</p>
                <p><strong>DNI:</strong> {modal.data.dni}</p>
                <p><strong>Email:</strong> {modal.data.email}</p>
                <p><strong>Teléfono:</strong> {modal.data.telefono}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div><label>Nombre</label><br /><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required /></div>
                <div><label>Apellido</label><br /><input value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} required /></div>
                <div><label>DNI</label><br /><input value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} required /></div>
                <div><label>Email</label><br /><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><label>Teléfono</label><br /><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
                <button type="submit" style={{ marginTop: '10px', padding: '8px 16px' }}>Guardar</button>
              </form>
            )}
            <button onClick={closeModal} style={{ marginTop: '10px', padding: '8px 16px' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estudiantes;
