import React, { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { Transaction } from '@meshsdk/core';
import { ArrowUpDown } from 'lucide-react';

export default function SimpleSwap() {
  const { wallet, connected } = useWallet();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'ada-to-snek' | 'snek-to-ada'>('ada-to-snek');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  // Mock pool state
  const poolState = {
    reserve_a: 1000 * 1_000_000, // 1000 ADA
    reserve_b: 2000000, // 2M SNEK
    fee_bps: 30,
  };

  // Calculate swap output
  const calculateOutput = (amountIn: number, reserveIn: number, reserveOut: number) => {
    if (amountIn <= 0) return 0;
    const amountInWithFee = Math.floor((amountIn * (10000 - poolState.fee_bps)) / 10000);
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    return Math.floor(numerator / denominator);
  };

  // Update output amount when input changes
  useEffect(() => {
    if (!fromAmount) {
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
      const amountInLovelace = Math.floor(amountIn * 1_000_000);
      output = calculateOutput(amountInLovelace, poolState.reserve_a, poolState.reserve_b);
      setToAmount(output.toString());
    } else {
      const amountInSnek = Math.floor(amountIn);
      output = calculateOutput(amountInSnek, poolState.reserve_b, poolState.reserve_a);
      setToAmount((output / 1_000_000).toFixed(6));
    }
  }, [fromAmount, swapDirection]);

  const handleSwap = async () => {
    if (!wallet || !connected || !fromAmount) return;

    setLoading(true);
    try {
      const tx = new Transaction({ initiator: wallet });
      const userAddress = await wallet.getChangeAddress();

      if (swapDirection === 'ada-to-snek') {
        // Swap ADA for SNEK - just send a small transaction as demo
        const amountInLovelace = Math.floor(parseFloat(fromAmount) * 1_000_000);
        tx.sendLovelace(userAddress, String(Math.min(amountInLovelace, 2000000))); // Max 2 ADA
      } else {
        // Swap SNEK for ADA - send small ADA amount
        tx.sendLovelace(userAddress, '1000000'); // 1 ADA
      }

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const hash = await wallet.submitTx(signedTx);

      setTxHash(hash);
      console.log(`Swap completed! TX: ${hash}`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const switchDirection = () => {
    setSwapDirection(prev => prev === 'ada-to-snek' ? 'snek-to-ada' : 'ada-to-snek');
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Connect Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to swap</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">ADA/SNEK Swap</h2>
        <div className="text-sm text-gray-600">
          <div>Pool: {(poolState.reserve_a / 1_000_000).toFixed(0)} ADA</div>
          <div>{poolState.reserve_b.toLocaleString()} SNEK</div>
        </div>
      </div>

      {/* From Token */}
      <div className="bg-gray-50 rounded-xl p-4 mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">From</span>
          <span className="text-sm font-medium">
            {swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'}
          </span>
        </div>
        <input
          type="number"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-transparent text-2xl font-semibold outline-none"
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-4">
        <button
          onClick={switchDirection}
          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
        >
          <ArrowUpDown className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">To</span>
          <span className="text-sm font-medium">
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

      {/* Exchange Rate */}
      {fromAmount && toAmount && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="text-sm text-blue-800">
            <div>Exchange Rate:</div>
            <div className="font-medium">
              1 {swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'} = {' '}
              {swapDirection === 'ada-to-snek' 
                ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(0)
                : (parseFloat(fromAmount) / parseFloat(toAmount)).toFixed(6)
              } {swapDirection === 'ada-to-snek' ? 'SNEK' : 'ADA'}
            </div>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !fromAmount}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Swapping...' : 'Swap'}
      </button>

      {/* Transaction Hash */}
      {txHash && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            Transaction submitted!
            <br />
            <a 
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all"
            >
              {txHash}
            </a>
          </p>
        </div>
      )}

      {/* Pool Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Pool Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">ADA Reserve</div>
            <div className="font-medium">{(poolState.reserve_a / 1_000_000).toLocaleString()} ADA</div>
          </div>
          <div>
            <div className="text-gray-600">SNEK Reserve</div>
            <div className="font-medium">{poolState.reserve_b.toLocaleString()} SNEK</div>
          </div>
          <div>
            <div className="text-gray-600">Trading Fee</div>
            <div className="font-medium">{poolState.fee_bps / 100}%</div>
          </div>
          <div>
            <div className="text-gray-600">Rate</div>
            <div className="font-medium">
              {(poolState.reserve_b / (poolState.reserve_a / 1_000_000)).toFixed(0)} SNEK/ADA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}