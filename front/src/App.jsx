import { useEffect, useState } from 'react';

export default function App() {
  const [backendMessage, setBackendMessage] = useState('Cargando...');

  useEffect(() => {
    fetch('/api/ping')
      .then((response) => response.json())
      .then((data) => {
        setBackendMessage(JSON.stringify(data));
      })
      .catch(() => {
        setBackendMessage('Error al conectar con el backend');
      });
  }, []);

  return (
    <main className="app">
      <h1>Proyecto Final ProgIV</h1>
      <p>Front con React + Vite y backend con Express.</p>
      <p>Respuesta del backend:</p>
      <pre>{backendMessage}</pre>
    </main>
  );
}
