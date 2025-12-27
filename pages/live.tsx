import React from 'react';
import { MeshProvider } from '@meshsdk/react';
import RealAmmSwap from '../components/RealAmmSwap';

export default function LivePage() {
  return (
    <MeshProvider>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b-4 border-red-500">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">EternSwap LIVE</h1>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-bold">REAL MONEY LIVE</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Critical Warning */}
            <div className="bg-red-100 border-l-4 border-red-500 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">⚠️ REAL MONEY WARNING ⚠️</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="font-semibold mb-2">This interface uses REAL ADA and SNEK tokens from your wallet!</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Real transactions with real fees (~0.17 ADA per transaction)</li>
                      <li>Real tokens will be swapped from your wallet balance</li>
                      <li>All transactions are permanent on the Cardano blockchain</li>
                      <li>Smart contract interactions with real AMM pool</li>
                      <li>Price impact and slippage affect real token amounts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Live ADA/SNEK AMM
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real automated market maker with real wallet connections and real token swaps
              </p>
            </div>

            {/* Main AMM Interface */}
            <div className="flex justify-center mb-8">
              <RealAmmSwap />
            </div>

            {/* Real Features */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Real AMM Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🔗 Real Smart Contract</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Deployed AMM validator on Cardano testnet</li>
                    <li>Real UTxO consumption and creation</li>
                    <li>Plutus script execution with redeemers</li>
                    <li>On-chain pool state management</li>
                    <li>Real constant product formula (x × y = k)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Real Token Operations</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Real ADA and SNEK token transfers</li>
                    <li>Actual wallet balance deductions</li>
                    <li>Real trading fees (0.3% per swap)</li>
                    <li>Live price impact calculations</li>
                    <li>Slippage protection mechanisms</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How Real AMM Works</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pool State Loading</h3>
                    <p className="text-gray-600">
                      Fetches real pool UTxO from blockchain using Blockfrost API. 
                      Parses on-chain datum to get current ADA/SNEK reserves.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Swap Calculation</h3>
                    <p className="text-gray-600">
                      Uses real pool reserves to calculate output using constant product formula.
                      Applies 0.3% trading fee and shows price impact.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Transaction Building</h3>
                    <p className="text-gray-600">
                      Creates real Cardano transaction consuming pool UTxO, 
                      executing swap logic, and creating new pool state.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Blockchain Execution</h3>
                    <p className="text-gray-600">
                      Transaction signed by your wallet and submitted to Cardano testnet.
                      Smart contract validates swap and updates pool state.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prerequisites for Real Trading</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Wallet Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Cardano wallet (Nami, Eternl, Flint)</li>
                    <li>Wallet configured for testnet</li>
                    <li>Minimum 10 ADA for transactions and fees</li>
                    <li>SNEK tokens for SNEK→ADA swaps</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Get Testnet Tokens</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>
                      <a 
                        href="https://testnets.cardano.org/en/testnets/cardano/tools/faucet/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Cardano Testnet Faucet
                      </a> - Get free testnet ADA
                    </li>
                    <li>SNEK testnet tokens from community</li>
                    <li>Ensure sufficient balance for fees</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Transaction Costs */}
            <div className="bg-yellow-50 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real Transaction Costs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">~0.17 ADA</div>
                  <div className="text-gray-600">Network Fee</div>
                  <div className="text-xs text-gray-500 mt-1">Per transaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">0.3%</div>
                  <div className="text-gray-600">Trading Fee</div>
                  <div className="text-xs text-gray-500 mt-1">Of swap amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">Variable</div>
                  <div className="text-gray-600">Price Impact</div>
                  <div className="text-xs text-gray-500 mt-1">Based on swap size</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MeshProvider>
  );
}