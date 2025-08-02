import { useState } from 'react';
import CryptoSelector from './components/CryptoSelector';
import CryptoDetail from './components/CryptoDetail';

export default function App() {
  const [selectedCrypto, setSelectedCrypto] = useState(null);

  return (
    <div className="container">
      <h1 onClick={() => setSelectedCrypto(null)}>Precios de Criptomonedas</h1>
      {selectedCrypto ? (
        <CryptoDetail crypto={selectedCrypto} onBack={() => setSelectedCrypto(null)} />
      ) : (
        <CryptoSelector onSelect={setSelectedCrypto} />
      )}
    </div>
  );
}
