import React, { useState } from 'react';
import { MeshProvider } from '@meshsdk/react';
import Header from '../components/Header';
import AmmCard from '../components/AmmCard';
import WalletModal from '../components/WalletModal';
import { useAmm } from '../hooks/useAmm';

// Script CBOR từ environment
const SCRIPT_CBOR = process.env.NEXT_PUBLIC_AMM_SCRIPT_CBOR || 'demo_script_cbor';

export default function AmmPage() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { poolState, loading, error, getPoolLiquidity, getPoolRatio } = useAmm(SCRIPT_CBOR);

  const poolLiquidity = getPoolLiquidity();
  const poolRatio = getPoolRatio();

  return (
    <MeshProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header onWalletClick={() => setShowWalletModal(true)} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                ADA/SNEK Automated Market Maker
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Swap tokens and provide liquidity to earn fees on the Cardano blockchain
              </p>
            </div>

            {/* Pool Stats */}
            {poolState && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Liquidity</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600">
                      {poolLiquidity ? `${poolLiquidity.ada.toFixed(2)} ADA` : '0 ADA'}
                    </p>
                    <p className="text-lg text-gray-600">
                      {poolLiquidity ? `${poolLiquidity.snek.toLocaleString()} SNEK` : '0 SNEK'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Exchange Rate</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {poolRatio ? `${poolRatio.toFixed(0)} SNEK` : '0 SNEK'}
                    </p>
                    <p className="text-sm text-gray-600">per 1 ADA</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">LP Tokens</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-purple-600">
                      {poolState.total_lp.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Supply</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-600">Loading pool data...</span>
                </div>
              </div>
            )}

            {/* Main AMM Interface */}
            <div className="flex justify-center">
              <AmmCard scriptCbor={SCRIPT_CBOR} />
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Swapping Tokens</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Connect your Cardano wallet</li>
                    <li>Select the token you want to swap from</li>
                    <li>Enter the amount you want to swap</li>
                    <li>Review the exchange rate and slippage</li>
                    <li>Click "Swap" and confirm the transaction</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Providing Liquidity</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Go to the "Liquidity" tab</li>
                    <li>Enter the amount of ADA you want to provide</li>
                    <li>The required SNEK amount will be calculated automatically</li>
                    <li>Click "Add Liquidity" to provide both tokens</li>
                    <li>Receive LP tokens representing your share</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Disclaimer</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is a demo AMM implementation. Please use testnet tokens only. 
                    Always verify smart contract addresses and understand the risks before using with real funds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Wallet Modal */}
        {showWalletModal && (
          <WalletModal onClose={() => setShowWalletModal(false)} />
        )}
      </div>
    </MeshProvider>
  );
}