import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CHART_DATA, TOKENS } from '../constants';
import { Token } from '../types';

interface ChartWidgetProps {
  token?: Token;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ token = TOKENS[0] }) => {
  const currentPrice = token.price || 0;
  const change = token.change24h || 0;
  const isPositive = change >= 0;
  
  // Create randomized data based on base mock data to simulate different tokens
  const data = MOCK_CHART_DATA.map(d => ({
      ...d,
      value: token.symbol === 'ETH' ? d.value : d.value / 3000 * currentPrice
  }));

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col p-6 text-white bg-transparent">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
            <img src={token.logoURI} className="w-8 h-8 rounded-full" alt="logo" />
            <h2 className="text-2xl font-medium">{token.name}</h2>
            <span className="text-slate-500 text-lg">{token.symbol}</span>
        </div>
        
        <div className="flex items-end gap-4 mb-8">
            <div className="text-4xl font-medium">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
            <div className={`text-lg font-medium mb-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{change}%
            </div>
            <div className="text-slate-500 mb-1 text-sm">(24H)</div>
        </div>

        {/* Time Tabs */}
        <div className="flex gap-4 mb-6">
            {['1H', '1D', '1W', '1M', '1Y'].map((t, i) => (
                <button 
                    key={t} 
                    className={`text-sm font-medium ${i === 1 ? 'text-pink-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    {t}
                </button>
            ))}
        </div>

        {/* Chart */}
        <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                        labelStyle={{ display: 'none' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ec4899" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default ChartWidget;
