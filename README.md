# EternTS - Cardano DEX Trading Platform

A modern, responsive Cardano DEX interface built with Next.js, TypeScript, Tailwind CSS, and MeshSDK for native Cardano wallet integration

## Features

- Modern, responsive design with dark/light theme support
- Swap interface for Cardano native tokens
- Native Cardano wallet integration with MeshSDK
- Real-time wallet balance and address display
- Real-time price charts (TradingView integration)
- Multi-language support (English, Vietnamese, Chinese)
- Mobile-responsive design
- Fast performance with Next.js
- Trading modes: Swap, Limit Orders, Buy, Sell
- 15 Cardano ecosystem tokens with authentic logos

## Cardano Ecosystem Tokens

The platform supports 15 major Cardano ecosystem tokens:
- **ADA** - Cardano native token
- **AGIX** - SingularityNET
- **DJED** - Djed stablecoin
- **SHEN** - Shen reserve token
- **MIN** - Minswap DEX token
- **SUNDAE** - SundaeSwap DEX token
- **WMT** - World Mobile Token
- **HOSKY** - Hosky meme token
- **MILK** - MuesliSwap token
- **CLAY** - Clay Nation NFT token
- **VYFI** - VyFinance DeFi token
- **COPI** - Cornucopias gaming token
- **HUNT** - Hunt token
- **BOOK** - BOOK token
- **NEWM** - NEWM music token


## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet Integration**: MeshSDK (@meshsdk/core, @meshsdk/react)
- **Charts**: TradingView Widget
- **Icons**: Lucide React
- **Blockchain**: Cardano

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Install a Cardano wallet (Nami, Eternl, or Flint) to test wallet connectivity


## Wallet Connection Flow

1. Click "Connect Wallet" button
2. System detects available Cardano wallets
3. User approves connection in wallet extension
4. Wallet address and balance are displayed
5. User can copy address and view balance in dropdown
6. Disconnect option available in wallet dropdown

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development Notes

- The wallet integration currently uses a simulation for development
- In production, uncomment the actual MeshSDK implementation in `CardanoWalletContext.tsx`
- Token prices are mock data - integrate with real Cardano DEX APIs for production
- Charts show placeholder data - integrate with real price feeds for production

## License

MIT
