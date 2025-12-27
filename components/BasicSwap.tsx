import React, { useState, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';

// Simple wallet connection check
declare global {
  interface Window {
    cardano?: {
      nami?: any;
      eternl?: any;
      flint?: any;
    };
  }
}

export default function BasicSwap() {
  const [wallet, setWallet] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'ada-to-snek' | 'snek-to-ada'>('ada-to-snek');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [walletInfo, setWalletInfo] = useState<string>('');
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

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

  // Check available wallets on component mount
  useEffect(() => {
    const checkWallets = () => {
      const available: string[] = [];
      if (typeof window !== 'undefined' && window.cardano) {
        if (window.cardano.nami) available.push('Nami');
        if (window.cardano.eternl) available.push('Eternl');
        if (window.cardano.flint) available.push('Flint');
      }
      setAvailableWallets(available);
      console.log('Available wallets:', available);
    };

    // Check immediately and after a delay (wallets might load later)
    checkWallets();
    const timer = setTimeout(checkWallets, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setWalletInfo('Connecting...');
      
      if (typeof window === 'undefined') {
        setWalletInfo('Window not available');
        return;
      }

      if (!window.cardano) {
        setWalletInfo('No Cardano object found. Please install a Cardano wallet.');
        return;
      }

      let walletApi = null;
      let walletName = '';
      
      // Try Nami first
      if (window.cardano.nami && window.cardano.nami.isEnabled) {
        try {
          walletApi = await window.cardano.nami.enable();
          walletName = 'Nami';
        } catch (e) {
          console.log('Nami connection failed:', e);
        }
      }
      
      // Try Eternl if Nami failed
      if (!walletApi && window.cardano.eternl) {
        try {
          walletApi = await window.cardano.eternl.enable();
          walletName = 'Eternl';
        } catch (e) {
          console.log('Eternl connection failed:', e);
        }
      }
      
      // Try Flint if others failed
      if (!walletApi && window.cardano.flint) {
        try {
          walletApi = await window.cardano.flint.enable();
          walletName = 'Flint';
        } catch (e) {
          console.log('Flint connection failed:', e);
        }
      }

      if (walletApi) {
        setWallet(walletApi);
        setConnected(true);
        setWalletInfo(`Connected to ${walletName}`);
        console.log(`Wallet connected successfully: ${walletName}`);
      } else {
        setWalletInfo('No wallet could be connected. Available: ' + availableWallets.join(', '));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWalletInfo('Connection failed: ' + (error as Error).message);
    }
  };

  // Simulate swap
  const handleSwap = async () => {
    if (!connected || !fromAmount) return;

    setLoading(true);
    try {
      // Simulate transaction creation and signing
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      const mockTxHash = 'demo_tx_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
      setTxHash(mockTxHash);
      
      console.log(`Simulated swap: ${fromAmount} ${swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'} → ${toAmount} ${swapDirection === 'ada-to-snek' ? 'SNEK' : 'ADA'}`);
      
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

      {!connected ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Connect Wallet</h3>
          <p className="text-gray-600 mb-4">Connect your Cardano wallet to start swapping</p>
          
          {/* Available Wallets Info */}
          {availableWallets.length > 0 ? (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Available wallets: {availableWallets.join(', ')}
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                No Cardano wallets detected. Please install Nami, Eternl, or Flint.
              </p>
            </div>
          )}

          {/* Wallet Info */}
          {walletInfo && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{walletInfo}</p>
            </div>
          )}
          
          <button
            onClick={connectWallet}
            disabled={availableWallets.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {availableWallets.length > 0 ? 'Connect Wallet' : 'No Wallets Available'}
          </button>

          {/* Manual Test Button */}
          <button
            onClick={() => {
              setConnected(true);
              setWalletInfo('Demo mode - wallet simulation');
            }}
            className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-xl transition-colors"
          >
            Demo Mode (Skip Wallet)
          </button>
        </div>
      ) : (
        <>
          {/* Wallet Status */}
          {walletInfo && (
            <div className="mb-4 p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">{walletInfo}</p>
            </div>
          )}

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
            {loading ? 'Swapping...' : 'Swap (Demo)'}
          </button>

          {/* Transaction Hash */}
          {txHash && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Demo swap completed!
                <br />
                <span className="font-mono text-xs break-all">{txHash}</span>
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
        </>
      )}
    </div>
  );
}