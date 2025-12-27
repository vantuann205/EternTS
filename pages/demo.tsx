import React from 'react';
import BasicSwap from '../components/BasicSwap';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">EternSwap Demo</h1>
            <div className="text-sm text-gray-600">
              Cardano Testnet
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ADA/SNEK Swap Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple demo interface for ADA/SNEK swap calculations
            </p>
          </div>

          {/* Main Swap Interface */}
          <div className="flex justify-center mb-8">
            <BasicSwap />
          </div>

          {/* Pool Stats */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
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

          {/* Instructions */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Click "Connect Wallet" to connect your Cardano wallet</li>
                  <li>Make sure you have a Cardano wallet installed (Nami, Eternl, Flint)</li>
                  <li>Enter the amount you want to swap</li>
                  <li>See the calculated output amount</li>
                  <li>Click "Swap (Demo)" to simulate the transaction</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Demo Features</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Real-time price calculations using AMM formula</li>
                  <li>Automatic slippage and fee calculations</li>
                  <li>Wallet connection simulation</li>
                  <li>Pool information display</li>
                  <li>Exchange rate visualization</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AMM Formula Explanation */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AMM Formula</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Constant Product Formula</h3>
                <p className="text-gray-700 mb-2">x × y = k (where k is constant)</p>
                <p className="text-sm text-gray-600">
                  Current k = {(1000 * 2000000).toLocaleString()} (1,000 ADA × 2,000,000 SNEK)
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Swap Calculation</h3>
                <p className="text-gray-700 mb-2">Output = (Input × Reserve_Out) / (Reserve_In + Input)</p>
                <p className="text-sm text-gray-600">
                  With 0.3% trading fee applied to input amount
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Price Impact</h3>
                <p className="text-gray-700 mb-2">Larger swaps have higher price impact</p>
                <p className="text-sm text-gray-600">
                  Try different amounts to see how price impact changes
                </p>
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
                  This is a demonstration interface showing AMM calculations. 
                  Wallet connections and transactions are simulated for educational purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}