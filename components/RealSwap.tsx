import React, { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { ArrowUpDown, Wallet, ExternalLink } from 'lucide-react';
import { RealAmmService } from '../services/realAmmService';

export default function RealSwap() {
  const { wallet, connected, connecting, connect, disconnect } = useWallet();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'ada-to-snek' | 'snek-to-ada'>('ada-to-snek');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState<string>('');
  const [ammService, setAmmService] = useState<RealAmmService | null>(null);
  const [poolState, setPoolState] = useState({
    reserve_a: 1000 * 1_000_000, // 1000 ADA
    reserve_b: 2000000, // 2M SNEK
    fee_bps: 30,
  });

  // Initialize AMM service and get wallet info when connected
  useEffect(() => {
    const initializeService = async () => {
      if (wallet && connected) {
        try {
          const service = new RealAmmService(wallet);
          setAmmService(service);
          
          const address = await service.getWalletAddress();
          setWalletAddress(address);
          
          const balance = await service.getWalletBalance();
          setWalletBalance((balance / 1_000_000).toFixed(2));
          
          // Get pool state
          const poolData = await service.getPoolState();
          if (poolData) {
            setPoolState(poolData.datum);
          }
        } catch (error) {
          console.error('Error initializing service:', error);
        }
      } else {
        setAmmService(null);
      }
    };

    initializeService();
  }, [wallet, connected]);

  // Calculate swap output using AMM service
  const calculateOutput = (amountIn: number, reserveIn: number, reserveOut: number) => {
    if (!ammService) return 0;
    return ammService.calculateSwapOutput(amountIn, reserveIn, reserveOut, poolState.fee_bps);
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

  // Handle real swap transaction
  const handleSwap = async () => {
    if (!ammService || !wallet || !connected || !fromAmount) return;

    setLoading(true);
    try {
      const amountIn = parseFloat(fromAmount);
      const minOut = parseFloat(toAmount);
      
      let amountInLovelace: number;
      let minOutAmount: number;
      
      if (swapDirection === 'ada-to-snek') {
        amountInLovelace = Math.floor(amountIn * 1_000_000);
        minOutAmount = Math.floor(minOut);
      } else {
        amountInLovelace = Math.floor(amountIn);
        minOutAmount = Math.floor(minOut * 1_000_000);
      }

      const hash = await ammService.createSwapTransaction(
        amountInLovelace,
        swapDirection,
        minOutAmount
      );

      setTxHash(hash);
      console.log(`✅ Real transaction submitted: ${hash}`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      
      // Refresh wallet balance after a delay
      setTimeout(async () => {
        if (ammService) {
          const balance = await ammService.getWalletBalance();
          setWalletBalance((balance / 1_000_000).toFixed(2));
        }
      }, 5000);
      
    } catch (error) {
      console.error('Swap transaction failed:', error);
      alert('Transaction failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const switchDirection = () => {
    setSwapDirection(prev => prev === 'ada-to-snek' ? 'snek-to-ada' : 'ada-to-snek');
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Real ADA/SNEK Swap</h2>
        <div className="text-right text-sm text-gray-600">
          <div>Testnet</div>
          <div className="text-green-600">● Live</div>
        </div>
      </div>

      {!connected ? (
        <div className="text-center">
          <div className="mb-6">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-4">
              Connect your Cardano wallet to start making real swaps on testnet
            </p>
          </div>
          
          <button
            onClick={() => connect('nami')}
            disabled={connecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors mb-2"
          >
            {connecting ? 'Connecting...' : 'Connect Nami Wallet'}
          </button>
          
          <button
            onClick={() => connect('eternl')}
            disabled={connecting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors mb-2"
          >
            {connecting ? 'Connecting...' : 'Connect Eternl Wallet'}
          </button>
          
          <button
            onClick={() => connect('flint')}
            disabled={connecting}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect Flint Wallet'}
          </button>
        </div>
      ) : (
        <>
          {/* Wallet Info */}
          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-green-800 font-medium">Wallet Connected</div>
                <div className="text-xs text-green-600 font-mono">
                  {walletAddress.slice(0, 20)}...{walletAddress.slice(-10)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-800 font-medium">{walletBalance} ADA</div>
                <button
                  onClick={disconnect}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Disconnect
                </button>
              </div>
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
              max={swapDirection === 'ada-to-snek' ? parseFloat(walletBalance) : undefined}
              className="w-full bg-transparent text-2xl font-semibold outline-none text-gray-900"
            />
            {swapDirection === 'ada-to-snek' && (
              <div className="text-xs text-gray-500 mt-1">
                Balance: {walletBalance} ADA
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={switchDirection}
              className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
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

          {/* Exchange Rate */}
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
                  <span>Network Fee:</span>
                  <span className="font-medium">~0.17 ADA</span>
                </div>
                <div className="flex justify-between">
                  <span>Trading Fee:</span>
                  <span className="font-medium">{poolState.fee_bps / 100}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-yellow-800">
              <strong>⚠️ Real Transaction:</strong> This will create and submit a real transaction on Cardano testnet. 
              Make sure you have testnet ADA for fees.
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > parseFloat(walletBalance)}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Transaction...
              </div>
            ) : (
              'Create Real Transaction'
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
                  <h3 className="text-sm font-medium text-green-800">Transaction Submitted!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    <span className="font-mono break-all">{txHash}</span>
                  </p>
                  <a
                    href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-green-600 hover:text-green-800 mt-2"
                  >
                    View on Explorer <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}