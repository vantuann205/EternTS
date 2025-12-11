import React, { useState } from 'react';
import { Settings, ChevronDown, TrendingDown, DollarSign, Banknote } from 'lucide-react';
import { Token } from '../types';
import TokenModal from './TokenModal';
import { TOKENS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface SellCardProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  onTokenChange?: (token: Token) => void;
}

const SellCard: React.FC<SellCardProps> = ({ isWalletConnected, onConnect, onTokenChange }) => {
  const { theme } = useTheme();
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]); // ETH
  const [tokenAmount, setTokenAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    onTokenChange?.(token);
    // Calculate fiat amount based on token
    if (tokenAmount && token.price) {
      const calculatedFiat = parseFloat(tokenAmount) * token.price;
      setFiatAmount(calculatedFiat.toFixed(2));
    }
  };

  const handleTokenAmountChange = (value: string) => {
    setTokenAmount(value);
    if (value && selectedToken && selectedToken.price) {
      const calculatedFiat = parseFloat(value) * selectedToken.price;
      setFiatAmount(calculatedFiat.toFixed(2));
    } else {
      setFiatAmount('');
    }
  };

  const handleMaxClick = () => {
    // Simulate max balance
    const maxBalance = '1.5'; // Example balance
    handleTokenAmountChange(maxBalance);
  };

  const withdrawMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: Banknote, fee: '0.5%', time: '1-3 days' },
    { id: 'paypal', name: 'PayPal', icon: DollarSign, fee: '2.0%', time: 'Instant' },
  ];

  return (
    <div className={`w-full max-w-md mx-auto rounded-3xl p-6 backdrop-blur-md transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900/80 border border-slate-800' 
        : 'bg-white/90 border border-gray-200 shadow-xl'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingDown className="text-red-500" size={20} />
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Sell Crypto</h2>
        </div>
        <button className={`p-2 rounded-xl transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
        }`}>
          <Settings size={20} />
        </button>
      </div>

      {/* Token Amount */}
      <div className={`rounded-2xl p-4 mb-4 transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>You sell</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
              Balance: 1.5 {selectedToken.symbol}
            </span>
            <button
              onClick={handleMaxClick}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              MAX
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="0"
            value={tokenAmount}
            onChange={(e) => handleTokenAmountChange(e.target.value)}
            className={`text-3xl font-medium bg-transparent border-none outline-none w-full ${
              theme === 'dark' ? 'text-white placeholder-slate-600' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          
          <button 
            onClick={() => setIsTokenModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <img src={selectedToken.logoURI} className="w-6 h-6 rounded-full" alt={selectedToken.symbol} />
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{selectedToken.symbol}</span>
            <ChevronDown className={theme === 'dark' ? 'text-white' : 'text-gray-900'} size={20} />
          </button>
        </div>
        
        <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
          Rate: ${selectedToken.price ? selectedToken.price.toFixed(2) : '0.00'} per {selectedToken.symbol}
        </div>
      </div>

      {/* Fiat Amount */}
      <div className={`rounded-2xl p-4 mb-4 transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>You receive</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>$</span>
            <input
              type="text"
              placeholder="0"
              value={fiatAmount}
              readOnly
              className={`text-3xl font-medium bg-transparent border-none outline-none flex-1 ${
                theme === 'dark' ? 'text-white placeholder-slate-600' : 'text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          
          <div className={`text-sm font-medium px-3 py-1 rounded-lg ${
            theme === 'dark' 
              ? 'bg-slate-700 text-slate-300' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            USD
          </div>
        </div>
      </div>

      {/* Withdrawal Method */}
      <div className={`rounded-2xl p-4 mb-4 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>Withdrawal method</span>
        </div>
        
        <div className="space-y-2">
          {withdrawMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setWithdrawMethod(method.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                withdrawMethod === method.id
                  ? theme === 'dark'
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                    : 'bg-red-50 border border-red-200 text-red-700'
                  : theme === 'dark'
                    ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <method.icon size={20} />
                <div className="text-left">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-xs opacity-75">{method.time}</div>
                </div>
              </div>
              <span className="text-sm">Fee: {method.fee}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sell Button */}
      <button 
        onClick={onConnect}
        disabled={!tokenAmount || parseFloat(tokenAmount) <= 0}
        className={`w-full font-semibold text-xl py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
          theme === 'dark' 
            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
            : 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
        }`}
      >
        {isWalletConnected ? `Sell ${selectedToken.symbol}` : 'Connect Wallet'}
      </button>
      
      {tokenAmount && parseFloat(tokenAmount) > 0 && (
        <div className={`mt-4 p-3 rounded-xl ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border border-slate-700/50' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex justify-between text-sm mb-1">
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
              Gross amount
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ${fiatAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
              Fee ({withdrawMethods.find(m => m.id === withdrawMethod)?.fee})
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              -${(parseFloat(fiatAmount || '0') * (withdrawMethod === 'bank' ? 0.005 : 0.02)).toFixed(2)}
            </span>
          </div>
          <hr className={`my-2 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`} />
          <div className="flex justify-between text-sm font-medium">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Net amount
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ${(parseFloat(fiatAmount || '0') * (1 - (withdrawMethod === 'bank' ? 0.005 : 0.02))).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Token Modal */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelect={handleTokenSelect}
        selectedToken={selectedToken}
      />
    </div>
  );
};

export default SellCard;