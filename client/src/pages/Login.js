import React from 'react';

const Login = () => {
  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Iniciar Sesión</h2>
      <form>
        <div>
          <label>Usuario</label>
          <input type="text" name="usuario" className="form-control" />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" name="contrasenia" className="form-control" />
        </div>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
