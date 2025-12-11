import React, { useEffect, useRef, useState } from 'react';
import { Token } from '../types';
import { useTheme } from '../contexts/ThemeContext';

// TradingView symbol mapping
const TRADINGVIEW_SYMBOLS: { [symbol: string]: string } = {
  'ETH': 'BINANCE:ETHUSDT',
  'BTC': 'BINANCE:BTCUSDT', 
  'USDC': 'BINANCE:USDCUSDT',
  'USDT': 'COINBASE:USDTUSD',
  'WBTC': 'BINANCE:WBTCUSDT',
  'UNI': 'BINANCE:UNIUSDT',
  'LINK': 'BINANCE:LINKUSDT',
  'AAVE': 'BINANCE:AAVEUSDT',
  'COMP': 'BINANCE:COMPUSDT',
  'MKR': 'BINANCE:MKRUSDT',
  'MATIC': 'BINANCE:MATICUSDT',
  'SOL': 'BINANCE:SOLUSDT',
  'AVAX': 'BINANCE:AVAXUSDT'
};

interface TradingViewChartProps {
  token?: Token;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ token }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Create TradingView widget
  useEffect(() => {
    if (!scriptLoaded || !token || !containerRef.current) return;

    const symbol = TRADINGVIEW_SYMBOLS[token.symbol.toUpperCase()] || 'BINANCE:ETHUSDT';
    
    // Clear previous widget
    if (widgetRef.current) {
      widgetRef.current.remove();
    }

    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: '60', // 1 hour default
        timezone: 'Etc/UTC',
        theme: theme === 'dark' ? 'dark' : 'light',
        style: '1', // Candlestick
        locale: 'en',
        toolbar_bg: theme === 'dark' ? '#1e293b' : '#ffffff',
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: containerRef.current.id,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        studies: [
          'Volume@tv-basicstudies'
        ],
        overrides: {
          // Candlestick colors
          "mainSeriesProperties.candleStyle.upColor": "#10b981",
          "mainSeriesProperties.candleStyle.downColor": "#ef4444",
          "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
          "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
          
          // Volume colors
          "volumePaneSize": "medium",
          "scalesProperties.backgroundColor": theme === 'dark' ? '#1e293b' : '#ffffff',
          "paneProperties.background": theme === 'dark' ? '#0f172a' : '#ffffff',
          "paneProperties.backgroundType": "solid",
        },
        loading_screen: {
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          foregroundColor: theme === 'dark' ? '#64748b' : '#6b7280'
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
      setIsLoading(false);
    }
  }, [scriptLoaded, token, theme]);

  if (!token) {
    return (
      <div className={`w-full h-full min-h-[400px] flex items-center justify-center ${
        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p>Select a token to view chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[500px] flex flex-col transition-colors ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <img src={token.logoURI} className="w-8 h-8 rounded-full" alt={token.name} />
          <h2 className={`text-xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {token.name} ({token.symbol})
          </h2>
          
          {/* TradingView Live indicator */}
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>TradingView Live</span>
          </div>
        </div>
        
        <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          Real-time candlestick chart
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading TradingView Chart...</p>
          </div>
        </div>
      )}

      {/* TradingView Widget Container */}
      <div className="flex-1 relative">
        <div 
          ref={containerRef}
          id={`tradingview-widget-${token.symbol}`}
          className="w-full h-full"
          style={{ minHeight: '500px' }}
        />
      </div>

      {/* Footer Info */}
      <div className={`p-2 text-xs text-center border-t ${
        theme === 'dark' 
          ? 'border-slate-800 text-slate-500' 
          : 'border-gray-200 text-gray-500'
      }`}>
        Real-time data from {TRADINGVIEW_SYMBOLS[token.symbol.toUpperCase()]?.split(':')[0] || 'Binance'}
      </div>
    </div>
  );
};

export default TradingViewChart;