import React, { useState, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function TestSwap() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'ada-to-snek' | 'snek-to-ada'>('ada-to-snek');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  // Mock pool state
  const poolState = {
    reserve_a: 1000 * 1_000_000, // 1000 ADA in lovelace
    reserve_b: 2000000, // 2M SNEK
    fee_bps: 30, // 0.3%
  };

  // Calculate swap output using AMM formula
  const calculateOutput = (amountIn: number, reserveIn: number, reserveOut: number) => {
    if (amountIn <= 0) return 0;
    
    // Apply trading fee (0.3%)
    const amountInWithFee = Math.floor((amountIn * (10000 - poolState.fee_bps)) / 10000);
    
    // Constant product formula: (x + Δx) * (y - Δy) = x * y
    // Δy = (Δx * y) / (x + Δx)
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    
    return Math.floor(numerator / denominator);
  };

  // Update output amount when input changes
  useEffect(() => {
    if (!fromAmount || fromAmount === '0') {
      setToAmount('');
      return;
    }

    const amountIn = parseFloat(fromAmount);
    if (isNaN(amountIn) || amountIn <= 0) {
      setToAmount('');
      return;
    }

    let output: number;
    if (swapDirection === 'ada-to-snek') {
      // Convert ADA to lovelace
      const amountInLovelace = Math.floor(amountIn * 1_000_000);
      output = calculateOutput(amountInLovelace, poolState.reserve_a, poolState.reserve_b);
      setToAmount(output.toString());
    } else {
      // SNEK to ADA
      const amountInSnek = Math.floor(amountIn);
      output = calculateOutput(amountInSnek, poolState.reserve_b, poolState.reserve_a);
      setToAmount((output / 1_000_000).toFixed(6));
    }
  }, [fromAmount, swapDirection]);

  // Handle swap
  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction hash
      const mockTxHash = 'tx_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      setTxHash(mockTxHash);
      
      console.log(`✅ Swap completed: ${fromAmount} ${swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'} → ${toAmount} ${swapDirection === 'ada-to-snek' ? 'SNEK' : 'ADA'}`);
      
      // Reset form after successful swap
      setTimeout(() => {
        setFromAmount('');
        setToAmount('');
        setTxHash('');
      }, 5000);
      
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Switch swap direction
  const switchDirection = () => {
    const newDirection = swapDirection === 'ada-to-snek' ? 'snek-to-ada' : 'ada-to-snek';
    setSwapDirection(newDirection);
    
    // Swap the amounts
    const tempFrom = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempFrom);
  };

  // Calculate price impact
  const calculatePriceImpact = () => {
    if (!fromAmount || !toAmount) return 0;
    
    const amountIn = parseFloat(fromAmount);
    const amountOut = parseFloat(toAmount);
    
    if (amountIn <= 0 || amountOut <= 0) return 0;
    
    let currentRate: number;
    let newRate: number;
    
    if (swapDirection === 'ada-to-snek') {
      currentRate = poolState.reserve_b / (poolState.reserve_a / 1_000_000);
      newRate = amountOut / amountIn;
    } else {
      currentRate = (poolState.reserve_a / 1_000_000) / poolState.reserve_b;
      newRate = amountOut / amountIn;
    }
    
    return Math.abs((currentRate - newRate) / currentRate * 100);
  };

  const priceImpact = calculatePriceImpact();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">ADA/SNEK Swap</h2>
        <div className="text-right text-sm text-gray-600">
          <div>Pool: {(poolState.reserve_a / 1_000_000).toLocaleString()} ADA</div>
          <div>{poolState.reserve_b.toLocaleString()} SNEK</div>
        </div>
      </div>

      {/* From Token */}
      <div className="bg-gray-50 rounded-xl p-4 mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">From</span>
          <span className="text-sm font-medium text-gray-900">
            {swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'}
          </span>
        </div>
        <input
          type="number"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          placeholder="0.0"
          step="any"
          min="0"
          className="w-full bg-transparent text-2xl font-semibold outline-none text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Swap Direction Button */}
      <div className="flex justify-center my-4">
        <button
          onClick={switchDirection}
          className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
          title="Switch tokens"
        >
          <ArrowUpDown className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">To</span>
          <span className="text-sm font-medium text-gray-900">
            {swapDirection === 'ada-to-snek' ? 'SNEK' : 'ADA'}
          </span>
        </div>
        <input
          type="text"
          value={toAmount}
          readOnly
          placeholder="0.0"
          className="w-full bg-transparent text-2xl font-semibold outline-none text-gray-700"
        />
      </div>

      {/* Exchange Rate & Price Impact */}
      {fromAmount && toAmount && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="text-sm text-blue-800 space-y-1">
            <div className="flex justify-between">
              <span>Exchange Rate:</span>
              <span className="font-medium">
                1 {swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'} = {' '}
                {swapDirection === 'ada-to-snek' 
                  ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(0)
                  : (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)
                } {swapDirection === 'ada-to-snek' ? 'SNEK' : 'ADA'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact:</span>
              <span className={`font-medium ${priceImpact > 5 ? 'text-red-600' : priceImpact > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Trading Fee:</span>
              <span className="font-medium">{poolState.fee_bps / 100}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          'Swap Tokens'
        )}
      </button>

      {/* Transaction Result */}
      {txHash && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Swap Completed!</h3>
              <p className="text-sm text-green-700 mt-1">
                Transaction Hash: <span className="font-mono break-all">{txHash}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pool Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Pool Statistics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">ADA Reserve</div>
            <div className="font-medium text-gray-900">
              {(poolState.reserve_a / 1_000_000).toLocaleString()} ADA
            </div>
          </div>
          <div>
            <div className="text-gray-600">SNEK Reserve</div>
            <div className="font-medium text-gray-900">
              {poolState.reserve_b.toLocaleString()} SNEK
            </div>
          </div>
          <div>
            <div className="text-gray-600">Current Rate</div>
            <div className="font-medium text-gray-900">
              {(poolState.reserve_b / (poolState.reserve_a / 1_000_000)).toFixed(0)} SNEK/ADA
            </div>
          </div>
          <div>
            <div className="text-gray-600">Total Liquidity</div>
            <div className="font-medium text-gray-900">
              {Math.sqrt(poolState.reserve_a * poolState.reserve_b / 1_000_000).toFixed(0)}K
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}