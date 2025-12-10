import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, ArrowDown, Info } from 'lucide-react';
import { Token, SwapState } from '../types';
import TokenModal from './TokenModal';
import { TOKENS } from '../constants';

interface SwapCardProps {
  onTokenAnalysisRequest: (token: Token) => void;
  isWalletConnected: boolean;
  onConnect: () => void;
}

const SwapCard: React.FC<SwapCardProps> = ({ onTokenAnalysisRequest, isWalletConnected, onConnect }) => {
  const [swapState, setSwapState] = useState<SwapState>({
    inputToken: TOKENS[0], // ETH
    outputToken: TOKENS[1], // USDC
    inputAmount: '',
    outputAmount: '',
  });

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectingSide, setSelectingSide] = useState<'input' | 'output'>('input');
  
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
        // Logic for recalculation will trigger via effect, but let's clear for realism or keep it
        outputAmount: '' 
    }));
  };

  const handleAnalysisClick = (e: React.MouseEvent, token: Token) => {
    e.stopPropagation();
    onTokenAnalysisRequest(token);
  };

  return (
    <div className="w-full max-w-[480px] bg-slate-900 md:rounded-3xl p-2 relative shadow-xl border border-slate-800">
      <div className="flex justify-between items-center p-4 mb-2">
        <div className="flex gap-4 text-white font-medium">
          <button className="opacity-100 hover:opacity-80">Swap</button>
          <button className="opacity-50 hover:opacity-100">Limit</button>
          <button className="opacity-50 hover:opacity-100">Send</button>
          <button className="opacity-50 hover:opacity-100">Buy</button>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="relative flex flex-col gap-1">
        {/* Input Section */}
        <div className="bg-slate-800/50 p-4 rounded-2xl hover:bg-slate-800/80 transition-colors border border-transparent focus-within:border-slate-700">
          <div className="text-slate-400 text-xs font-medium mb-2">Sell</div>
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
              className="bg-transparent text-4xl text-white outline-none w-full placeholder-slate-500 font-medium"
            />
            <button
              onClick={() => openTokenModal('input')}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4 group"
            >
              <img src={swapState.inputToken.logoURI} alt="token" className="w-6 h-6 rounded-full" />
              <span className="text-white font-bold text-lg">{swapState.inputToken.symbol}</span>
              <ChevronDown className="text-white" size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 h-6">
            <div className="text-slate-500 text-sm">
                {swapState.inputAmount && swapState.inputToken.price 
                    ? `$${(parseFloat(swapState.inputAmount) * swapState.inputToken.price).toFixed(2)}` 
                    : ''}
            </div>
            <div className="flex items-center gap-2">
                 {/* Gemini Insight Trigger */}
                 <button 
                    onClick={(e) => handleAnalysisClick(e, swapState.inputToken)}
                    className="flex items-center gap-1 text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full hover:bg-pink-500/20 transition-colors"
                 >
                    <Info size={10} />
                    <span>Gemini Analysis</span>
                 </button>
                 <div className="text-slate-500 text-sm">Balance: 0</div>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={handleSwapSides}
            className="bg-slate-900 border-[4px] border-slate-900 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-slate-800/50 p-4 rounded-2xl hover:bg-slate-800/80 transition-colors border border-transparent focus-within:border-slate-700">
          <div className="text-slate-400 text-xs font-medium mb-2">Buy</div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="0"
              value={swapState.outputAmount}
              readOnly
              className="bg-transparent text-4xl text-white outline-none w-full placeholder-slate-500 font-medium cursor-default"
            />
            <button
              onClick={() => openTokenModal('output')}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-all shrink-0 ml-4"
            >
              <img src={swapState.outputToken.logoURI} alt="token" className="w-6 h-6 rounded-full" />
              <span className="text-white font-bold text-lg">{swapState.outputToken.symbol}</span>
              <ChevronDown className="text-white" size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 h-6">
            <div className="text-slate-500 text-sm">
                 {swapState.outputAmount && swapState.outputToken.price 
                    ? `$${(parseFloat(swapState.outputAmount) * swapState.outputToken.price).toFixed(2)}` 
                    : ''}
            </div>
             <div className="flex items-center gap-2">
                 {/* Gemini Insight Trigger for Output */}
                 <button 
                    onClick={(e) => handleAnalysisClick(e, swapState.outputToken)}
                    className="flex items-center gap-1 text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full hover:bg-pink-500/20 transition-colors"
                 >
                    <Info size={10} />
                    <span>Gemini Analysis</span>
                 </button>
                <div className="text-slate-500 text-sm">Balance: 0</div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onConnect}
        className="w-full mt-2 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 active:scale-[0.99] font-semibold text-xl py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWalletConnected ? 'Swap' : 'Connect Wallet'}
      </button>
      
      {isWalletConnected && swapState.inputAmount && (
         <div className="mt-3 flex justify-between text-xs text-slate-500 px-2">
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
