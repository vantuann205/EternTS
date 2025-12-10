import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Info } from 'lucide-react';

interface ChartInfoProps {
  symbol: string;
  timeframe: string;
  dataPoints: number;
  currentPrice: number;
  priceChange: number;
}

const ChartInfo: React.FC<ChartInfoProps> = ({ 
  symbol, 
  timeframe, 
  dataPoints, 
  currentPrice, 
  priceChange 
}) => {
  const { theme } = useTheme();

  return (
    <div className={`flex items-center gap-2 text-xs ${
      theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
    }`}>
      <Info size={12} />
      <span>
        {symbol} • {timeframe} • {dataPoints} points • 
        ${currentPrice.toFixed(currentPrice < 1 ? 6 : 2)} • 
        <span className={priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </span>
      </span>
    </div>
  );
};

export default ChartInfo;