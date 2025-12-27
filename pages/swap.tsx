import React, { useState } from 'react';
import { MeshProvider } from '@meshsdk/react';
import Header from '../components/Header';
import SimpleSwap from '../components/SimpleSwap';
import WalletModal from '../components/WalletModal';

export default function SwapPage() {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <MeshProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header onWalletClick={() => setShowWalletModal(true)} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                ADA/SNEK Swap Demo
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Demo swap interface for ADA/SNEK pair on Cardano testnet
              </p>
            </div>

            {/* Main Swap Interface */}
            <div className="flex justify-center mb-8">
              <SimpleSwap />
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Connect your Cardano wallet (Nami, Eternl, etc.)</li>
                    <li>Make sure you're on Cardano testnet</li>
                    <li>Have some testnet ADA for transactions</li>
                    <li>Enter the amount you want to swap</li>
                    <li>Click "Swap" and sign the transaction</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Demo Features</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Real-time price calculations</li>
                    <li>Automatic slippage protection</li>
                    <li>Transaction signing with your wallet</li>
                    <li>Pool information display</li>
                    <li>Exchange rate visualization</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pool Stats */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Pool State</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <h3 className="text-sm font-medium text-yellow-800">Demo Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is a demo interface. Transactions are real but only move small amounts of testnet ADA. 
                    The actual token swap logic is simulated for demonstration purposes.
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