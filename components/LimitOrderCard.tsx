import React, { useState } from 'react';
import { ChevronDown, ArrowDown, RotateCcw } from 'lucide-react';
import { Token, SwapState } from '../types';
import TokenModal from './TokenModal';
import { TOKENS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCardanoWallet } from '../contexts/CardanoWalletContext';
import LoadingAnimation from './LoadingAnimation';

interface LimitOrderCardProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  onTokenChange?: (token: Token) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const LimitOrderCard: React.FC<LimitOrderCardProps> = ({ isWalletConnected, onConnect, onTokenChange, activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { balance } = useCardanoWallet();
  const [swapState, setSwapState] = useState<SwapState>({
    inputToken: TOKENS[0], // ETH
    outputToken: TOKENS[1], // USDC
    inputAmount: '',
    outputAmount: ''
  });
  
  const [limitPrice, setLimitPrice] = useState('3204.5');
  const [priceType, setPriceType] = useState('market'); // 'market' or 'custom'
  const [expiry, setExpiry] = useState('week');
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Function to get token balance
  const getTokenBalance = (token: Token) => {
    if (!isWalletConnected) return '0';
    
    if (token.symbol === 'ADA') {
      return balance;
    }
    
    const mockBalances: { [symbol: string]: string } = {
      'SNEK': '1,250,000',
      'MIN': '850.50',
      'SUNDAE': '2,450.00',
      'AGIX': '125.8',
      'INDY': '45.2',
      'IAG': '320.5',
      'NIGHT': '180.75',
      'DJED': '500.00',
      'SHEN': '1,200.0',
      'WMT': '750.3',
      'HOSKY': '50,000,000',
      'MILK': '425.8',
      'CLAY': '95.2',
      'VYFI': '12.5',
      'USDM': '800.00',
      'C3': '2,150.0',
      'IUSD': '650.50',
      'LQ': '85.7',
      'CLARITY': '15,000.0'
    };
    
    return mockBalances[token.symbol] || '0';
  };

  const handleInputTokenSelect = (token: Token) => {
    setSwapState(prev => ({ ...prev, inputToken: token }));
    onTokenChange?.(token);
  };

  const handleOutputTokenSelect = (token: Token) => {
    setSwapState(prev => ({ ...prev, outputToken: token }));
  };

  const handleSwapTokens = () => {
    setSwapState(prev => ({
      ...prev,
      inputToken: prev.outputToken,
      outputToken: prev.inputToken,
      inputAmount: prev.outputAmount,
      outputAmount: prev.inputAmount
    }));
  };

  const currentPrice = (swapState.outputToken.price && swapState.inputToken.price) 
    ? swapState.outputToken.price / swapState.inputToken.price 
    : 0;

  return (
    <div className={`w-full max-w-[480px] md:rounded-3xl p-2 relative shadow-xl border transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900 border-slate-800' 
        : 'bg-white border-gray-200 shadow-2xl'
    }`}>
      {/* Header Tabs */}
      <div className="flex gap-4 font-medium mb-6 p-4">
        <button 
          onClick={() => setActiveTab && setActiveTab('Swap')}
          className={`transition-opacity ${
            activeTab === 'Swap' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          } ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          {t('swap')}
        </button>
        <button className={`opacity-100 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>{t('limit')}</button>
        <button 
          onClick={() => setActiveTab && setActiveTab('Buy')}
          className={`transition-opacity ${
            activeTab === 'Buy' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          } ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          {t('buy')}
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('Sell')}
          className={`transition-opacity ${
            activeTab === 'Sell' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          } ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          {t('sell')}
        </button>
      </div>

      {/* Price Section */}
      <div className={`p-4 rounded-2xl transition-colors border border-transparent mb-6 mx-4 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 hover:bg-slate-800/80 focus-within:border-slate-700' 
          : 'bg-gray-50 hover:bg-gray-100 focus-within:border-gray-300'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {t('when')}
            </span>
            <button 
              onClick={() => setIsInputModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-700 hover:bg-slate-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <img src={swapState.inputToken.logoURI} className="w-5 h-5 rounded-full" alt={swapState.inputToken.symbol} />
              <span className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{swapState.inputToken.symbol}</span>
            </button>
            <span className={`text-xs font-medium ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {t('hasValue')}
            </span>
          </div>
          <button className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}>
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className={`bg-transparent text-3xl outline-none w-full font-bold ${
              theme === 'dark' 
                ? 'text-white placeholder-slate-500' 
                : 'text-gray-900 placeholder-gray-400'
            }`}
            placeholder="0"
          />
          <button 
            onClick={() => setIsOutputModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <img src={swapState.outputToken.logoURI} className="w-6 h-6 rounded-full" alt={swapState.outputToken.symbol} />
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{swapState.outputToken.symbol}</span>
            <ChevronDown className={theme === 'dark' ? 'text-white' : 'text-gray-900'} size={20} />
          </button>
        </div>

        {/* Price Type Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setPriceType('market');
              setLimitPrice(currentPrice.toFixed(2));
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              priceType === 'market'
                ? theme === 'dark'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-300 text-gray-900'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {t('market')}
          </button>
          <button 
            onClick={() => {
              setPriceType('custom');
              setLimitPrice((currentPrice * 1.01).toFixed(2));
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              priceType === 'custom'
                ? theme === 'dark'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-300 text-gray-900'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            +1%
          </button>
          <button 
            onClick={() => {
              setPriceType('custom');
              setLimitPrice((currentPrice * 1.05).toFixed(2));
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            +5%
          </button>
          <button 
            onClick={() => {
              setPriceType('custom');
              setLimitPrice((currentPrice * 1.10).toFixed(2));
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            +10%
          </button>
        </div>
      </div>

      {/* Sell Section */}
      <div className={`p-4 rounded-2xl transition-colors border border-transparent mb-1 mx-4 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 hover:bg-slate-800/80 focus-within:border-slate-700' 
          : 'bg-gray-50 hover:bg-gray-100 focus-within:border-gray-300'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className={`text-xs font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>{t('youSell')}</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
              Balance: {getTokenBalance(swapState.inputToken)}
            </span>
            {isWalletConnected && (
              <button
                onClick={() => {
                  const maxBalance = getTokenBalance(swapState.inputToken);
                  setSwapState(prev => ({ ...prev, inputAmount: maxBalance.replace(/,/g, '') }));
                }}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                MAX
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="0"
            value={swapState.inputAmount}
            onChange={(e) => setSwapState(prev => ({ ...prev, inputAmount: e.target.value }))}
            className={`bg-transparent text-4xl outline-none w-full font-bold ${
              theme === 'dark' 
                ? 'text-white placeholder-slate-500' 
                : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          <button 
            onClick={() => setIsInputModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <img src={swapState.inputToken.logoURI} className="w-6 h-6 rounded-full" alt={swapState.inputToken.symbol} />
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{swapState.inputToken.symbol}</span>
            <ChevronDown className={theme === 'dark' ? 'text-white' : 'text-gray-900'} size={20} />
          </button>
        </div>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center py-2 mb-1 mx-4">
        <button 
          onClick={handleSwapTokens}
          className={`border-4 p-2 rounded-xl transition-all ${
            theme === 'dark' 
              ? 'bg-slate-900 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'bg-white border-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-lg'
          }`}
        >
          <ArrowDown size={20} />
        </button>
      </div>

      {/* Buy Section */}
      <div className={`p-4 rounded-2xl transition-colors border border-transparent mx-4 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 hover:bg-slate-800/80 focus-within:border-slate-700' 
          : 'bg-gray-50 hover:bg-gray-100 focus-within:border-gray-300'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className={`text-xs font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>{t('youBuy')}</div>
          <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
            Balance: {getTokenBalance(swapState.outputToken)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="0"
            value={swapState.outputAmount}
            onChange={(e) => setSwapState(prev => ({ ...prev, outputAmount: e.target.value }))}
            className={`bg-transparent text-4xl outline-none w-full font-bold ${
              theme === 'dark' 
                ? 'text-white placeholder-slate-500' 
                : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          <button 
            onClick={() => setIsOutputModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <img src={swapState.outputToken.logoURI} className="w-6 h-6 rounded-full" alt={swapState.outputToken.symbol} />
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{swapState.outputToken.symbol}</span>
            <ChevronDown className={theme === 'dark' ? 'text-white' : 'text-gray-900'} size={20} />
          </button>
        </div>
      </div>

      {/* Expiry */}
      <div className={`p-4 rounded-2xl transition-colors border border-transparent mb-4 mx-4 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 hover:bg-slate-800/80 focus-within:border-slate-700' 
          : 'bg-gray-50 hover:bg-gray-100 focus-within:border-gray-300'
      }`}>
        <div className={`text-xs font-medium mb-3 ${
          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
        }`}>{t('expires')}</div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setExpiry('day')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              expiry === 'day'
                ? theme === 'dark'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-300 text-gray-900'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            1 {t('day')}
          </button>
          <button 
            onClick={() => setExpiry('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              expiry === 'week'
                ? theme === 'dark'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-300 text-gray-900'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            1 {t('week')}
          </button>
          <button 
            onClick={() => setExpiry('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              expiry === 'month'
                ? theme === 'dark'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-300 text-gray-900'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            1 {t('month')}
          </button>
          <button 
            onClick={() => setExpiry('year')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              expiry === 'year'
                ? theme === 'dark'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-300 text-gray-900'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            1 {t('year')}
          </button>
        </div>
      </div>

      {/* Connect Wallet Button */}
      <div className="mx-4">
        <button 
          onClick={() => {
            if (isWalletConnected) {
              setIsPlacingOrder(true);
              // Simulate placing limit order
              setTimeout(() => setIsPlacingOrder(false), 3000);
            } else {
              onConnect();
            }
          }}
          disabled={isPlacingOrder}
          className={`w-full mt-2 font-semibold text-xl py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
          theme === 'dark' 
            ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border border-pink-500/20' 
            : 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg'
        }`}
        >
          {isPlacingOrder ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingAnimation size={24} message="" />
              <span>Loading...</span>
            </div>
          ) : isWalletConnected ? 'Đặt lệnh giới hạn' : t('connect')}
        </button>
      </div>
      <TokenModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSelect={handleInputTokenSelect}
        selectedToken={swapState.inputToken}
      />
      
      <TokenModal
        isOpen={isOutputModalOpen}
        onClose={() => setIsOutputModalOpen(false)}
        onSelect={handleOutputTokenSelect}
        selectedToken={swapState.outputToken}
      />
    </div>
  );
};

export default LimitOrderCard;