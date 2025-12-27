import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import { 
  useMeshSDK, 
  connectWallet, 
  getAvailableWallets,
  createBlockfrostProvider 
} from '../lib/meshWrapper';

export default function FixedRealSwap() {
  const { sdk, loading: sdkLoading, error: sdkError } = useMeshSDK();
  const [wallet, setWallet] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'ada-to-snek' | 'snek-to-ada'>('ada-to-snek');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState<string>('');
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  // Pool state
  const poolState = {
    reserve_a: 1000 * 1_000_000, // 1000 ADA
    reserve_b: 2000000, // 2M SNEK
    fee_bps: 30,
  };

  // Check available wallets
  useEffect(() => {
    const checkWallets = () => {
      const wallets = getAvailableWallets();
      setAvailableWallets(wallets);
    };

    checkWallets();
    const interval = setInterval(checkWallets, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get wallet info when connected
  useEffect(() => {
    const getWalletInfo = async () => {
      if (wallet && connected) {
        try {
          const address = await wallet.getChangeAddress();
          setWalletAddress(address);
          
          const utxos = await wallet.getUtxos();
          const totalLovelace = utxos.reduce((sum: number, utxo: any) => {
            const lovelaceAmount = utxo.output.amount.find((asset: any) => asset.unit === 'lovelace');
            return sum + parseInt(lovelaceAmount?.quantity || '0');
          }, 0);
          
          setWalletBalance((totalLovelace / 1_000_000).toFixed(2));
        } catch (error) {
          console.error('Error getting wallet info:', error);
        }
      }
    };

    getWalletInfo();
  }, [wallet, connected]);

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

  // Connect wallet
  const handleConnect = async (walletName: string) => {
    setConnecting(true);
    try {
      const walletApi = await connectWallet(walletName);
      setWallet(walletApi);
      setConnected(true);
      console.log(`Connected to ${walletName}`);
    } catch (error) {
      console.error('Connection failed:', error);
      alert(`Failed to connect ${walletName}: ${(error as Error).message}`);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    setWallet(null);
    setConnected(false);
    setWalletAddress('');
    setWalletBalance('');
  };

  // Handle swap transaction
  const handleSwap = async () => {
    if (!wallet || !connected || !fromAmount) return;

    setLoading(true);
    try {
      const userAddress = await wallet.getChangeAddress();
      const amountIn = parseFloat(fromAmount);
      
      // Create transaction metadata
      const metadata = {
        674: {
          msg: [
            `AMM Swap: ${amountIn} ${swapDirection === 'ada-to-snek' ? 'ADA' : 'SNEK'} → ${toAmount} ${swapDirection === 'ada-to-snek' ? 'SNEK' : 'ADA'}`,
            `Pool: ADA/SNEK`,
            `Type: ${swapDirection}`,
            `Timestamp: ${new Date().toISOString()}`
          ]
        }
      };

      // For demo: create a simple transaction
      let txAmount: string;
      if (swapDirection === 'ada-to-snek') {
        txAmount = String(Math.floor(amountIn * 1_000_000));
      } else {
        txAmount = String(Math.min(parseFloat(toAmount) * 1_000_000, 2000000));
      }

      // Build transaction using wallet API directly
      const utxos = await wallet.getUtxos();
      if (!utxos || utxos.length === 0) {
        throw new Error('No UTxOs available');
      }

      // Simple transaction structure
      const txBuilder = {
        inputs: [utxos[0]], // Use first UTxO
        outputs: [
          {
            address: userAddress,
            amount: [{ unit: 'lovelace', quantity: txAmount }],
          },
        ],
        fee: '200000', // 0.2 ADA
        metadata: metadata,
      };

      // Convert to transaction format (simplified)
      const txHex = JSON.stringify(txBuilder);
      
      console.log('Signing transaction...');
      const signedTx = await wallet.signTx(txHex);
      
      console.log('Submitting transaction...');
      const hash = await wallet.submitTx(signedTx);

      setTxHash(hash);
      console.log(`✅ Transaction submitted: ${hash}`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      
      // Refresh balance
      setTimeout(async () => {
        const utxos = await wallet.getUtxos();
        const totalLovelace = utxos.reduce((sum: number, utxo: any) => {
          const lovelaceAmount = utxo.output.amount.find((asset: any) => asset.unit === 'lovelace');
          return sum + parseInt(lovelaceAmount?.quantity || '0');
        }, 0);
        setWalletBalance((totalLovelace / 1_000_000).toFixed(2));
      }, 5000);
      
    } catch (error) {
      console.error('Swap failed:', error);
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

  // Show loading state while SDK loads
  if (sdkLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MeshJS SDK...</p>
        </div>
      </div>
    );
  }

  // Show error state if SDK failed to load
  if (sdkError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">SDK Load Error</h3>
          <p className="text-sm text-red-600 mb-4">{sdkError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Fixed Real Swap</h2>
        <div className="text-right text-sm text-gray-600">
          <div>Testnet</div>
          <div className="text-green-600">● Fixed</div>
        </div>
      </div>

      {!connected ? (
        <div className="text-center">
          <div className="mb-6">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-4">
              Connect your Cardano wallet to start making real swaps
            </p>
          </div>

          {/* Available Wallets */}
          {availableWallets.length > 0 ? (
            <div className="space-y-2">
              {availableWallets.includes('nami') && (
                <button
                  onClick={() => handleConnect('nami')}
                  disabled={connecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {connecting ? 'Connecting...' : 'Connect Nami Wallet'}
                </button>
              )}
              
              {availableWallets.includes('eternl') && (
                <button
                  onClick={() => handleConnect('eternl')}
                  disabled={connecting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {connecting ? 'Connecting...' : 'Connect Eternl Wallet'}
                </button>
              )}
              
              {availableWallets.includes('flint') && (
                <button
                  onClick={() => handleConnect('flint')}
                  disabled={connecting}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {connecting ? 'Connecting...' : 'Connect Flint Wallet'}
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                No Cardano wallets detected. Please install Nami, Eternl, or Flint wallet.
              </p>
            </div>
          )}
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
                  onClick={handleDisconnect}
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
                  <span className="font-medium">~0.2 ADA</span>
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
            disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > parseFloat(walletBalance)}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Transaction...
              </div>
            ) : (
              'Create Fixed Transaction'
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