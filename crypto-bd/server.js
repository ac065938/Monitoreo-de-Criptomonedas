const express = require('express'); // Framework web para Node.js
const mysql = require('mysql'); // Cliente para conectar con MySQL
const cors = require('cors'); // Middleware para permitir solicitudes cross-origin
const app = express();
const PORT = 3001;

// Habilita CORS para permitir que el frontend (en otro origen) pueda comunicarse con este backend
app.use(cors());

// Middleware para interpretar el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Configuración de la conexión a la base de datos MySQL local
const db = mysql.createConnection({
  host: 'localhost',   
  user: 'root',         
  password: '',         
  database: 'criptomonedas' 
});

// Intento de conexión a MySQL con manejo de error o confirmación exitosa
db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err); // Muestra error en consola si falla
  } else {
    console.log('Conectado a la base de datos MySQL'); // Confirma conexión exitosa
  }
});

// Ruta POST para guardar datos de una criptomoneda en la base de datos
app.post('/guardar', (req, res) => {
  // Se extraen los datos enviados en el cuerpo de la petición
  const { nombre, simbolo, precio, cambio_24h } = req.body;

  // Consulta SQL parametrizada para evitar inyección SQL
  const sql = `INSERT INTO precios (nombre, simbolo, precio, cambio_24h) VALUES (?, ?, ?, ?)`;
  
  // Ejecuta la consulta, enviando los valores recibidos
  db.query(sql, [nombre, simbolo, precio, cambio_24h], (err, result) => {
    if (err) {
      // En caso de error en la inserción, se responde con código 500 y mensaje de error
      console.error('Error al insertar:', err);
      return res.status(500).json({ error: 'Error al guardar datos' });
    }
    // Si la inserción fue exitosa, se envía un mensaje confirmando
    res.json({ message: 'Datos guardados correctamente' });
  });
});

// Arranca el servidor en el puerto definido y muestra mensaje en consola
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
