const express = require('express'); // Framework web para Node.js
const mysql = require('mysql'); // Cliente MySQL para conexión a base de datos
const cors = require('cors'); // Middleware para habilitar CORS
const fetch = require('node-fetch'); // Para hacer peticiones HTTP 
const app = express();
const PORT = 3001;

// Habilita CORS para que frontend pueda comunicarse con este backend
app.use(cors());

// API Key de CoinMarketCap para hacer consultas autenticadas
const COINMARKET_API_KEY = 'b8ef0421-f565-41f9-8510-4c858e4cc7c9'; 

// Configuración de conexión a la base de datos MySQL local
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'criptomonedas'
});

// Intento de conexión a la base de datos con manejo de errores
db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// Endpoint GET para obtener precios actuales de criptomonedas desde CoinMarketCap
app.get('/api/cryptos', async (req, res) => {
  // IDs de criptos a consultar (Bitcoin, Ethereum, etc.)
  const ids = '1,1027,52,825,1839,5426,3408,1958,74,2010,2,6636';

  try {
    // Petición a API externa con API key en headers
    const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ids}`, {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKET_API_KEY,
      },
    });

    const result = await response.json();

    // Transformar la respuesta en un arreglo de objetos con solo los datos relevantes
    const cryptos = Object.values(result.data).map((c) => ({
      id: c.id.toString(),
      name: c.name,
      symbol: c.symbol.toLowerCase(),
      priceUsd: c.quote.USD.price,
      changePercent24Hr: c.quote.USD.percent_change_24h,
    }));

    // Enviar datos procesados al frontend
    res.json({ data: cryptos });
  } catch (error) {
    // En caso de error, enviar estado 500 con mensaje
    console.error('Error fetching from CoinMarketCap:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Endpoint GET para obtener datos históricos desde la base de datos
app.get('/api/historical', (req, res) => {
  const simbolo = req.query.simbolo?.toLowerCase(); // Símbolo de cripto pasado como query param
  const days = parseInt(req.query.days) || 7; // Días a consultar, por defecto 7

  if (!simbolo) {
    // Validación: símbolo es obligatorio
    return res.status(400).json({ error: 'Parámetro simbolo requerido' });
  }

  // Consulta SQL para obtener precios y cambios en los últimos N días
  const query = `
    SELECT precio, cambio_24h, fecha
    FROM precios
    WHERE simbolo = ?
      AND fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
    ORDER BY fecha ASC
  `;

  // Ejecuta consulta con parámetros para evitar inyección SQL
  db.query(query, [simbolo, days], (error, results) => {
    if (error) {
      console.error('Error en consulta MySQL:', error);
      return res.status(500).json({ error: 'Error en base de datos' });
    }

    // Formatea resultados para enviar al frontend
    const precios = results.map((row) => ({
      precio: parseFloat(row.precio),
      cambio_24h: parseFloat(row.cambio_24h),
      fecha: row.fecha,
    }));

    res.json({ simbolo, dias: days, precios });
  });
});

// Middleware para parsear JSON
app.use(express.json());

// Endpoint POST para guardar datos de criptomoneda en la base de datos
app.post('/guardar', (req, res) => {
  const { nombre, simbolo, precio, cambio_24h } = req.body;

  // Validación simple de datos obligatorios
  if (!nombre || !simbolo || precio == null || cambio_24h == null) {
    return res.status(400).json({ error: 'Faltan datos en el cuerpo de la petición' });
  }

  // Consulta para insertar nuevo registro con fecha actual
  const sql = `INSERT INTO precios (nombre, simbolo, precio, cambio_24h, fecha) VALUES (?, ?, ?, ?, NOW())`;
  db.query(sql, [nombre, simbolo, precio, cambio_24h], (err, result) => {
    if (err) {
      console.error('Error al insertar:', err);
      return res.status(500).json({ error: 'Error al guardar datos' });
    }
    // Responde con mensaje y ID del nuevo registro insertado
    res.json({ message: 'Datos guardados correctamente', id: result.insertId });
  });
});

// Inicia el servidor escuchando en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});