export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  price?: number; // Mock price for demo
  change24h?: number; // Mock change
}

export interface SwapState {
  inputToken: Token;
  outputToken: Token;
  inputAmount: string;
  outputAmount: string;
}

export interface MarketInsight {
  analysis: string;
  sources: { title: string; uri: string }[];
}
