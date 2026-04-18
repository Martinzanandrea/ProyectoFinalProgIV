import express from 'express';
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hola desde el backend Express' });
});

app.get('/api/ping', (req, res) => {
  res.json({ ping: 'pong' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
