import { useState, useEffect, useCallback } from 'react';
import { fetchChartData, fetchTokenPrice, rateLimitedFetch, PriceData, TokenPrice } from '../services/priceService';
import { Token } from '../types';

interface ChartDataState {
  data: PriceData[];
  loading: boolean;
  error: string | null;
  currentPrice: TokenPrice | null;
}

export const useChartData = (token: Token, timeframe: string) => {
  const [state, setState] = useState<ChartDataState>({
    data: [],
    loading: false,
    error: null,
    currentPrice: null
  });

  const fetchData = useCallback(async () => {
    if (!token?.symbol) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`Fetching data for ${token.symbol} - ${timeframe}`);
      
      // Fetch both chart data and current price with proper rate limiting
      const chartDataPromise = rateLimitedFetch(() => fetchChartData(token.symbol, timeframe));
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const priceDataPromise = rateLimitedFetch(() => fetchTokenPrice(token.symbol));

      const [chartData, priceData] = await Promise.all([chartDataPromise, priceDataPromise]);

      console.log(`Fetched ${chartData.length} chart points for ${token.symbol}`);

      setState({
        data: chartData,
        loading: false,
        error: null,
        currentPrice: priceData
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    }
  }, [token?.symbol, timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch
  };
};