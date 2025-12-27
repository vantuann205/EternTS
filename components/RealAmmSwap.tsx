import React, { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { ArrowUpDown, Wallet, ExternalLink, AlertTriangle, DollarSign } from 'lucide-react';
import { RealAmmContract, PoolDatum } from '../services/realAmmContract';
import { AMM_CONFIG } from '../constants';

export default function RealAmmSwap() {
  const { wallet, connected, connecting, connect, disconnect } = useWallet();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapDirection, setSwapDirection] = useState<'ada-to-snek' | 'snek-to-ada'>('ada-to-snek');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState<{ ada: string; snek: string }>({ ada: '0', snek: '0' });
  const [poolState, setPoolState] = useState<PoolDatum | null>(null);
  const [ammContract, setAmmContract] = useState<RealAmmContract | null>(null);
  const [slippage, setSlippage] = useState(0.5);

  // Initialize AMM contract when wallet connects
  useEffect(() => {
    if (wallet && connected) {
      const contract = new RealAmmContract(wallet);
      setAmmContract(contract);
      loadWalletInfo(contract);
      loadPoolState(contract);
    } else {
      setAmmContract(null);
    }
  }, [wallet, connected]);

  // Load wallet information
  const loadWalletInfo = async (contract: RealAmmContract) => {
    try {
      const address = await wallet!.getChangeAddress();
      setWalletAddress(address);
      
      const balance = await contract.getWalletBalance();
      setWalletBalance({
        ada: (Number(balance.ada) / 1_000_000).toFixed(2),
        snek: balance.snek.toString(),
      });
    } catch (error) {
      console.error('Error loading wallet info:', error);
    }
  };

  // Load pool state from blockchain
  const loadPoolState = async (contract: RealAmmContract) => {
    try {
      const state = await contract.getPoolState();
      if (state) {
        setPoolState(state.datum);
        console.log('Pool loaded:', state.datum);
      } else {
        console.log('No pool found on blockchain');
      }
    } catch (error) {
      console.error('Error loading pool state:', error);
    }
  };

  // Calculate swap output
  useEffect(() => {
    if (!fromAmount || !ammContract || !poolState) {
      setToAmount('');
      return;
    }

    const amountIn = parseFloat(fromAmount);
    if (isNaN(amountIn) || amountIn <= 0) {
      setToAmount('');
      return;
    }

    try {
      let output: bigint;
      if (swapDirection === 'ada-to-snek') {
        const amountInLovelace = BigInt(Math.floor(amountIn * 1_000_000));
        output = ammContract.calculateSwapOutput(
          amountInLovelace,
          poolState.reserve_a,
          poolState.reserve_b,
          poolState.fee_bps
        );
        setToAmount(output.toString());
      } else {
        const amountInSnek = BigInt(Math.floor(amountIn));
        output = ammContract.calculateSwapOutput(
          amountInSnek,
          poolState.reserve_b,
          poolState.reserve_a,
          poolState.fee_bps
        );
        setToAmount((Number(output) / 1_000_000).toFixed(6));
      }
    } catch (error) {
      console.error('Error calculating output:', error);
      setToAmount('');
    }
  }, [fromAmount, swapDirection, poolState, ammContract]);

  // Handle real swap
  const handleSwap = async () => {
    if (!ammContract || !wallet || !connected || !fromAmount || !poolState) return;

    setLoading(true);
    try {
      const amountIn = parseFloat(fromAmount);
      const expectedOut = parseFloat(toAmount);
      const minOut = expectedOut * (1 - slippage / 100);

      let txHash: string;
      
      if (swapDirection === 'ada-to-snek') {
        const amountInLovelace = BigInt(Math.floor(amountIn * 1_000_000));
        const minOutSnek = BigInt(Math.floor(minOut));
        
        console.log('Executing ADA to SNEK swap:', {
          amountIn: amountInLovelace.toString(),
          minOut: minOutSnek.toString()
        });
        
        txHash = await ammContract.swapAdaForSnek(amountInLovelace, minOutSnek);
      } else {
        const amountInSnek = BigInt(Math.floor(amountIn));
        const minOutLovelace = BigInt(Math.floor(minOut * 1_000_000));
        
        console.log('Executing SNEK to ADA swap:', {
          amountIn: amountInSnek.toString(),
          minOut: minOutLovelace.toString()
        });
        
        txHash = await ammContract.swapSnekForAda(amountInSnek, minOutLovelace);
      }

      setTxHash(txHash);
      console.log(`✅ Real swap transaction submitted: ${txHash}`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      
      // Refresh data after transaction
      setTimeout(() => {
        if (ammContract) {
          loadWalletInfo(ammContract);
          loadPoolState(ammContract);
        }
      }, 10000); // Wait 10 seconds for blockchain confirmation
      
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize pool (if no pool exists)
  const handleInitializePool = async () => {
    if (!ammContract || !wallet) return;

    const initialAda = prompt('Enter initial ADA amount (minimum 100):');
    const initialSnek = prompt('Enter initial SNEK amount (minimum 100000):');
    
    if (!initialAda || !initialSnek) return;
    
    const adaAmount = parseFloat(initialAda);
    const snekAmount = parseFloat(initialSnek);
    
    if (adaAmount < 100 || snekAmount < 100000) {
      alert('Minimum: 100 ADA and 100,000 SNEK');
      return;
    }

    setLoading(true);
    try {
      const adaLovelace = BigInt(Math.floor(adaAmount * 1_000_000));
      const snekTokens = BigInt(Math.floor(snekAmount));
      
      console.log('Initializing pool with:', {
        ada: adaLovelace.toString(),
        snek: snekTokens.toString()
      });
      
      const txHash = await ammContract.initializePool(adaLovelace, snekTokens);
      setTxHash(txHash);
      
      console.log(`✅ Pool initialized: ${txHash}`);
      
      // Refresh data
      setTimeout(() => {
        if (ammContract) {
          loadWalletInfo(ammContract);
          loadPoolState(ammContract);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Pool initialization failed:', error);
      alert('Pool initialization failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const switchDirection = () => {
    setSwapDirection(prev => prev === 'ada-to-snek' ? 'snek-to-ada' : 'ada-to-snek');
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Calculate price impact
  const calculatePriceImpact = () => {
    if (!fromAmount || !toAmount || !poolState) return 0;
    
    const amountIn = parseFloat(fromAmount);
    const amountOut = parseFloat(toAmount);
    
    if (amountIn <= 0 || amountOut <= 0) return 0;
    
    let currentRate: number;
    let newRate: number;
    
    if (swapDirection === 'ada-to-snek') {
      currentRate = Number(poolState.reserve_b) / (Number(poolState.reserve_a) / 1_000_000);
      newRate = amountOut / amountIn;
    } else {
      currentRate = (Number(poolState.reserve_a) / 1_000_000) / Number(poolState.reserve_b);
      newRate = amountOut / amountIn;
    }
    
    return Math.abs((currentRate - newRate) / currentRate * 100);
  };

  const priceImpact = calculatePriceImpact();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Real AMM Swap</h2>
        <div className="text-right text-sm">
          <div className="flex items-center text-green-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="font-medium">REAL MONEY</span>
          </div>
          <div className="text-gray-600">Testnet</div>
        </div>
      </div>

      {!connected ? (
        <div className="text-center">
          <div className="mb-6">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Real Wallet</h3>
            <p className="text-gray-600 mb-4">
              Connect your Cardano wallet with real ADA and SNEK tokens
            </p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => connect('nami')}
              disabled={connecting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {connecting ? 'Connecting...' : 'Connect Nami Wallet'}
            </button>
            
            <button
              onClick={() => connect('eternl')}
              disabled={connecting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {connecting ? 'Connecting...' : 'Connect Eternl Wallet'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Wallet Info */}
          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-green-800 font-medium">Real Wallet Connected</div>
                <div className="text-xs text-green-600 font-mono">
                  {walletAddress.slice(0, 20)}...{walletAddress.slice(-10)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-800 font-medium">{walletBalance.ada} ADA</div>
                <div className="text-xs text-green-600">{walletBalance.snek} SNEK</div>
                <button
                  onClick={disconnect}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Pool Status */}
          {poolState ? (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Pool Status: Active</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>ADA: {(Number(poolState.reserve_a) / 1_000_000).toFixed(2)}</div>
                  <div>SNEK: {poolState.reserve_b.toString()}</div>
                  <div>LP Tokens: {poolState.total_lp.toString()}</div>
                  <div>Fee: {Number(poolState.fee_bps) / 100}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-2">No Pool Found</div>
                <button
                  onClick={handleInitializePool}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs"
                >
                  Initialize Pool
                </button>
              </div>
            </div>
          )}

          {/* Real Money Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2" />
              <div className="text-sm text-red-800">
                <strong>Real Money Transaction:</strong> This will use real ADA and SNEK from your wallet. 
                Transaction fees and slippage apply.
              </div>
            </div>
          </div>

          {poolState && (
            <>
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
                  className="w-full bg-transparent text-2xl font-semibold outline-none text-gray-900"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Balance: {swapDirection === 'ada-to-snek' ? walletBalance.ada + ' ADA' : walletBalance.snek + ' SNEK'}
                </div>
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

              {/* Swap Details */}
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
                      <span className="font-medium">{Number(poolState.fee_bps) / 100}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slippage Tolerance:</span>
                      <span className="font-medium">{slippage}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Slippage Settings */}
              <div className="flex justify-between items-center mb-4">
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
                disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Real Transaction...
                  </div>
                ) : (
                  'Swap Real Tokens'
                )}
              </button>
            </>
          )}

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
                  <h3 className="text-sm font-medium text-green-800">Real Transaction Submitted!</h3>
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