import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Connection Failed",
  message 
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              theme === 'dark' 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-red-100 text-red-600'
            }`}>
              <AlertCircle size={20} />
            </div>
            <h2 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h2>
          </div>
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

        {/* Message */}
        <div className={`mb-6 ${
          theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
        }`}>
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            Close
          </button>
          <button
            onClick={() => window.location.reload()}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;