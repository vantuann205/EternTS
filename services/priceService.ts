// CoinGecko API service for real price data
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Mapping token symbols to CoinGecko IDs
const TOKEN_ID_MAP: { [key: string]: string } = {
  'ETH': 'ethereum',
  'USDC': 'usd-coin',
  'WBTC': 'wrapped-bitcoin',
  'UNI': 'uniswap',
  'LINK': 'chainlink',
  'AAVE': 'aave',
  'COMP': 'compound-governance-token',
  'MKR': 'maker',
  'SNX': 'havven',
  'CRV': 'curve-dao-token'
};

// Timeframe mapping for CoinGecko API
const TIMEFRAME_CONFIG: { [key: string]: { days: number; interval?: string } } = {
  '1H': { days: 1, interval: 'minutely' },
  '1D': { days: 1, interval: 'hourly' },
  '1W': { days: 7, interval: 'hourly' },
  '1M': { days: 30, interval: 'daily' },
  '1Y': { days: 365, interval: 'daily' }
};

export interface PriceData {
  timestamp: number;
  price: number;
}

export interface TokenPrice {
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

// Fetch current price and 24h change for a token
export const fetchTokenPrice = async (symbol: string): Promise<TokenPrice | null> => {
  try {
    const coinId = TOKEN_ID_MAP[symbol.toUpperCase()];
    if (!coinId) {
      console.warn(`No CoinGecko ID found for token: ${symbol}`);
      return null;
    }

    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const tokenData = data[coinId];

    if (!tokenData) {
      throw new Error(`No data found for token: ${symbol}`);
    }

    return {
      current_price: tokenData.usd,
      price_change_percentage_24h: tokenData.usd_24h_change || 0,
      market_cap: tokenData.usd_market_cap || 0,
      total_volume: tokenData.usd_24h_vol || 0
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
};

// Fetch historical price data for chart
export const fetchChartData = async (symbol: string, timeframe: string): Promise<PriceData[]> => {
  try {
    const coinId = TOKEN_ID_MAP[symbol.toUpperCase()];
    if (!coinId) {
      console.warn(`No CoinGecko ID found for token: ${symbol}`);
      return [];
    }

    const config = TIMEFRAME_CONFIG[timeframe];
    if (!config) {
      console.warn(`No config found for timeframe: ${timeframe}`);
      return [];
    }

    // Build URL with proper parameters
    let url = `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${config.days}`;
    if (config.interval) {
      url += `&interval=${config.interval}`;
    }

    console.log(`Fetching chart data for ${symbol} (${timeframe}):`, url);
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error(`Invalid data format for ${symbol}`);
    }

    console.log(`Received ${data.prices.length} data points for ${symbol} (${timeframe})`);

    // Convert to our format and ensure we have reasonable data
    const priceData = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price
    }));

    // For 1H timeframe, limit to last 60 data points (1 per minute)
    if (timeframe === '1H' && priceData.length > 60) {
      return priceData.slice(-60);
    }

    return priceData;
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error);
    return [];
  }
};

// Fetch multiple tokens data at once
export const fetchMultipleTokenPrices = async (symbols: string[]): Promise<{ [symbol: string]: TokenPrice }> => {
  try {
    const coinIds = symbols
      .map(symbol => TOKEN_ID_MAP[symbol.toUpperCase()])
      .filter(Boolean);

    if (coinIds.length === 0) {
      return {};
    }

    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const result: { [symbol: string]: TokenPrice } = {};

    // Map back to symbols
    symbols.forEach(symbol => {
      const coinId = TOKEN_ID_MAP[symbol.toUpperCase()];
      if (coinId && data[coinId]) {
        const tokenData = data[coinId];
        result[symbol] = {
          current_price: tokenData.usd,
          price_change_percentage_24h: tokenData.usd_24h_change || 0,
          market_cap: tokenData.usd_market_cap || 0,
          total_volume: tokenData.usd_24h_vol || 0
        };
      }
    });

    return result;
  } catch (error) {
    console.error('Error fetching multiple token prices:', error);
    return {};
  }
};

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

export const rateLimitedFetch = async <T>(fetchFunction: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return fetchFunction();
};