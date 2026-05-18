import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import HackSilverLogo from './components/HackSilverLogo';

const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  DKK: 6.89,
  JPY: 149.50,
};

type Currency = keyof typeof EXCHANGE_RATES;

interface BackendTicker {
  symbol: string;
  buyInPrice: number;
  buyInCurrency: Currency;
  positionSize: number;
  type: 'long' | 'short';
}

interface StockPrice {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  status: string;
}

interface Position {
  id: string;
  ticker: string;
  currentPrice: number;
  dailyChange: number;
  buyInPrice: number;
  buyInCurrency: Currency;
  positionSize: number;
  type: 'long' | 'short';
  status: string;
}

export default function App() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
  const [newTicker, setNewTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPositions();
    const interval = setInterval(loadPositions, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadPositions() {
    try {
      setIsLoading(true);

      const tickerResponse = await fetch('/tickers');
      const tickers: BackendTicker[] = await tickerResponse.json();

      if (tickers.length === 0) {
        setPositions([]);
        return;
      }

      const symbols = tickers.map(t => t.symbol).join(',');
      const stockResponse = await fetch(`/stocks?symbols=${encodeURIComponent(symbols)}`);
      const stocks: StockPrice[] = await stockResponse.json();

      setPositions(currentPositions =>
        stocks.map(stock => {
          const savedTicker = tickers.find(t => t.symbol === stock.symbol);
          const existing = currentPositions.find(pos => pos.ticker === stock.symbol);

          return {
            id: stock.symbol,
            ticker: stock.symbol,
            currentPrice: stock.currentPrice,
            dailyChange: stock.changePercent,
            buyInPrice: existing?.buyInPrice ?? savedTicker?.buyInPrice ?? stock.currentPrice,
            buyInCurrency: existing?.buyInCurrency ?? savedTicker?.buyInCurrency ?? 'USD',
            positionSize: existing?.positionSize ?? savedTicker?.positionSize ?? 0,
            type: existing?.type ?? savedTicker?.type ?? 'long',
            status: stock.status,
          };
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const convertCurrency = (amount: number, from: Currency, to: Currency) => {
    const usdAmount = amount / EXCHANGE_RATES[from];
    return usdAmount * EXCHANGE_RATES[to];
  };

  const calculatePnL = (position: Position) => {
    const buyInUSD = convertCurrency(position.buyInPrice, position.buyInCurrency, 'USD');

    const priceDiff =
      position.type === 'long'
        ? position.currentPrice - buyInUSD
        : buyInUSD - position.currentPrice;

    return priceDiff * position.positionSize;
  };

  const calculatePercentChange = (position: Position) => {
    const buyInUSD = convertCurrency(position.buyInPrice, position.buyInCurrency, 'USD');

    if (buyInUSD === 0) return 0;

    if (position.type === 'long') {
      return ((position.currentPrice - buyInUSD) / buyInUSD) * 100;
    }

    return ((buyInUSD - position.currentPrice) / buyInUSD) * 100;
  };

  const totalPortfolioValue = positions.reduce((sum, pos) => {
    return sum + pos.currentPrice * pos.positionSize;
  }, 0);

  const totalPnL = positions.reduce((sum, pos) => sum + calculatePnL(pos), 0);

  const portfolioDailyChange =
    totalPortfolioValue === 0
      ? 0
      : positions.reduce((sum, pos) => sum + pos.dailyChange, 0) / positions.length;

const updatePosition = (id: string, field: keyof Position, value: any) => {
  const updatedPositions = positions.map(pos =>
    pos.id === id ? { ...pos, [field]: value } : pos
    );

    setPositions(updatedPositions);

    const updatedPosition = updatedPositions.find(pos => pos.id === id);

    if (updatedPosition) {
      savePosition(updatedPosition);
    }
  };

  async function savePosition(position: Position) {
    await fetch(`/tickers/${encodeURIComponent(position.ticker)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        buyInPrice: position.buyInPrice,
        buyInCurrency: position.buyInCurrency,
        positionSize: position.positionSize,
        type: position.type,
      }),
    });
  }

  const addPosition = async () => {
    const ticker = newTicker.trim().toUpperCase();

    if (!ticker) return;

    await fetch(`/tickers/${encodeURIComponent(ticker)}`, {
      method: 'POST',
    });

    setNewTicker('');
    await loadPositions();
  };

  const removePosition = async (symbol: string) => {
    await fetch(`/tickers/${encodeURIComponent(symbol)}`, {
      method: 'DELETE',
    });

    setPositions(positions.filter(pos => pos.ticker !== symbol));
    await loadPositions();
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    const converted = convertCurrency(amount, 'USD', currency);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
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

          <p className="text-gray-500 text-sm mt-4">
            {isLoading ? 'Updating prices...' : `Total P&L: ${formatCurrency(totalPnL, displayCurrency)}`}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Add New Position</h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPosition()}
              placeholder="Enter ticker symbol, e.g. AAPL"
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
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                      No tickers added yet.
                    </td>
                  </tr>
                )}

                {positions.map((position) => {
                  const percentChange = calculatePercentChange(position);
                  const pnl = calculatePnL(position);
                  const hasError = position.status !== 'OK';

                  return (
                    <tr key={position.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-semibold text-white">{position.ticker}</td>

                      {hasError ? (
                        <>
                          <td className="px-6 py-4 text-gray-400" colSpan={7}>
                            {position.status}
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() => removePosition(position.ticker)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
                              title="Remove position"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-gray-200">
                            {formatCurrency(position.currentPrice, displayCurrency)}
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
                              onClick={() => removePosition(position.ticker)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
                              title="Remove position"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </>
                      )}
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