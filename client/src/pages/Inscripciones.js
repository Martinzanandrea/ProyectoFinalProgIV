import React, { useState, useEffect } from 'react';
import { getInscripciones, createInscripcion, deleteInscripcion, getDiplomaInscripcion, getEstudiantes, getCursos } from '../services/api';

const Inscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [form, setForm] = useState({ estudiante_id: '', curso_id: '', fecha_inscripcion: '' });

  const fetchInscripciones = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await getInscripciones(pageNum, 10);
      setInscripciones(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [estRes, curRes] = await Promise.all([
        getEstudiantes(1, 1000, ''),
        getCursos(1, 1000, '')
      ]);
      setEstudiantes(estRes.data.data);
      setCursos(curRes.data.data.filter(c => c.estado === 'activo'));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    fetchInscripciones(page);
  }, [page]);

  const openModal = (mode, data = null) => {
    if (mode === 'add') {
      fetchOptions();
    }
    setModal({ open: true, mode, data });
    setForm(data || { estudiante_id: '', curso_id: '', fecha_inscripcion: '' });
  };

  const closeModal = () => {
    setModal({ open: false, mode: '', data: null });
    setForm({ estudiante_id: '', curso_id: '', fecha_inscripcion: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInscripcion({
        estudiante_id: parseInt(form.estudiante_id),
        curso_id: parseInt(form.curso_id),
        fecha_inscripcion: form.fecha_inscripcion || new Date().toISOString().split('T')[0]
      });
      closeModal();
      fetchInscripciones(page);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear inscripción');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta inscripción?')) {
      try {
        await deleteInscripcion(id);
        fetchInscripciones(page);
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  const handleDiploma = async (id) => {
    try {
      const response = await getDiplomaInscripcion(id);
      const data = response.data.data;
      const contenido = `
DIPLOMA DE CURSO

Se certifica que:

${data.estudiante.nombre} ${data.estudiante.apellido}
DNI: ${data.estudiante.dni}

Ha completado exitosamente el curso:

"${data.curso.nombre}"

${data.curso.descripcion || ''}

Fecha de inscripción: ${new Date(data.inscripcion.fecha_inscripcion).toLocaleDateString()}
      `;
      alert(contenido);
      const ventana = window.open('', '_blank');
      ventana.document.write('<pre>' + contenido + '</pre>');
      ventana.print();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al generar diploma');
    }
  };

  return (
    <div>
      <h2>Inscripciones</h2>
      
      {/* Botón agregar */}
      <button onClick={() => openModal('add')} style={{ marginBottom: '20px', padding: '8px 16px' }}>
        + Nueva Inscripción
      </button>

      {/* Tabla */}
      {loading ? <p>Cargando...</p> : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map(ins => (
              <tr key={ins.id}>
                <td>{ins.id}</td>
                <td>{ins.estudiante_apellido}, {ins.estudiante_nombre}</td>
                <td>{ins.curso_nombre}</td>
                <td>{new Date(ins.fecha_inscripcion).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => openModal('view', ins)}>Ver</button>{' '}
                  <button onClick={() => handleDelete(ins.id)}>Eliminar</button>{' '}
                  <button onClick={() => handleDiploma(ins.id)}>Diploma</button>
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
            <h3>{modal.mode === 'add' ? 'Nueva Inscripción' : 'Ver Inscripción'}</h3>
            {modal.mode === 'view' ? (
              <div>
                <p><strong>Estudiante:</strong> {modal.data.estudiante_apellido}, {modal.data.estudiante_nombre}</p>
                <p><strong>Curso:</strong> {modal.data.curso_nombre}</p>
                <p><strong>Fecha:</strong> {new Date(modal.data.fecha_inscripcion).toLocaleDateString()}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Estudiante</label><br />
                  <select value={form.estudiante_id} onChange={e => setForm({...form, estudiante_id: e.target.value})} required style={{ width: '100%', padding: '8px' }}>
                    <option value="">Seleccionar estudiante</option>
                    {estudiantes.map(est => (
                      <option key={est.id} value={est.id}>{est.apellido}, {est.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Curso</label><br />
                  <select value={form.curso_id} onChange={e => setForm({...form, curso_id: e.target.value})} required style={{ width: '100%', padding: '8px' }}>
                    <option value="">Seleccionar curso</option>
                    {cursos.map(cur => (
                      <option key={cur.id} value={cur.id}>{cur.nombre} (Cupo: {cur.inscriptos_max || 'sin límite'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Fecha de Inscripción</label><br />
                  <input type="date" value={form.fecha_inscripcion} onChange={e => setForm({...form, fecha_inscripcion: e.target.value})} style={{ padding: '8px', width: '100%' }} />
                </div>
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

export default Inscripciones;
