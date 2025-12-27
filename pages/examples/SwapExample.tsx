// Example usage of AMM Contract in a React component
// File: etern_ts/pages/Swap.tsx

import { useState } from 'react';
import ammUtils from '@/utils/ammContract';
import type { PoolDatum, AmmAction } from '@/utils/ammContract';

export default function SwapPage() {
  // Pool state (in real app, fetch from blockchain)
  const [poolState, setPoolState] = useState<PoolDatum>({
    reserve_a: 10_000_000n,    // 10 ADA
    reserve_b: 5_000_000n,     // 5M SNEK
    total_lp: 7_071_067n,      // LP tokens
    fee_bps: 30n,              // 0.3% fee
  });

  const [swapMode, setSwapMode] = useState<'AToB' | 'BToA'>('AToB');
  const [inputAmount, setInputAmount] = useState('0');
  const [slippageTolerance, setSlippageTolerance] = useState(0.5); // 0.5%

  // Calculate swap output and impact
  const calculateOutput = () => {
    if (!inputAmount || inputAmount === '0') return null;

    const amount_in = BigInt(inputAmount) * 1_000_000n;
    const isAForB = swapMode === 'AToB';

    const expectedOutput = ammUtils.calculateSwapOutput(
      poolState.reserve_a,
      poolState.reserve_b,
      amount_in,
      isAForB
    );

    const priceImpact = ammUtils.calculatePriceImpact(
      poolState.reserve_a,
      poolState.reserve_b,
      amount_in,
      isAForB
    );

    // Calculate min output with slippage
    const slippageBps = BigInt(Math.floor(slippageTolerance * 100));
    const min_out = (expectedOutput * (10000n - slippageBps)) / 10000n;

    return {
      expectedOutput,
      priceImpact,
      min_out,
      receiveToken: isAForB ? 'SNEK' : 'ADA',
    };
  };

  const swapOutput = calculateOutput();

  const handleSwap = async () => {
    if (!swapOutput) return;

    const amount_in = BigInt(inputAmount) * 1_000_000n;

    // Create swap action
    const swapAction: AmmAction = swapMode === 'AToB'
      ? {
          SwapAForB: {
            amount_in,
            min_out: swapOutput.min_out,
          },
        }
      : {
          SwapBForA: {
            amount_in,
            min_out: swapOutput.min_out,
          },
        };

    console.log('Swap action:', swapAction);

    // TODO: Build transaction with Lucid
    // const tx = await buildSwapTransaction(swapAction, poolState);
    // const signed = await wallet.signTx(tx);
    // const txHash = await lucid.submitTx(signed);
  };

  return (
    <div className="swap-container">
      <h1>ADA/SNEK Swap</h1>

      {/* Swap Mode Toggle */}
      <div className="swap-mode">
        <button
          className={swapMode === 'AToB' ? 'active' : ''}
          onClick={() => setSwapMode('AToB')}
        >
          ADA → SNEK
        </button>
        <button
          className={swapMode === 'BToA' ? 'active' : ''}
          onClick={() => setSwapMode('BToA')}
        >
          SNEK → ADA
        </button>
      </div>

      {/* Input */}
      <div className="input-section">
        <label>
          {swapMode === 'AToB' ? 'ADA to send' : 'SNEK to send'}
        </label>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="0.0"
          min="0"
          step="0.000001"
        />
      </div>

      {/* Output */}
      {swapOutput && (
        <div className="output-section">
          <label>
            {swapOutput.receiveToken} to receive
          </label>
          <div className="amount">
            {(swapOutput.expectedOutput / 1_000_000n).toFixed(2)}
            {swapOutput.receiveToken}
          </div>
          <div className="details">
            <div>
              Price Impact:{' '}
              <span className={swapOutput.priceImpact > 5 ? 'warning' : ''}>
                {swapOutput.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div>
              Minimum received (w/ {slippageTolerance}% slippage):{' '}
              <span>
                {(swapOutput.min_out / 1_000_000n).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slippage Settings */}
      <div className="slippage-settings">
        <label>Slippage Tolerance</label>
        <input
          type="number"
          value={slippageTolerance}
          onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
          min="0"
          max="10"
          step="0.1"
          placeholder="0.5%"
        />
        <span>%</span>
      </div>

      {/* Pool Info */}
      <div className="pool-info">
        <h3>Pool Information</h3>
        <div className="pool-state">
          <div>
            ADA Reserve: {(poolState.reserve_a / 1_000_000n).toFixed(2)}
          </div>
          <div>
            SNEK Reserve: {(poolState.reserve_b / 1_000_000n).toFixed(2)}
          </div>
          <div>
            Price: {((poolState.reserve_b * 1_000_000n) / poolState.reserve_a).toFixed(2)} SNEK/ADA
          </div>
          <div>Fee: {Number(poolState.fee_bps) / 100}%</div>
        </div>
      </div>

      {/* Swap Button */}
      <button
        className="swap-button"
        onClick={handleSwap}
        disabled={!inputAmount || inputAmount === '0'}
      >
        {swapMode === 'AToB' ? 'Swap ADA for SNEK' : 'Swap SNEK for ADA'}
      </button>
    </div>
  );
}

// CSS example
const styles = `
.swap-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.swap-mode {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.swap-mode button {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.swap-mode button.active {
  border-color: #0066cc;
  background: #0066cc;
  color: white;
}

.input-section,
.output-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.input-section input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
}

.output-section .amount {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.output-section .details {
  font-size: 12px;
  color: #666;
}

.output-section .details .warning {
  color: #ff9800;
  font-weight: bold;
}

.slippage-settings {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.slippage-settings input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pool-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 12px;
}

.pool-state div {
  padding: 5px 0;
}

.swap-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.swap-button:hover:not(:disabled) {
  background: #0052a3;
}

.swap-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
`;
