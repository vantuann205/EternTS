import React, { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { AmmService, PoolDatum } from '../services/ammService';
import { AMM_CONFIG, TOKENS } from '../constants';
import { ArrowUpDown, Plus, Minus } from 'lucide-react';

interface AmmCardProps {
  scriptCbor: string;
}

type TabType = 'swap' | 'liquidity' | 'remove';

export default function AmmCard({ scriptCbor }: AmmCardProps) {
  const { wallet, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('swap');
  const [poolState, setPoolState] = useState<PoolDatum | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  
  // Swap state
  const [swapFromAmount, setSwapFromAmount] = useState('');
  const [swapToAmount, setSwapToAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'ada-to-snek' | 'snek-to-ada'>('ada-to-snek');
  const [slippage, setSlippage] = useState(0.5);
  
  // Liquidity state
  const [adaAmount, setAdaAmount] = useState('');
  const [snekAmount, setSnekAmount] = useState('');
  const [lpTokensToRemove, setLpTokensToRemove] = useState('');

  const ammService = wallet ? new AmmService(wallet, scriptCbor) : null;

  // Load pool state
  useEffect(() => {
    if (ammService) {
      loadPoolState();
    }
  }, [ammService]);

  const loadPoolState = async () => {
    if (!ammService) return;
    
    try {
      const state = await ammService.getOrCreatePoolState();
      setPoolState(state?.datum || null);
    } catch (error) {
      console.error('Error loading pool state:', error);
    }
  };

  // Calculate swap output
  useEffect(() => {
    if (!poolState || !swapFromAmount || !ammService) return;

    const amountIn = parseFloat(swapFromAmount);
    if (isNaN(amountIn) || amountIn <= 0) return;

    let output: number;
    if (swapDirection === 'ada-to-snek') {
      const amountInLovelace = Math.floor(amountIn * 1_000_000);
      output = ammService.calculateSwapOutput(
        amountInLovelace,
        poolState.reserve_a,
        poolState.reserve_b
      );
      setSwapToAmount((output / 1).toFixed(0)); // SNEK has 0 decimals
    } else {
      const amountInSnek = Math.floor(amountIn);
      output = ammService.calculateSwapOutput(
        amountInSnek,
        poolState.reserve_b,
        poolState.reserve_a
      );
      setSwapToAmount((output / 1_000_000).toFixed(6)); // Convert to ADA
    }
  }, [swapFromAmount, swapDirection, poolState, ammService]);

  // Calculate liquidity amounts
  useEffect(() => {
    if (!poolState || !adaAmount) return;

    const ada = parseFloat(adaAmount);
    if (isNaN(ada) || ada <= 0) return;

    const ratio = poolState.reserve_b / poolState.reserve_a;
    const requiredSnek = Math.floor(ada * 1_000_000 * ratio);
    setSnekAmount(requiredSnek.toString());
  }, [adaAmount, poolState]);

  const handleSwap = async () => {
    if (!ammService || !swapFromAmount) return;

    setLoading(true);
    try {
      const amountIn = parseFloat(swapFromAmount);
      const minOut = parseFloat(swapToAmount) * (1 - slippage / 100);

      let txHash: string;
      if (swapDirection === 'ada-to-snek') {
        const amountInLovelace = Math.floor(amountIn * 1_000_000);
        const minOutSnek = Math.floor(minOut);
        txHash = await ammService.swapAdaForSnek(amountInLovelace, minOutSnek);
      } else {
        const amountInSnek = Math.floor(amountIn);
        const minOutLovelace = Math.floor(minOut * 1_000_000);
        txHash = await ammService.swapSnekForAda(amountInSnek, minOutLovelace);
      }

      setTxHash(txHash);
      setSwapFromAmount('');
      setSwapToAmount('');
      await loadPoolState();
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!ammService || !adaAmount || !snekAmount) return;

    setLoading(true);
    try {
      const ada = Math.floor(parseFloat(adaAmount) * 1_000_000);
      const snek = parseInt(snekAmount);

      let txHash: string;
      if (!poolState || poolState.total_lp === 0) {
        // Initialize pool
        txHash = await ammService.initializePool(ada, snek);
      } else {
        // Add liquidity
        txHash = await ammService.addLiquidity(ada, snek);
      }

      setTxHash(txHash);
      setAdaAmount('');
      setSnekAmount('');
      await loadPoolState();
    } catch (error) {
      console.error('Add liquidity failed:', error);
      alert('Add liquidity failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const switchSwapDirection = () => {
    setSwapDirection(prev => prev === 'ada-to-snek' ? 'snek-to-ada' : 'ada-to-snek');
    setSwapFromAmount(swapToAmount);
    setSwapToAmount(swapFromAmount);
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Connect Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to use the AMM</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">ADA/SNEK AMM</h2>
        {poolState && (
          <div className="text-sm text-gray-600">
            <div>ADA: {(poolState.reserve_a / 1_000_000).toFixed(2)}</div>
            <div>SNEK: {poolState.reserve_b.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'swap'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Swap
        </button>
        <button
          onClick={() => setActiveTab('liquidity')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'liquidity'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Liquidity
        </button>
      </div>

      {/* Swap Tab */}
      {activeTab === 'swap' && (
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-sm text-gray-600">
                {swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'}
              </span>
            </div>
            <input
              type="number"
              value={swapFromAmount}
              onChange={(e) => setSwapFromAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-semibold outline-none"
            />
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <button
              onClick={switchSwapDirection}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
            >
              <ArrowUpDown className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">To</span>
              <span className="text-sm text-gray-600">
                {swapDirection === 'ada-to-snek' ? 'SNEK' : 'ADA'}
              </span>
            </div>
            <input
              type="number"
              value={swapToAmount}
              readOnly
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-semibold outline-none"
            />
          </div>

          {/* Slippage */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Slippage Tolerance</span>
            <div className="flex space-x-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded text-sm ${
                    slippage === value
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={loading || !swapFromAmount || !poolState}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Swapping...' : 'Swap'}
          </button>
        </div>
      )}

      {/* Liquidity Tab */}
      {activeTab === 'liquidity' && (
        <div className="space-y-4">
          {/* ADA Input */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">ADA Amount</span>
            </div>
            <input
              type="number"
              value={adaAmount}
              onChange={(e) => setAdaAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-semibold outline-none"
            />
          </div>

          {/* SNEK Input */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">SNEK Amount</span>
            </div>
            <input
              type="number"
              value={snekAmount}
              onChange={(e) => setSnekAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-2xl font-semibold outline-none"
            />
          </div>

          {/* Add Liquidity Button */}
          <button
            onClick={handleAddLiquidity}
            disabled={loading || !adaAmount || !snekAmount}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Adding...' : (!poolState || poolState.total_lp === 0) ? 'Initialize Pool' : 'Add Liquidity'}
          </button>
        </div>
      )}

      {/* Transaction Hash */}
      {txHash && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            Transaction submitted: 
            <a 
              href={`https://cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              View on Explorer
            </a>
          </p>
        </div>
      )}
    </div>
  );
}