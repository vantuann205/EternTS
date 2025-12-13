import React, { useState } from 'react';
import { Settings, ChevronDown, CreditCard, DollarSign } from 'lucide-react';
import { Token } from '../types';
import TokenModal from './TokenModal';
import { TOKENS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCardanoWallet } from '../contexts/CardanoWalletContext';
import LoadingAnimation from './LoadingAnimation';

interface BuyCardProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  onTokenChange?: (token: Token) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const BuyCard: React.FC<BuyCardProps> = ({ isWalletConnected, onConnect, onTokenChange, activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { balance } = useCardanoWallet();
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]); // ETH
  const [fiatAmount, setFiatAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

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

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    onTokenChange?.(token);
    // Calculate token amount based on fiat
    if (fiatAmount && token.price) {
      const calculatedTokens = parseFloat(fiatAmount) / token.price;
      setTokenAmount(calculatedTokens.toFixed(6));
    }
  };

  const handleFiatAmountChange = (value: string) => {
    setFiatAmount(value);
    if (value && selectedToken && selectedToken.price) {
      const calculatedTokens = parseFloat(value) / selectedToken.price;
      setTokenAmount(calculatedTokens.toFixed(6));
    } else {
      setTokenAmount('');
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: '2.5%' },
    { id: 'bank', name: 'Bank Transfer', icon: DollarSign, fee: '0.5%' },
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
          <button className={`opacity-100`}>
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

      {/* Fiat Amount */}
      <div className={`rounded-2xl p-4 mb-4 mx-4 transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>You pay</span>
          <div className="flex gap-2">
            {['$100', '$500', '$1000'].map((amount) => (
              <button
                key={amount}
                onClick={() => handleFiatAmountChange(amount.slice(1))}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="0"
            value={fiatAmount}
            onChange={(e) => handleFiatAmountChange(e.target.value)}
            className={`bg-transparent text-4xl outline-none w-full font-medium ${
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

      {/* Token Amount */}
      <div className={`rounded-2xl p-4 mb-4 mx-4 transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>You receive</span>
          <div className="flex flex-col items-end">
            <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
              Rate: ${selectedToken.price ? selectedToken.price.toFixed(2) : '0.00'}
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
              Balance: {getTokenBalance(selectedToken)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="0"
            value={tokenAmount}
            readOnly
            className={`bg-transparent text-4xl outline-none w-full font-medium cursor-default ${
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
      </div>

      {/* Payment Method */}
      <div className={`rounded-2xl p-4 mb-4 mx-4 ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>Payment method</span>
        </div>
        
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                paymentMethod === method.id
                  ? theme === 'dark'
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-green-50 border border-green-200 text-green-700'
                  : theme === 'dark'
                    ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <method.icon size={20} />
                <span className="font-medium">{method.name}</span>
              </div>
              <span className="text-sm">Fee: {method.fee}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Buy Button */}
      <div className="mx-4">
        <button 
          onClick={() => {
            if (isWalletConnected) {
              setIsBuying(true);
              // Simulate buy transaction
              setTimeout(() => setIsBuying(false), 4000);
            } else {
              onConnect();
            }
          }}
          disabled={!fiatAmount || parseFloat(fiatAmount) <= 0 || isBuying}
          className={`w-full mt-2 font-semibold text-xl py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
          theme === 'dark' 
            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20' 
            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
        }`}
        >
          {isBuying ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingAnimation size={24} message="" />
              <span>Loading...</span>
            </div>
          ) : isWalletConnected ? `Buy ${selectedToken.symbol}` : 'Connect Wallet'}
        </button>
      </div>
      
      {fiatAmount && parseFloat(fiatAmount) > 0 && (
        <div className={`mt-4 p-3 rounded-xl mx-4 ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border border-slate-700/50' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex justify-between text-sm mb-1">
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
              Subtotal
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ${fiatAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
              Fee ({paymentMethods.find(m => m.id === paymentMethod)?.fee})
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ${(parseFloat(fiatAmount) * (paymentMethod === 'card' ? 0.025 : 0.005)).toFixed(2)}
            </span>
          </div>
          <hr className={`my-2 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`} />
          <div className="flex justify-between text-sm font-medium">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Total
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ${(parseFloat(fiatAmount) * (1 + (paymentMethod === 'card' ? 0.025 : 0.005))).toFixed(2)}
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

export default BuyCard;