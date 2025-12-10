import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TOKENS } from '../constants';
import { Token } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useChartData } from '../hooks/useChartData';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartWidgetProps {
  token?: Token;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ token = TOKENS[0] }) => {
  const { theme } = useTheme();
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  
  // Fetch real data from API
  const { data: chartData, loading, error, currentPrice, refetch } = useChartData(token, activeTimeframe);
  
  // Use API data or fallback to token data
  const displayPrice = currentPrice?.current_price || token.price || 0;
  const displayChange = currentPrice?.price_change_percentage_24h || token.change24h || 0;
  const isPositive = displayChange >= 0;
  
  // Format chart data for Recharts with proper time formatting
  const chartDataFormatted = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    
    return chartData.map((point, index) => {
      const date = new Date(point.timestamp);
      let timeLabel = '';
      
      // Format time based on timeframe
      switch (activeTimeframe) {
        case '1H':
          timeLabel = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          break;
        case '1D':
          timeLabel = date.toLocaleTimeString('en-US', { 
            hour: '2-digit',
            hour12: false 
          });
          break;
        case '1W':
          timeLabel = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            day: 'numeric'
          });
          break;
        case '1M':
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          });
          break;
        case '1Y':
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short',
            year: '2-digit'
          });
          break;
        default:
          timeLabel = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
      }
      
      return {
        time: timeLabel,
        value: point.price,
        timestamp: point.timestamp,
        fullDate: date.toLocaleString()
      };
    });
  }, [chartData, activeTimeframe]);

  return (
    <div className={`w-full h-full min-h-[400px] flex flex-col p-6 bg-transparent transition-colors ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
                <img src={token.logoURI} className="w-8 h-8 rounded-full" alt="logo" />
                <h2 className={`text-2xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{token.name}</h2>
                <span className={`text-lg ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{token.symbol}</span>
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
        
        <div className="flex items-end gap-4 mb-8">
            <div className={`text-4xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
            <div className={`flex items-center gap-1 text-lg font-medium mb-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {isPositive ? '+' : ''}{displayChange.toFixed(2)}%
            </div>
            <div className={`mb-1 text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>(24H)</div>
        </div>

        {error && (
            <div className={`mb-4 p-3 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-red-900/20 border-red-800 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
                <p className="text-sm">Failed to load data: {error}</p>
                <button 
                    onClick={refetch}
                    className="text-xs underline hover:no-underline mt-1"
                >
                    Try again
                </button>
            </div>
        )}

        {/* Time Tabs */}
        <div className="flex gap-4 mb-6">
            {['1H', '1D', '1W', '1M', '1Y'].map((timeframe) => (
                <button 
                    key={timeframe}
                    onClick={() => setActiveTimeframe(timeframe)}
                    disabled={loading}
                    className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg disabled:opacity-50 ${
                      activeTimeframe === timeframe 
                        ? 'text-pink-500 bg-pink-500/10 border border-pink-500/20' 
                        : theme === 'dark' 
                          ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {timeframe}
                </button>
            ))}
        </div>

        {/* Chart */}
        <div className="flex-1 w-full min-h-[300px] relative">
            {loading && chartDataFormatted.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        <RefreshCw size={32} className="animate-spin mx-auto mb-2" />
                        <p>Loading chart data...</p>
                    </div>
                </div>
            )}
            
            {chartDataFormatted.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataFormatted}>
                        <defs>
                            <linearGradient id={`colorValue-${theme}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: theme === 'dark' ? '#64748b' : '#6b7280' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis 
                            domain={['dataMin - dataMin * 0.01', 'dataMax + dataMax * 0.01']} 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: theme === 'dark' ? '#64748b' : '#6b7280' }}
                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                              border: theme === 'dark' ? 'none' : '1px solid #e5e7eb', 
                              borderRadius: '8px', 
                              color: theme === 'dark' ? '#fff' : '#374151',
                              boxShadow: theme === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                            itemStyle={{ color: theme === 'dark' ? '#fff' : '#374151' }}
                            formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0] && payload[0].payload) {
                                return `Time: ${payload[0].payload.fullDate}`;
                              }
                              return `Time: ${label}`;
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#ec4899" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill={`url(#colorValue-${theme})`} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : !loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        <p>No chart data available</p>
                        <button 
                            onClick={refetch}
                            className="text-pink-500 hover:text-pink-400 underline text-sm mt-2"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ChartWidget;