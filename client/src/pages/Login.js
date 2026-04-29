import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await register(usuario, contrasenia, nombre, apellido);
        if (response.data.success) {
          setIsRegister(false);
          setError('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
          setUsuario('');
          setContrasenia('');
          setNombre('');
          setApellido('');
        }
      } else {
        const response = await login(usuario, contrasenia);
        if (response.data.success) {
          onLogin();
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</h2>
      {error && <p style={{ color: error.includes('exitosamente') ? 'green' : 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label>Nombre</label>
              <br />
              <input 
                type="text" 
                name="nombre" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }} 
              />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Apellido</label>
              <br />
              <input 
                type="text" 
                name="apellido" 
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }} 
              />
            </div>
          </>
        )}
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
          {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Ingresar'}
        </button>
      </form>
      <p style={{ marginTop: 15, textAlign: 'center' }}>
        {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
        <button 
          type="button" 
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegister ? 'Iniciar sesión' : 'Regístrate'}
        </button>
      </p>
    </div>
  );
};

export default Login;