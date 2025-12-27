import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@meshsdk/react';
import { AmmService, PoolDatum } from '../services/ammService';

export interface UseAmmReturn {
  poolState: PoolDatum | null;
  loading: boolean;
  error: string | null;
  ammService: AmmService | null;
  refreshPool: () => Promise<void>;
  calculateSwapOutput: (
    amountIn: number,
    direction: 'ada-to-snek' | 'snek-to-ada'
  ) => number;
  getPoolRatio: () => number | null;
  getPoolLiquidity: () => { ada: number; snek: number } | null;
}

export function useAmm(scriptCbor: string): UseAmmReturn {
  const { wallet, connected } = useWallet();
  const [poolState, setPoolState] = useState<PoolDatum | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ammService, setAmmService] = useState<AmmService | null>(null);

  // Initialize AMM service when wallet connects
  useEffect(() => {
    if (wallet && connected && scriptCbor) {
      setAmmService(new AmmService(wallet, scriptCbor));
    } else {
      setAmmService(null);
    }
  }, [wallet, connected, scriptCbor]);

  // Load pool state
  const refreshPool = useCallback(async () => {
    if (!ammService) {
      setPoolState(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const state = await ammService.getOrCreatePoolState();
      setPoolState(state?.datum || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pool state';
      setError(errorMessage);
      console.error('Error loading pool state:', err);
    } finally {
      setLoading(false);
    }
  }, [ammService]);

  // Load pool state when service is available
  useEffect(() => {
    refreshPool();
  }, [refreshPool]);

  // Calculate swap output
  const calculateSwapOutput = useCallback((
    amountIn: number,
    direction: 'ada-to-snek' | 'snek-to-ada'
  ): number => {
    if (!ammService || !poolState || amountIn <= 0) return 0;

    try {
      if (direction === 'ada-to-snek') {
        const amountInLovelace = Math.floor(amountIn * 1_000_000);
        return ammService.calculateSwapOutput(
          amountInLovelace,
          poolState.reserve_a,
          poolState.reserve_b
        );
      } else {
        const amountInSnek = Math.floor(amountIn);
        return ammService.calculateSwapOutput(
          amountInSnek,
          poolState.reserve_b,
          poolState.reserve_a
        );
      }
    } catch (err) {
      console.error('Error calculating swap output:', err);
      return 0;
    }
  }, [ammService, poolState]);

  // Get current pool ratio (SNEK per ADA)
  const getPoolRatio = useCallback((): number | null => {
    if (!poolState || poolState.reserve_a === 0) return null;
    return poolState.reserve_b / (poolState.reserve_a / 1_000_000);
  }, [poolState]);

  // Get pool liquidity
  const getPoolLiquidity = useCallback((): { ada: number; snek: number } | null => {
    if (!poolState) return null;
    return {
      ada: poolState.reserve_a / 1_000_000,
      snek: poolState.reserve_b,
    };
  }, [poolState]);

  return {
    poolState,
    loading,
    error,
    ammService,
    refreshPool,
    calculateSwapOutput,
    getPoolRatio,
    getPoolLiquidity,
  };
}