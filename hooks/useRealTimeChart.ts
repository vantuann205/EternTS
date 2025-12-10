import { useState, useEffect, useCallback } from 'react';
import { 
  fetchRealPrice, 
  fetchRealChartData, 
  createRealTimePriceStream,
  RealChartPoint, 
  RealTokenInfo 
} from '../services/realPriceService';
import { Token } from '../types';

interface RealTimeChartState {
  chartData: RealChartPoint[];
  currentPrice: RealTokenInfo | null;
  loading: boolean;
  error: string | null;
}

export const useRealTimeChart = (token: Token, timeframe: string) => {
  const [state, setState] = useState<RealTimeChartState>({
    chartData: [],
    currentPrice: null,
    loading: true,
    error: null
  });

  // Fetch chart data when token or timeframe changes
  const fetchChartData = useCallback(async () => {
    if (!token?.symbol) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`Fetching real data for ${token.symbol} - ${timeframe}`);
      
      // Fetch both chart data and current price
      const [chartData, currentPrice] = await Promise.all([
        fetchRealChartData(token.symbol, timeframe),
        fetchRealPrice(token.symbol)
      ]);

      setState({
        chartData,
        currentPrice,
        loading: false,
        error: null
      });

      console.log(`Loaded ${chartData.length} real data points for ${token.symbol}`);
    } catch (error) {
      console.error('Error fetching real chart data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch real data'
      }));
    }
  }, [token?.symbol, timeframe]);

  // Set up real-time price updates
  useEffect(() => {
    if (!token?.symbol) return;

    let cleanup: (() => void) | null = null;

    const setupRealTimeUpdates = () => {
      cleanup = createRealTimePriceStream(token.symbol, (updatedPrice) => {
        setState(prev => ({
          ...prev,
          currentPrice: updatedPrice
        }));
      });
    };

    // Start real-time updates after initial data load
    if (state.currentPrice && !state.loading) {
      setupRealTimeUpdates();
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [token?.symbol, state.currentPrice, state.loading]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const refetch = useCallback(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    ...state,
    refetch
  };
};