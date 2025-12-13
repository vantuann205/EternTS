import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, ArrowDown } from 'lucide-react';
import { Token, SwapState } from '../types';
import TokenModal from './TokenModal';
import { TOKENS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCardanoWallet } from '../contexts/CardanoWalletContext';
import LoadingAnimation from './LoadingAnimation';

interface SwapCardProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  onTokenChange?: (token: Token) => void; // Add this to notify parent about token changes
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const SwapCard: React.FC<SwapCardProps> = ({ isWalletConnected, onConnect, onTokenChange, activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { balance } = useCardanoWallet();
  const [swapState, setSwapState] = useState<SwapState>({
    inputToken: TOKENS[0], // ETH
    outputToken: TOKENS[1], // USDC
    inputAmount: '',
    outputAmount: '',
  });

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectingSide, setSelectingSide] = useState<'input' | 'output'>('input');
  const [isSwapping, setIsSwapping] = useState(false);

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
  
  // Notify parent when input token changes (for chart)
  useEffect(() => {
    if (onTokenChange) {
      onTokenChange(swapState.inputToken);
    }
  }, [swapState.inputToken, onTokenChange]);

  // Simple mock price calculation
  useEffect(() => {
    if (!swapState.inputAmount || isNaN(parseFloat(swapState.inputAmount))) {
        setSwapState(prev => ({ ...prev, outputAmount: '' }));
        return;
    }

    const inputPrice = swapState.inputToken.price || 0;
    const outputPrice = swapState.outputToken.price || 1;
    const amount = parseFloat(swapState.inputAmount);
    
    // Calculate raw value then convert to output token
    const value = amount * inputPrice;
    const outputAmt = value / outputPrice;
    
    setSwapState(prev => ({
        ...prev,
        outputAmount: outputAmt.toFixed(6)
    }));
  }, [swapState.inputAmount, swapState.inputToken, swapState.outputToken]);

  const handleTokenSelect = (token: Token) => {
    if (selectingSide === 'input') {
      if (token.symbol === swapState.outputToken.symbol) {
        // Swap if same
        setSwapState(prev => ({ ...prev, inputToken: token, outputToken: prev.inputToken }));
      } else {
        setSwapState(prev => ({ ...prev, inputToken: token }));
      }
    } else {
      if (token.symbol === swapState.inputToken.symbol) {
        setSwapState(prev => ({ ...prev, outputToken: token, inputToken: prev.outputToken }));
      } else {
        setSwapState(prev => ({ ...prev, outputToken: token }));
      }
    }
  };

  const openTokenModal = (side: 'input' | 'output') => {
    setSelectingSide(side);
    setIsTokenModalOpen(true);
  };

  const handleSwapSides = () => {
    setSwapState(prev => ({
        ...prev,
        inputToken: prev.outputToken,
        outputToken: prev.inputToken,
        inputAmount: prev.outputAmount, 
        outputAmount: '' 
    }));
  };



  return (
    <div className={`w-full max-w-[480px] md:rounded-3xl p-2 relative shadow-xl border transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900 border-slate-800' 
        : 'bg-white border-gray-200 shadow-2xl'
    }`}>
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
          <button 
            onClick={() => setActiveTab && setActiveTab('Sell')}
            className={`transition-opacity ${
              activeTab === 'Sell' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
          >
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

      <div className="relative">
        {/* Input Section */}
        <div className={`p-4 rounded-2xl transition-colors border border-transparent mb-1 mx-4 ${
          theme === 'dark' 
            ? 'bg-slate-800/50 hover:bg-slate-800/80 focus-within:border-slate-700' 
            : 'bg-gray-50 hover:bg-gray-100 focus-within:border-gray-300'
        }`}>
          <div className={`text-xs font-medium mb-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>Sell</div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="0"
              value={swapState.inputAmount}
              onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) {
                      setSwapState(prev => ({ ...prev, inputAmount: val }));
                  }
              }}
              className={`bg-transparent text-4xl outline-none w-full font-medium ${
                theme === 'dark' 
                  ? 'text-white placeholder-slate-500' 
                  : 'text-gray-900 placeholder-gray-400'
              }`}
            />
            <button
              onClick={() => openTokenModal('input')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 group ${
                theme === 'dark' 
                  ? 'bg-slate-700 hover:bg-slate-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <img src={swapState.inputToken.logoURI} alt="token" className="w-6 h-6 rounded-full" />
              <span className={`font-bold text-lg ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{swapState.inputToken.symbol}</span>
              <ChevronDown className={theme === 'dark' ? 'text-white' : 'text-gray-900'} size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 h-6">
            <div className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                {swapState.inputAmount && swapState.inputToken.price 
                    ? `$${(parseFloat(swapState.inputAmount) * swapState.inputToken.price).toFixed(2)}` 
                    : ''}
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                Balance: {getTokenBalance(swapState.inputToken)}
              </div>
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
          
          {/* Insufficient Balance Warning */}
          {isWalletConnected && !!swapState.inputAmount && parseFloat(swapState.inputAmount) > parseFloat(getTokenBalance(swapState.inputToken).replace(/,/g, '')) && (
            <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              <span>Insufficient {swapState.inputToken.symbol} balance</span>
            </div>
          )}
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center py-2 mb-1 mx-4">
          <button 
            onClick={handleSwapSides}
            className={`border-[4px] p-2 rounded-xl transition-all ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'bg-white border-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-lg'
            }`}
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* Output Section */}
        <div className={`p-4 rounded-2xl transition-colors border border-transparent mx-4 ${
          theme === 'dark' 
            ? 'bg-slate-800/50 hover:bg-slate-800/80 focus-within:border-slate-700' 
            : 'bg-gray-50 hover:bg-gray-100 focus-within:border-gray-300'
        }`}>
          <div className={`text-xs font-medium mb-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>Buy</div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="0"
              value={swapState.outputAmount}
              readOnly
              className={`bg-transparent text-4xl outline-none w-full font-medium cursor-default ${
                theme === 'dark' 
                  ? 'text-white placeholder-slate-500' 
                  : 'text-gray-900 placeholder-gray-400'
              }`}
            />
            <button
              onClick={() => openTokenModal('output')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 ${
                theme === 'dark' 
                  ? 'bg-slate-700 hover:bg-slate-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <img src={swapState.outputToken.logoURI} alt="token" className="w-6 h-6 rounded-full" />
              <span className={`font-bold text-lg ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{swapState.outputToken.symbol}</span>
              <ChevronDown className={theme === 'dark' ? 'text-white' : 'text-gray-900'} size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 h-6">
            <div className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                 {swapState.outputAmount && swapState.outputToken.price 
                    ? `$${(parseFloat(swapState.outputAmount) * swapState.outputToken.price).toFixed(2)}` 
                    : ''}
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                Balance: {getTokenBalance(swapState.outputToken)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4">
        <button 
          onClick={() => {
            if (isWalletConnected) {
              setIsSwapping(true);
              // Simulate swap transaction
              setTimeout(() => setIsSwapping(false), 3000);
            } else {
              onConnect();
            }
          }}
          disabled={isSwapping || (isWalletConnected && !!swapState.inputAmount && parseFloat(swapState.inputAmount) > parseFloat(getTokenBalance(swapState.inputToken).replace(/,/g, '')))}
          className={`w-full mt-2 font-semibold text-xl py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark' 
              ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20' 
              : 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200'
          }`}
        >
          {isSwapping ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingAnimation size={24} message="" />
              <span>Loading...</span>
            </div>
          ) : isWalletConnected ? 'Swap' : 'Connect Wallet'}
        </button>
      </div>
      
      {isWalletConnected && swapState.inputAmount && (
         <div className={`mt-3 mx-4 flex justify-between text-xs px-2 ${
           theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
         }`}>
            <span>Gas estimate</span>
            <span>$4.20</span>
         </div>
      )}

      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelect={handleTokenSelect}
        selectedToken={selectingSide === 'input' ? swapState.inputToken : swapState.outputToken}
      />
    </div>
  );
};

export default SwapCard;