require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/api/cryptos', async (req, res) => {
  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=10&convert=USD',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        }
      }
    );

    const cryptos = response.data.data;
    const simplified = cryptos.map((crypto) => ({
      id: crypto.id.toString(),
      name: crypto.name,
      symbol: crypto.symbol,
      priceUsd: crypto.quote.USD.price
    }));

    res.json({ data: simplified });

  } catch (error) {
    console.error('Error al obtener datos de CoinMarketCap:', error.message);
    res.status(500).json({ error: 'Error al obtener datos de la API de CoinMarketCap' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});