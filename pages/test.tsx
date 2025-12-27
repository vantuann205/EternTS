import React from 'react';
import TestSwap from '../components/TestSwap';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">EternSwap Test</h1>
            <div className="text-sm text-gray-600">
              AMM Demo - No Wallet Required
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ADA/SNEK Swap Test
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Test the AMM swap calculations without wallet connection
            </p>
          </div>

          {/* Main Swap Interface */}
          <div className="flex justify-center mb-8">
            <TestSwap />
          </div>

          {/* Quick Test Buttons */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Test Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  const event = new Event('input', { bubbles: true });
                  const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                  if (input) {
                    input.value = '1';
                    input.dispatchEvent(event);
                  }
                }}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900">Small Swap</div>
                <div className="text-sm text-blue-700">1 ADA → ~1,997 SNEK</div>
                <div className="text-xs text-blue-600">Low price impact</div>
              </button>
              
              <button
                onClick={() => {
                  const event = new Event('input', { bubbles: true });
                  const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                  if (input) {
                    input.value = '10';
                    input.dispatchEvent(event);
                  }
                }}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-green-900">Medium Swap</div>
                <div className="text-sm text-green-700">10 ADA → ~19,743 SNEK</div>
                <div className="text-xs text-green-600">Moderate price impact</div>
              </button>
              
              <button
                onClick={() => {
                  const event = new Event('input', { bubbles: true });
                  const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                  if (input) {
                    input.value = '100';
                    input.dispatchEvent(event);
                  }
                }}
                className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-yellow-900">Large Swap</div>
                <div className="text-sm text-yellow-700">100 ADA → ~181,318 SNEK</div>
                <div className="text-xs text-yellow-600">High price impact</div>
              </button>
            </div>
          </div>

          {/* AMM Explanation */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Automated Market Maker</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Uses constant product formula: x × y = k</li>
                  <li>Pool maintains 1,000 ADA and 2,000,000 SNEK</li>
                  <li>Prices adjust automatically based on supply/demand</li>
                  <li>Larger swaps have higher price impact</li>
                  <li>0.3% trading fee on each swap</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Swap Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Enter amount you want to swap</li>
                  <li>System calculates output using AMM formula</li>
                  <li>Shows exchange rate and price impact</li>
                  <li>Click "Swap Tokens" to execute</li>
                  <li>Transaction is simulated (demo mode)</li>
                </ol>
              </div>
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
                <div className="text-3xl font-bold text-orange-600">0.3%</div>
                <div className="text-gray-600">Trading Fee</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}