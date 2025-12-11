import React, { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import { TOKENS } from '../constants';
import { Token } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token;
}

const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose, onSelect, selectedToken }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = useMemo(() => {
    return TOKENS.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-900 border border-slate-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className={`p-5 border-b ${
          theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`font-medium text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Select a token</h2>
            <button onClick={onClose} className={`transition-colors ${
              theme === 'dark' 
                ? 'text-slate-400 hover:text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}>
              <X size={24} />
            </button>
          </div>
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
            }`} size={20} />
            <input
              type="text"
              placeholder="Search name or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-800 border border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {TOKENS.slice(0, 4).map((token) => (
                <button 
                    key={token.symbol}
                    onClick={() => { onSelect(token); onClose(); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700' 
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                    }`}
                >
                    <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 rounded-full" />
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{token.symbol}</span>
                </button>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {filteredTokens.map((token) => {
            const isSelected = selectedToken?.symbol === token.symbol;
            return (
              <button
                key={token.address}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
                } ${isSelected ? 'opacity-50 cursor-default' : ''}`}
                disabled={isSelected}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={token.logoURI}
                    alt={token.name}
                    className={`w-9 h-9 rounded-full ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                    }`}
                  />
                  <div className="text-left">
                    <div className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{token.name}</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                    }`}>{token.symbol}</div>
                  </div>
                </div>
                {isSelected && <Check className="text-pink-500" size={20} />}
              </button>
            );
          })}
          {filteredTokens.length === 0 && (
            <div className={`p-8 text-center ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
            }`}>
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenModal;
