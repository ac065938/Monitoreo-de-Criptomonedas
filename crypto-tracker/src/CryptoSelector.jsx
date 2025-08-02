import { motion } from 'framer-motion';
const getIconPath = (symbol) => {
  const icons = {
    btc: '/images/cryptos/bitcoin.png',
    eth: '/images/cryptos/ethereum.png',
    ada: '/images/cryptos/cardano.png',
  };
  return icons[symbol] || '/images/cryptos/default.png';
};

const cryptos = [
  { name: 'Bitcoin', symbol: 'btc' },
  { name: 'Ethereum', symbol: 'eth' },
  { name: 'Cardano', symbol: 'ada' }
];

export default function CryptoSelector({ onSelect }) {
  return (
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center w-full max-w-4xl mx-auto"
>
      {cryptos.map((crypto, index) => (
<motion.div
  whileHover={{ scale: 1.1 }}
  key={index}
  className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition text-center w-full max-w-[180px]"
  onClick={() => onSelect(crypto)}
>
          <img
            src={getIconPath(crypto.symbol)}
            alt={crypto.name}
            width="40"
            onError={(e) => {
              e.target.src = '/images/cryptos/default.png';              
            }}
          />
          <h3>{crypto.name}</h3>
        </motion.div>
      ))}
    </motion.div>
  );
}
