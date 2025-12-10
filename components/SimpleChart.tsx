import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Token } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useSimpleChart } from '../hooks/useSimpleChart';
import { RefreshCw, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface SimpleChartProps {
  token?: Token;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ token }) => {
  const { theme } = useTheme();
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  
  // Use simple chart hook
  const { data, tokenInfo, loading, error, refetch } = useSimpleChart(token!, activeTimeframe);
  
  // Use token info or fallback to token data
  const displayPrice = tokenInfo?.price || token?.price || 0;
  const displayChange = tokenInfo?.change24h || token?.change24h || 0;
  const isPositive = displayChange >= 0;

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
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mb-4 p-3 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <p className="text-sm">Using simulated data: {error}</p>
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
              <p>Loading chart...</p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
        {data.length > 0 && (
          <div className="space-y-1">
            <div>Showing {data.length} data points for {activeTimeframe} timeframe</div>
            <div>
              Price: ${displayPrice.toFixed(displayPrice < 1 ? 6 : 2)} • 
              Change: <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                {isPositive ? '+' : ''}{displayChange.toFixed(2)}%
              </span> • 
              Range: ${Math.min(...data.map(d => d.value)).toFixed(2)} - ${Math.max(...data.map(d => d.value)).toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleChart;