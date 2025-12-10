import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ApiStatus: React.FC = () => {
  const { theme } = useTheme();
  const [status, setStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/ping');
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('offline');
      }
      setLastCheck(new Date());
    };

    // Check immediately
    checkApiStatus();

    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'error': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online': return <Wifi size={12} />;
      case 'offline': return <WifiOff size={12} />;
      case 'error': return <AlertCircle size={12} />;
      default: return <Wifi size={12} />;
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
      theme === 'dark' 
        ? 'bg-slate-800/90 border border-slate-700' 
        : 'bg-white/90 border border-gray-200 shadow-lg'
    } backdrop-blur-sm`}>
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="capitalize">{status}</span>
      </div>
      <span className={theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}>
        CoinGecko API
      </span>
    </div>
  );
};

export default ApiStatus;