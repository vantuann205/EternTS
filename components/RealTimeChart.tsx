import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Token } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useRealTimeChart } from '../hooks/useRealTimeChart';
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, Wifi, WifiOff } from 'lucide-react';

interface RealTimeChartProps {
  token?: Token;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ token }) => {
  const { theme } = useTheme();
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [isRealTime, setIsRealTime] = useState(true);
  
  // Use real-time chart hook
  const { chartData, currentPrice, loading, error, refetch } = useRealTimeChart(token!, activeTimeframe);
  
  // Display price info
  const displayPrice = currentPrice?.price || token?.price || 0;
  const displayChange = currentPrice?.change24h || token?.change24h || 0;
  const isPositive = displayChange >= 0;

  // Real-time indicator
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  useEffect(() => {
    if (currentPrice) {
      setLastUpdate(new Date(currentPrice.lastUpdated));
    }
  }, [currentPrice]);

  if (!token) {
    return (
      <div className={`w-full h-full min-h-[400px] flex items-center justify-center ${
        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
      }`}>
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No token selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[400px] flex flex-col p-6 bg-transparent transition-colors ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={token.logoURI} className="w-8 h-8 rounded-full" alt={token.name} />
          <h2 className={`text-2xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {token.name}
          </h2>
          <span className={`text-lg ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
            {token.symbol}
          </span>
          
          {/* Real-time indicator */}
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            error?.includes('Rate limited') || error?.includes('429')
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              : isRealTime 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {error?.includes('Rate limited') || error?.includes('429') ? (
              <>
                <WifiOff size={12} />
                <span>FALLBACK</span>
              </>
            ) : isRealTime ? (
              <>
                <Wifi size={12} />
                <span>LIVE</span>
              </>
            ) : (
              <>
                <WifiOff size={12} />
                <span>OFFLINE</span>
              </>
            )}
          </div>
          
          {loading && (
            <RefreshCw size={16} className={`animate-spin ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
          )}
        </div>
        
        <button 
          onClick={refetch}
          disabled={loading}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          } disabled:opacity-50`}
          title="Refresh data"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {/* Price Info */}
      <div className="flex items-end gap-4 mb-6">
        <div className={`text-4xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ${displayPrice.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: displayPrice < 1 ? 6 : 2 
          })}
        </div>
        <div className={`flex items-center gap-1 text-lg font-medium mb-1 ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          {isPositive ? '+' : ''}{displayChange.toFixed(2)}%
        </div>
        <div className={`mb-1 text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
          (24H)
        </div>
        
        {/* Last update time */}
        <div className={`mb-1 text-xs ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`}>
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mb-4 p-3 rounded-lg border ${
          error.includes('429') || error.includes('Rate limited')
            ? theme === 'dark' 
              ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-600'
            : theme === 'dark' 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <p className="text-sm">
            {error.includes('429') || error.includes('Rate limited') 
              ? '⚠️ Using fallback data - CoinGecko rate limit reached' 
              : `API Error: ${error}`}
          </p>
          {!error.includes('Rate limited') && (
            <button 
              onClick={refetch}
              className="text-xs underline hover:no-underline mt-1"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Timeframe Tabs */}
      <div className="flex gap-2 mb-6">
        {['1H', '1D', '1W', '1M', '1Y'].map((timeframe) => (
          <button 
            key={timeframe}
            onClick={() => setActiveTimeframe(timeframe)}
            disabled={loading}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
              activeTimeframe === timeframe 
                ? 'bg-pink-500 text-white shadow-md' 
                : theme === 'dark' 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {timeframe}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              <RefreshCw size={32} className="animate-spin mx-auto mb-2" />
              <p>Loading real data from CoinGecko...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id={`gradient-${theme}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 12, 
                  fill: theme === 'dark' ? '#64748b' : '#6b7280' 
                }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 12, 
                  fill: theme === 'dark' ? '#64748b' : '#6b7280' 
                }}
                tickFormatter={(value) => `$${value.toFixed(displayPrice < 1 ? 4 : 0)}`}
                domain={['dataMin * 0.999', 'dataMax * 1.001']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  border: theme === 'dark' ? 'none' : '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  color: theme === 'dark' ? '#fff' : '#374151',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: theme === 'dark' ? '#fff' : '#374151' }}
                formatter={(value: number) => [
                  `$${value.toFixed(displayPrice < 1 ? 6 : 2)}`, 
                  'Price'
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ec4899" 
                strokeWidth={2}
                fill={`url(#gradient-${theme})`}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: '#ec4899',
                  stroke: theme === 'dark' ? '#1e293b' : '#ffffff',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p>No chart data available</p>
              <button 
                onClick={refetch}
                className="text-pink-500 hover:text-pink-400 underline text-sm mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Info */}
      <div className={`mt-4 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} text-center`}>
        {chartData.length > 0 && (
          <div className="space-y-1">
            <div>
              📊 {chartData.length} data points • 
              🕒 {activeTimeframe} timeframe • 
              🔄 Real-time updates every 1s
            </div>
            <div>
              💰 Current: ${displayPrice.toFixed(displayPrice < 1 ? 6 : 2)} • 
              📈 Range: ${Math.min(...chartData.map(d => d.value)).toFixed(2)} - ${Math.max(...chartData.map(d => d.value)).toFixed(2)} •
              {error?.includes('Rate limited') || error?.includes('429') 
                ? '⚠️ Fallback Data' 
                : '🌐 CoinGecko API'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChart;