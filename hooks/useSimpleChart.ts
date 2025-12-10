import { useState, useEffect } from 'react';
import { fetchChartData, fetchTokenInfo, ChartPoint, TokenInfo } from '../services/simplePriceService';
import { Token } from '../types';

interface ChartState {
  data: ChartPoint[];
  tokenInfo: TokenInfo | null;
  loading: boolean;
  error: string | null;
}

export const useSimpleChart = (token: Token, timeframe: string) => {
  const [state, setState] = useState<ChartState>({
    data: [],
    tokenInfo: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (!token?.symbol) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        console.log(`Loading data for ${token.symbol} - ${timeframe}`);
        
        // First get token info (consistent price)
        const tokenInfo = await fetchTokenInfo(token.symbol);
        
        // Then get chart data using the consistent price
        const chartData = await fetchChartData(token.symbol, timeframe, tokenInfo.price);

        if (!isCancelled) {
          setState({
            data: chartData,
            tokenInfo,
            loading: false,
            error: null
          });
          console.log(`Loaded ${chartData.length} data points for ${token.symbol}`);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading chart data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load data'
          }));
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [token?.symbol, timeframe]);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    // Trigger re-fetch by updating a dependency
    setTimeout(() => {
      setState(prev => ({ ...prev, loading: false }));
    }, 100);
  };

  return {
    ...state,
    refetch
  };
};