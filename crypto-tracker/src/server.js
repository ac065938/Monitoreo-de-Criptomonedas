const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 5000;

const COINMARKET_API_KEY = 'b8ef0421-f565-41f9-8510-4c858e4cc7c9';

app.use(cors());

app.get('/api/cryptos', async (req, res) => {
  try {
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=10', {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKET_API_KEY,
      }
    });
    const data = await response.json();
    const cryptos = data.data.map(c => ({
      id: c.id.toString(),
      name: c.name,
      symbol: c.symbol,
      priceUsd: c.quote.USD.price,
      changePercent24Hr: c.quote.USD.percent_change_24h
    }));
    res.json({ data: cryptos });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
