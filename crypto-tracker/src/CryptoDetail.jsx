import { motion } from 'framer-motion';

export default function CryptoDetail({ crypto, onBack }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="detail"
    >
      <h2>{crypto.name}</h2>
<img
  src={getIconPath(crypto.symbol)}
  alt={crypto.name}
  width="40"
  onError={(e) => {
    e.target.src = '/images/cryptos/default.png';
  }}
/>
      <p>Aquí puedes mostrar el precio actual, market cap, cambio % y otras métricas en tiempo real usando alguna API como CoinGecko o CoinMarketCap.</p>
      <button onClick={onBack}>Volver</button>
    </motion.div>
  );
}
