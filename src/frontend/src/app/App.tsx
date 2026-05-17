import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import HackSilverLogo from './components/HackSilverLogo';

// Mock exchange rates (USD base)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  DKK: 6.89,
  JPY: 149.50,
};

type Currency = keyof typeof EXCHANGE_RATES;

interface Position {
  id: string;
  ticker: string;
  currentPrice: number;
  dailyChange: number;
  buyInPrice: number;
  buyInCurrency: Currency;
  positionSize: number;
  type: 'long' | 'short';
}

// Mock stock data with realistic prices
const mockStockData: Omit<Position, 'buyInPrice' | 'buyInCurrency' | 'positionSize' | 'type'>[] = [
  { id: '1', ticker: 'AAPL', currentPrice: 178.45, dailyChange: 2.3 },
  { id: '2', ticker: 'GOOGL', currentPrice: 142.18, dailyChange: -1.2 },
  { id: '3', ticker: 'MSFT', currentPrice: 412.33, dailyChange: 1.8 },
  { id: '4', ticker: 'TSLA', currentPrice: 248.92, dailyChange: -3.5 },
  { id: '5', ticker: 'NVDA', currentPrice: 878.45, dailyChange: 5.2 },
];

export default function App() {
  const [positions, setPositions] = useState<Position[]>(
    mockStockData.map((stock) => ({
      ...stock,
      buyInPrice: stock.currentPrice * 0.9, // Default to 10% profit
      buyInCurrency: 'USD' as Currency,
      positionSize: 100,
      type: 'long' as 'long' | 'short',
    }))
  );

  const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
  const [newTicker, setNewTicker] = useState('');

  const convertCurrency = (amount: number, from: Currency, to: Currency) => {
    const usdAmount = amount / EXCHANGE_RATES[from];
    return usdAmount * EXCHANGE_RATES[to];
  };

  const calculatePnL = (position: Position) => {
    const buyInUSD = convertCurrency(position.buyInPrice, position.buyInCurrency, 'USD');
    const priceDiff = position.type === 'long'
      ? position.currentPrice - buyInUSD
      : buyInUSD - position.currentPrice;
    return priceDiff * position.positionSize;
  };

  const calculatePercentChange = (position: Position) => {
    const buyInUSD = convertCurrency(position.buyInPrice, position.buyInCurrency, 'USD');
    if (position.type === 'long') {
      return ((position.currentPrice - buyInUSD) / buyInUSD) * 100;
    } else {
      return ((buyInUSD - position.currentPrice) / buyInUSD) * 100;
    }
  };

  const totalPortfolioValue = positions.reduce((sum, pos) => {
    return sum + (pos.currentPrice * pos.positionSize);
  }, 0);

  const totalPnL = positions.reduce((sum, pos) => sum + calculatePnL(pos), 0);
  const portfolioDailyChange = (totalPnL / (totalPortfolioValue - totalPnL)) * 100;

  const updatePosition = (id: string, field: keyof Position, value: any) => {
    setPositions(positions.map(pos =>
      pos.id === id ? { ...pos, [field]: value } : pos
    ));
  };

  const addPosition = () => {
    if (!newTicker.trim()) return;

    const newPosition: Position = {
      id: Date.now().toString(),
      ticker: newTicker.toUpperCase(),
      currentPrice: Math.random() * 500 + 50, // Random price between $50-$550
      dailyChange: (Math.random() - 0.5) * 10, // Random change between -5% and +5%
      buyInPrice: 0,
      buyInCurrency: 'USD',
      positionSize: 0,
      type: 'long',
    };

    setPositions([...positions, newPosition]);
    setNewTicker('');
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter(pos => pos.id !== id));
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    const converted = convertCurrency(amount, 'USD', currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Portfolio Header */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <HackSilverLogo />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-4xl font-bold text-white">
                {formatCurrency(totalPortfolioValue, displayCurrency)}
              </p>
            </div>
            <div className={`flex items-center gap-2 ${portfolioDailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioDailyChange >= 0 ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
              <span className="text-2xl font-bold">
                {portfolioDailyChange >= 0 ? '+' : ''}{portfolioDailyChange.toFixed(2)}%
              </span>
            </div>
            <div className="ml-auto">
              <label className="text-sm text-gray-400 mr-2">Display Currency:</label>
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              >
                {Object.keys(EXCHANGE_RATES).map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add New Position */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Add New Position</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPosition()}
              placeholder="Enter ticker symbol (e.g., AAPL)"
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 placeholder-gray-400"
            />
            <button
              onClick={addPosition}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 font-semibold"
            >
              <Plus size={20} />
              Add Position
            </button>
          </div>
        </div>

        {/* Positions Table */}
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Ticker</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Current Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Daily Change</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Buy-in Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Position Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">% Change</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Total P&L</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {positions.map((position) => {
                  const percentChange = calculatePercentChange(position);
                  const pnl = calculatePnL(position);

                  return (
                    <tr key={position.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 font-semibold text-white">{position.ticker}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-200">{formatCurrency(position.currentPrice, displayCurrency)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={position.dailyChange >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {position.dailyChange >= 0 ? '+' : ''}{position.dailyChange.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={position.buyInPrice}
                            onChange={(e) => updatePosition(position.id, 'buyInPrice', parseFloat(e.target.value) || 0)}
                            className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 w-24"
                            step="0.01"
                          />
                          <select
                            value={position.buyInCurrency}
                            onChange={(e) => updatePosition(position.id, 'buyInCurrency', e.target.value as Currency)}
                            className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                          >
                            {Object.keys(EXCHANGE_RATES).map((curr) => (
                              <option key={curr} value={curr}>{curr}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={position.positionSize}
                          onChange={(e) => updatePosition(position.id, 'positionSize', parseFloat(e.target.value) || 0)}
                          className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 w-24"
                          step="1"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={position.type}
                          onChange={(e) => updatePosition(position.id, 'type', e.target.value as 'long' | 'short')}
                          className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                        >
                          <option value="long">Long</option>
                          <option value="short">Short</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <span className={percentChange >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={pnl >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, displayCurrency)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => removePosition(position.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
                          title="Remove position"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
