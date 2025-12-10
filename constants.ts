import { Token } from './types';

// Using consistent placeholder images or generic crypto icons
export const TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ether',
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    price: 3150.24,
    change24h: 2.5
  },
  {
    symbol: 'USDC',
    name: 'USDC',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    price: 1.00,
    change24h: 0.01
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
    price: 11.45,
    change24h: -1.2
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    price: 64230.10,
    change24h: 4.1
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
    price: 14.25,
    change24h: 3.2
  },
  {
    symbol: 'AAVE',
    name: 'Aave',
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
    price: 95.40,
    change24h: -0.8
  },
  {
    symbol: 'COMP',
    name: 'Compound',
    address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png',
    price: 58.30,
    change24h: 1.5
  },
  {
    symbol: 'MKR',
    name: 'Maker',
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2/logo.png',
    price: 1420.50,
    change24h: 2.1
  }
];

export const MOCK_CHART_DATA = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  value: 3000 + Math.random() * 200 - 100 + (i * 10),
}));
