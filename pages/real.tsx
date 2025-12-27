import React from 'react';
import { MeshProvider } from '@meshsdk/react';
import RealSwap from '../components/RealSwap';

export default function RealPage() {
  return (
    <MeshProvider>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b-2 border-red-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">EternSwap Live</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">LIVE TRANSACTIONS</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Warning Banner */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Real Transactions Mode</h3>
                  <p className="text-sm text-red-700 mt-1">
                    This interface creates and submits real transactions on Cardano testnet. 
                    Make sure you have testnet ADA and understand the risks.
                  </p>
                </div>
              </div>
            </div>

            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Real ADA/SNEK Swap
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Connect your Cardano wallet and create real transactions on testnet
              </p>
            </div>

            {/* Main Swap Interface */}
            <div className="flex justify-center mb-8">
              <RealSwap />
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Real Swap</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Cardano wallet installed (Nami, Eternl, or Flint)</li>
                    <li>Wallet configured for testnet</li>
                    <li>Testnet ADA for transaction fees (~0.17 ADA per tx)</li>
                    <li>Understanding that this creates real transactions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Click "Connect [Wallet Name]" to connect your wallet</li>
                    <li>Authorize the connection in your wallet</li>
                    <li>Enter the amount you want to swap</li>
                    <li>Review the exchange rate and fees</li>
                    <li>Click "Create Real Transaction"</li>
                    <li>Sign the transaction in your wallet</li>
                    <li>Wait for confirmation on the blockchain</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Real transactions submitted to Cardano testnet</li>
                    <li>MeshJS library for transaction building</li>
                    <li>Blockfrost API for blockchain interaction</li>
                    <li>Metadata included for swap information</li>
                    <li>Automatic wallet balance updates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fees & Costs</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Network fee: ~0.17 ADA (Cardano network)</li>
                    <li>Trading fee: 0.3% (AMM protocol)</li>
                    <li>No additional platform fees</li>
                    <li>Fees paid in ADA from your wallet</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Testnet Resources */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Testnet Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://testnets.cardano.org/en/testnets/cardano/tools/faucet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-blue-900 mb-2">Testnet Faucet</h4>
                  <p className="text-sm text-blue-700">Get free testnet ADA</p>
                </a>
                <a
                  href="https://preprod.cardanoscan.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-blue-900 mb-2">Block Explorer</h4>
                  <p className="text-sm text-blue-700">View transactions</p>
                </a>
                <a
                  href="https://meshjs.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-blue-900 mb-2">MeshJS Docs</h4>
                  <p className="text-sm text-blue-700">Technical documentation</p>
                </a>
              </div>
            </div>

            {/* Current Pool State */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Pool State</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,000</div>
                  <div className="text-gray-600">ADA Reserve</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">2,000,000</div>
                  <div className="text-gray-600">SNEK Reserve</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">2,000</div>
                  <div className="text-gray-600">SNEK per ADA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">0.3%</div>
                  <div className="text-gray-600">Trading Fee</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MeshProvider>
  );
}