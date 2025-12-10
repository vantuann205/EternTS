import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { fetchChartData, fetchTokenPrice } from '../services/priceService';
import { Bug, Play, X } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    setTestResults([]);
    
    const tests = [
      { symbol: 'ETH', timeframe: '1H' },
      { symbol: 'ETH', timeframe: '1D' },
      { symbol: 'ETH', timeframe: '1W' },
      { symbol: 'USDC', timeframe: '1D' },
      { symbol: 'WBTC', timeframe: '1D' }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing ${test.symbol} - ${test.timeframe}`);
        
        const [chartData, priceData] = await Promise.all([
          fetchChartData(test.symbol, test.timeframe),
          fetchTokenPrice(test.symbol)
        ]);

        setTestResults(prev => [...prev, {
          ...test,
          success: true,
          chartPoints: chartData.length,
          price: priceData?.current_price,
          change: priceData?.price_change_percentage_24h
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          ...test,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }]);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setTesting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 z-50 p-3 rounded-full transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' 
            : 'bg-white hover:bg-gray-50 text-gray-600 shadow-lg'
        } border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}
        title="Debug API"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 w-96 max-h-96 overflow-auto rounded-lg border ${
      theme === 'dark' 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-gray-200 shadow-lg'
    } p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          API Debug Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className={`p-1 rounded ${
            theme === 'dark' 
              ? 'hover:bg-slate-700 text-slate-400' 
              : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <X size={16} />
        </button>
      </div>

      <button
        onClick={testAPI}
        disabled={testing}
        className={`w-full flex items-center justify-center gap-2 p-2 rounded mb-4 transition-colors ${
          testing
            ? 'opacity-50 cursor-not-allowed'
            : theme === 'dark'
              ? 'bg-pink-500 hover:bg-pink-600 text-white'
              : 'bg-pink-500 hover:bg-pink-600 text-white'
        }`}
      >
        <Play size={16} />
        {testing ? 'Testing...' : 'Test API Calls'}
      </button>

      <div className="space-y-2 text-sm">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-2 rounded border ${
              result.success
                ? theme === 'dark'
                  ? 'bg-green-900/20 border-green-800 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-700'
                : theme === 'dark'
                  ? 'bg-red-900/20 border-red-800 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-600'
            }`}
          >
            <div className="font-medium">
              {result.symbol} - {result.timeframe}
            </div>
            {result.success ? (
              <div className="text-xs mt-1">
                <div>Chart points: {result.chartPoints}</div>
                <div>Price: ${result.price?.toFixed(4)}</div>
                <div>24h change: {result.change?.toFixed(2)}%</div>
              </div>
            ) : (
              <div className="text-xs mt-1">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPanel;