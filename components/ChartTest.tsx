import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { TOKENS } from '../constants';
import SimpleChart from './SimpleChart';
import { Play, X } from 'lucide-react';

const ChartTest: React.FC = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
            : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-lg'
        }`}
        title="Test Chart"
      >
        <Play size={16} />
        Test Chart
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl h-[600px] rounded-lg border ${
        theme === 'dark' 
          ? 'bg-slate-900 border-slate-700' 
          : 'bg-white border-gray-200'
      } flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Chart Test
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-slate-800 text-slate-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Token Selector */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex gap-2 flex-wrap">
            {TOKENS.map((token) => (
              <button
                key={token.symbol}
                onClick={() => setSelectedToken(token)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedToken.symbol === token.symbol
                    ? 'bg-pink-500 text-white'
                    : theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <img src={token.logoURI} className="w-4 h-4 rounded-full" alt={token.name} />
                {token.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 overflow-hidden">
          <SimpleChart token={selectedToken} />
        </div>
      </div>
    </div>
  );
};

export default ChartTest;