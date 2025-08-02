import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Para las animaciones suaves en React
import { Line } from 'react-chartjs-2'; // Gráfica de líneas para mostrar datos históricos
import Select from 'react-select'; // Componente de selección avanzada con búsqueda y multiselección
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css';

// Registro de componentes de ChartJS necesarios para la gráfica
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Componente que muestra el gráfico histórico de precios para una criptomoneda específica
function CryptoChart({ symbol }) {
  // Estado para guardar datos históricos y control de carga
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook que se ejecuta cuando cambia el símbolo, para cargar datos históricos
  useEffect(() => {
    // Llama al backend local para obtener precios históricos de los últimos 7 días
    fetch(`http://localhost:3001/api/historical?simbolo=${symbol}&days=7`)
      .then(res => res.json())
      .then(data => {
        setHistoricalData(data.precios || []); // Guarda los precios recibidos
        setLoading(false); // Cambia el estado para indicar que ya terminó de cargar
      })
      .catch(() => {
        // En caso de error, vacía los datos y termina la carga
        setHistoricalData([]);
        setLoading(false);
      });
  }, [symbol]);

  // Mostrar mensaje mientras se cargan los datos
  if (loading) return <p>Cargando gráfico...</p>;
  // Mostrar mensaje si no hay datos disponibles
  if (!historicalData || historicalData.length === 0) return <p>No hay datos históricos disponibles.</p>;

  // Preparar etiquetas y datos para la gráfica
  const labels = historicalData.map(item =>
    new Date(item.fecha).toLocaleDateString()
  );
  const prices = historicalData.map(item => item.precio);

  // Configuración de los datos para ChartJS
  const data = {
    labels,
    datasets: [
      {
        label: `Precio USD de ${symbol.toUpperCase()} (últimos 7 días)`,
        data: prices,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Opciones visuales para la gráfica
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }, // Leyenda arriba
      title: {
        display: true,
        text: `Histórico de Precio para ${symbol.toUpperCase()}`, // Título dinámico
      },
    },
  };

  // Renderiza la gráfica de línea
  return <Line options={options} data={data} />;
}

function App() {
  // Estados para almacenar datos de criptomonedas, selección y filtrado
  const [cryptos, setCryptos] = useState([]);
  const [selectedCryptoId, setSelectedCryptoId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  const [showGrid, setShowGrid] = useState(false);

  // Hook que carga las criptomonedas al montar el componente (similar a componentDidMount)
  useEffect(() => {
    // Fetch a API pública de CoinGecko para obtener datos actuales de criptos
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,tether,binancecoin,solana,usd-coin,tron,dogecoin,cardano,litecoin,polkadot&order=market_cap_desc&per_page=12&page=1&sparkline=false')
      .then((res) => res.json())
      .then((data) => {
        // Formatea los datos para nuestro uso interno
        const formatted = data.map((item) => ({
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          priceUsd: item.current_price,
          changePercent24Hr: item.price_change_percentage_24h,
          image: item.image,
        }));

        setCryptos(formatted);
        setFilteredCryptos(formatted);

        // Envía cada criptomoneda al backend local para guardar en base de datos
        formatted.forEach((crypto) => {
          fetch('http://localhost:3001/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: crypto.name,
              simbolo: crypto.symbol,
              precio: crypto.priceUsd,
              cambio_24h: crypto.changePercent24Hr,
            }),
          }).catch((err) => {
            console.error('Error guardando cripto en backend:', err);
          });
        });
      })
      .catch(() => setCryptos([])); // En caso de error limpia la lista
  }, []);

  // Función para manejar clic en una tarjeta de cripto
  const handleCardClick = (crypto) => {
    // Si ya estaba seleccionada, deselecciona; si no, selecciona
    setSelectedCryptoId(selectedCryptoId === crypto.id ? null : crypto.id);
  };

  // Función para obtener el path de la imagen de ícono según el símbolo o id
  const getIconPath = (symbolOrId) => {
    const icons = {
      bitcoin: '/images/cryptos/bitcoin.png',
      ethereum: '/images/cryptos/ethereum.png',
      bnb: '/images/cryptos/bnb.png',
      btc: '/images/cryptos/bitcoin.png',
      eth: '/images/cryptos/ethereum.png',
      ada: '/images/cryptos/cardano.png',
      xrp: '/images/cryptos/xrp.png',
      usdt: '/images/cryptos/tether.png',
      sol: '/images/cryptos/solana.png',
      doge: '/images/cryptos/dogecoin.png',
      trx: '/images/cryptos/tron.png',
      usdc: '/images/cryptos/USDC.png',
      ltc: '/images/cryptos/litecoin.png',
      dot: '/images/cryptos/polkadot.png',
    };
    const lowerCaseId = symbolOrId.toLowerCase();
    return icons[lowerCaseId] || '/images/cryptos/default.png'; // Ícono por defecto si no se encuentra el logo
  };

  // Opciones para el componente Select, basado en criptos cargadas
  const options = cryptos.map((crypto) => ({
    value: crypto.id,
    label: crypto.name,
  }));

  // Maneja la selección de criptos en el select múltiple
  const handleSelectChange = (selected) => {
    setSelectedOptions(selected);
    if (selected && selected.length > 0) {
      // Filtra las criptos para mostrar solo las seleccionadas
      const filtered = cryptos.filter((crypto) =>
        selected.some((opt) => opt.value === crypto.id)
      );
      setFilteredCryptos(filtered);
    } else {
      // Si no hay selección, muestra todas
      setFilteredCryptos(cryptos);
    }
  };

  // Busca la cripto seleccionada para mostrar detalles
  const selectedCrypto = cryptos.find((crypto) => crypto.id === selectedCryptoId);

  return (
    <div className="App">
      {/* Título dinamico que alterna la vista de cuadrícula */}
      <h1
        className="app-title"
        onClick={() => {
          setShowGrid(!showGrid);
          if (!showGrid) setSelectedCryptoId(null); // Deselecciona si abre la cuadrícula
        }}
        style={{ cursor: 'pointer' }}
      >
        Precios de Criptomonedas
      </h1>

      {/* Mostrar la cuadrícula de criptos solo si está activa y no hay cripto seleccionada */}
      {showGrid && !selectedCryptoId && (
        <>
          {/* Select múltiple para filtrar criptos */}
          <div style={{ margin: '20px', maxWidth: '400px', marginInline: 'auto' }}>
            <Select
              isMulti
              options={options}
              value={selectedOptions}
              onChange={handleSelectChange}
              placeholder="Selecciona criptomonedas..."
            />
          </div>

          {/* Grid animado con tarjetas de criptomonedas */}
          <motion.div
            className="crypto-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredCryptos.map((crypto) => (
              <motion.div
                key={crypto.id}
                whileHover={{ scale: 1.05 }} // Efecto hover con animación de escala
                onClick={() => handleCardClick(crypto)} // Seleccionar/deseleccionar cripto
                className="crypto-card"
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={getIconPath(crypto.symbol || crypto.id)}
                  alt={crypto.name}
                  className="crypto-icon"
                  onError={(e) => {
                    // Imagen por defecto si falla carga del ícono
                    e.target.src = '/images/cryptos/default.png';
                  }}
                />
                <h3 className="crypto-name">{crypto.name}</h3>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Mostrar detalle y gráfico de la cripto seleccionada con animación de entrada/salida */}
      <AnimatePresence>
        {selectedCrypto && (
          <motion.div
            className="crypto-detail-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <img
              src={getIconPath(selectedCrypto.symbol || selectedCrypto.id)}
              alt={selectedCrypto.name}
              className="crypto-icon"
              onError={(e) => {
                e.target.src = '/images/cryptos/default.png';
              }}
            />
            <h2 className="detail-name">{selectedCrypto.name}</h2>

            {/* Mostrar precio con formato */}
            <p className="detail-price">
              Precio:{' '}
              {selectedCrypto.priceUsd !== null &&
              selectedCrypto.priceUsd !== undefined &&
              !isNaN(selectedCrypto.priceUsd)
                ? `$${parseFloat(selectedCrypto.priceUsd).toFixed(2)} USD`
                : 'No disponible'}
            </p>

            {/* Mostrar cambio porcentual con color verde o rojo según positivo o negativo */}
            <p
              className={`detail-change ${
                selectedCrypto.changePercent24Hr >= 0 ? 'text-green' : 'text-red'
              }`}
            >
              Cambio 24h:{' '}
              {selectedCrypto.changePercent24Hr !== null &&
              selectedCrypto.changePercent24Hr !== undefined &&
              !isNaN(selectedCrypto.changePercent24Hr)
                ? `${selectedCrypto.changePercent24Hr.toFixed(2)}%`
                : 'No disponible'}
            </p>

            {/* Componente gráfico con datos históricos */}
            <CryptoChart symbol={selectedCrypto.symbol} />

            {/* Botón para volver a la lista */}
            <button className="back-button" onClick={() => setSelectedCryptoId(null)}>
              Volver
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;