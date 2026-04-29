import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(usuario, contrasenia);
      if (response.data.success) {
        onLogin();
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Usuario</label>
          <br />
          <input 
            type="text" 
            name="usuario" 
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 5 }} 
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Contraseña</label>
          <br />
          <input 
            type="password" 
            name="contrasenia" 
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 5 }} 
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default Login;