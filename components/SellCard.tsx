import React, { useState } from 'react';
import { Settings, ChevronDown, TrendingDown, DollarSign, Banknote } from 'lucide-react';
import { Token } from '../types';
import TokenModal from './TokenModal';
import { TOKENS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCardanoWallet } from '../contexts/CardanoWalletContext';
import LoadingAnimation from './LoadingAnimation';

interface SellCardProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  onTokenChange?: (token: Token) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const SellCard: React.FC<SellCardProps> = ({ isWalletConnected, onConnect, onTokenChange, activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { balance } = useCardanoWallet();
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]); // ETH
  const [tokenAmount, setTokenAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isSelling, setIsSelling] = useState(false);

  // Function to get token balance
  const getTokenBalance = (token: Token) => {
    if (!isWalletConnected) return '0';
    
    if (token.symbol === 'ADA') {
      return balance;
    }
    
    // For other tokens, return 0 since we don't have real wallet data yet
    // TODO: Implement real token balance fetching from wallet
    return '0';
  };

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
    const maxBalance = getTokenBalance(selectedToken);
    handleTokenAmountChange(maxBalance.replace(/,/g, ''));
  };

  const withdrawMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: Banknote, fee: '0.5%', time: '1-3 days' },
    { id: 'paypal', name: 'PayPal', icon: DollarSign, fee: '2.0%', time: 'Instant' },
  ];

  return (
    <div className={`w-full max-w-[480px] md:rounded-3xl p-2 relative shadow-xl border transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900 border-slate-800' 
        : 'bg-white border-gray-200 shadow-2xl'
    }`}>
      {/* Header Tabs */}
      <div className="flex justify-between items-center p-4 mb-2">
        <div className={`flex gap-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <button 
            onClick={() => setActiveTab && setActiveTab('Swap')}
            className={`transition-opacity ${
              activeTab === 'Swap' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
          >
            {t('swap')}
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('Limit')}
            className={`transition-opacity ${
              activeTab === 'Limit' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
          >
            {t('limit')}
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('Buy')}
            className={`transition-opacity ${
              activeTab === 'Buy' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
          >
            {t('buy')}
          </button>
          <button className={`opacity-100`}>
            {t('sell')}
          </button>
        </div>
        <button className={`transition-colors ${
          theme === 'dark' 
            ? 'text-slate-400 hover:text-white' 
            : 'text-gray-500 hover:text-gray-700'
        }`}>
          <Settings size={20} />
        </button>
      </div>

      {/* Token Amount */}
      <div className={`rounded-2xl p-4 mb-4 mx-4 transition-all duration-200 ${
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
              Balance: {getTokenBalance(selectedToken)} {selectedToken.symbol}
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
            className={`bg-transparent text-4xl outline-none w-full font-medium ${
              theme === 'dark' ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'
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
        
        {/* Insufficient Balance Warning */}
        {isWalletConnected && !!tokenAmount && parseFloat(tokenAmount) > parseFloat(getTokenBalance(selectedToken).replace(/,/g, '')) && (
          <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span>
            <span>Insufficient {selectedToken.symbol} balance</span>
          </div>
        )}
      </div>

      {/* Fiat Amount */}
      <div className={`rounded-2xl p-4 mb-4 mx-4 transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>You receive</span>
        </div>
        
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="0"
            value={fiatAmount}
            readOnly
            className={`bg-transparent text-4xl outline-none w-full font-medium cursor-default ${
              theme === 'dark' ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          
          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 ${
            theme === 'dark' 
              ? 'bg-slate-700 hover:bg-slate-600' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}>
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>USD</span>
          </button>
        </div>
      </div>

      {/* Withdrawal Method */}
      <div className={`rounded-2xl p-4 mb-4 mx-4 ${
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

      {/* Transaction Summary */}
      {isWalletConnected && (
        <div className={`mb-4 p-3 rounded-xl mx-4 ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border border-slate-700/50' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex justify-between text-sm mb-1">
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
              Gross amount
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ${fiatAmount || '0.00'}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
              Fee ({withdrawMethods.find(m => m.id === withdrawMethod)?.fee})
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              -${fiatAmount ? (parseFloat(fiatAmount) * (withdrawMethod === 'bank' ? 0.005 : 0.02)).toFixed(2) : '0.00'}
            </span>
          </div>
          <hr className={`my-2 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`} />
          <div className="flex justify-between text-sm font-medium">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Net amount
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ${fiatAmount ? (parseFloat(fiatAmount) * (1 - (withdrawMethod === 'bank' ? 0.005 : 0.02))).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      )}

      {/* Sell Button */}
      <div className="mx-4">
        <button 
          onClick={() => {
            if (isWalletConnected) {
              setIsSelling(true);
              // Simulate sell transaction
              setTimeout(() => setIsSelling(false), 4000);
            } else {
              onConnect();
            }
          }}
          disabled={!tokenAmount || parseFloat(tokenAmount) <= 0 || isSelling || (isWalletConnected && !!tokenAmount && parseFloat(tokenAmount) > parseFloat(getTokenBalance(selectedToken).replace(/,/g, '')))}
          className={`w-full mt-2 font-semibold text-xl py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
          theme === 'dark' 
            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
            : 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
        }`}
        >
          {isSelling ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingAnimation size={24} message="" />
              <span>Loading...</span>
            </div>
          ) : isWalletConnected ? `Sell ${selectedToken.symbol}` : 'Connect Wallet'}
        </button>
      </div>

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