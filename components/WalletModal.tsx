import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LoadingAnimation from './LoadingAnimation';

interface WalletOption {
  name: string;
  icon: string;
  displayName: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletName: string) => void;
  availableWallets: WalletOption[];
  connecting: boolean;
  retryCount?: number;
}

const WalletModal: React.FC<WalletModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectWallet, 
  availableWallets,
  connecting,
  retryCount = 0
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl p-6 transition-all ${
        theme === 'dark' 
          ? 'bg-slate-900 border border-slate-800' 
          : 'bg-white border border-gray-200 shadow-xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Kết nối ví
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-3">
          {connecting ? (
            <div className="py-8">
              <LoadingAnimation size={80} message="" />
              <p className={`text-center text-sm mt-4 ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {retryCount === 0 ? 'Connecting to wallet...' : 
                 retryCount === 1 ? 'Retrying connection... (1/2)' :
                 'Final attempt... (2/2)'}
              </p>
              <p className={`text-center text-xs mt-2 ${
                theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
              }`}>
                {retryCount === 0 ? 'Auto-retry if connection fails' :
                 retryCount < 2 ? 'Please wait, trying again...' :
                 'Last attempt, please wait...'}
              </p>
            </div>
          ) : availableWallets.length === 0 ? (
            <div className={`text-center py-8 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <p className="mb-4">Không tìm thấy ví Cardano nào.</p>
              <p className="text-sm">Vui lòng cài đặt một ví Cardano như:</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>• Nami Wallet</p>
                <p>• Eternl Wallet</p>
                <p>• Flint Wallet</p>
                <p>• Typhon Wallet</p>
              </div>
            </div>
          ) : (
            availableWallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => onSelectWallet(wallet.name)}
                disabled={connecting}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  connecting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : theme === 'dark'
                      ? 'hover:bg-slate-800 border border-slate-700 hover:border-slate-600'
                      : 'hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                } ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}`}
              >
                <img 
                  src={wallet.icon} 
                  alt={wallet.displayName}
                  className="w-10 h-10 rounded-lg"
                />
                <div className="flex-1 text-left">
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {wallet.displayName}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Nhấn để kết nối
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t text-center text-xs ${
          theme === 'dark' 
            ? 'border-slate-700 text-slate-500' 
            : 'border-gray-200 text-gray-500'
        }`}>
          Bằng cách kết nối ví, bạn đồng ý với Điều khoản dịch vụ của EternTS
        </div>
      </div>
    </div>
  );
};

export default WalletModal;