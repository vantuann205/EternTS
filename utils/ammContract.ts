/**
 * ADA/SNEK AMM Contract Integration
 * Utilities for building transactions with the AMM validator
 */

import plutusBlueprint from '../plutus.json';

// Type definitions matching Aiken contract
export type PoolDatum = {
  reserve_a: bigint;
  reserve_b: bigint;
  total_lp: bigint;
  fee_bps: bigint;
};

export type PoolInit = {
  initial_ada: bigint;
  initial_snek: bigint;
};

export type SwapParams = {
  amount_in: bigint;
  min_out: bigint;
};

export type AmmAction =
  | { InitPool: PoolInit }
  | { AddLiquidity: { amounts_a: bigint; amounts_b: bigint } }
  | { RemoveLiquidity: { lp_tokens: bigint } }
  | { SwapAForB: SwapParams }
  | { SwapBForA: SwapParams };

/**
 * Get the AMM validator from the compiled contract
 */
export function getAmmValidator() {
  const validator = plutusBlueprint.validators.find(
    (v: any) => v.title === 'amm'
  );
  if (!validator) {
    throw new Error('AMM validator not found in plutus.json');
  }
  return validator;
}

/**
 * Calculate expected output for swap (simplified formula)
 * Real implementation should use decimal math
 */
export function calculateSwapOutput(
  reserve_a: bigint,
  reserve_b: bigint,
  amount_in: bigint,
  isAForB: boolean
): bigint {
  // Formula: (reserve * amount_in_with_fee) / (other_reserve + amount_in_with_fee)
  const fee_numerator = 997n;
  const fee_denominator = 1000n;

  const amount_in_with_fee = (amount_in * fee_numerator) / fee_denominator;

  if (isAForB) {
    // Swapping A for B
    return (reserve_b * amount_in_with_fee) / (reserve_a + amount_in_with_fee);
  } else {
    // Swapping B for A
    return (reserve_a * amount_in_with_fee) / (reserve_b + amount_in_with_fee);
  }
}

/**
 * Calculate LP tokens for initial pool creation
 */
export function calculateInitialLPTokens(
  initial_ada: bigint,
  initial_snek: bigint
): bigint {
  // LP tokens = sqrt(ada * snek)
  // Using Newton's method for integer square root
  return isqrt(initial_ada * initial_snek);
}

/**
 * Integer square root
 */
function isqrt(n: bigint): bigint {
  if (n === 0n) return 0n;
  if (n === 1n) return 1n;

  let x = n;
  let y = (x + 1n) / 2n;

  while (y < x) {
    x = y;
    y = (y + n / y) / 2n;
  }

  return x;
}

/**
 * Validate pool initialization parameters
 */
export function validatePoolInit(init: PoolInit): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (init.initial_ada < 1000n) {
    errors.push('Initial ADA must be >= 1000 lovelace');
  }

  if (init.initial_snek < 1000n) {
    errors.push('Initial SNEK must be >= 1000 tokens');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate swap parameters
 */
export function validateSwap(params: SwapParams): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (params.amount_in <= 0n) {
    errors.push('Amount in must be positive');
  }

  if (params.min_out <= 0n) {
    errors.push('Min out must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Build datum for pool state
 */
export function buildPoolDatum(
  reserve_a: bigint,
  reserve_b: bigint,
  total_lp: bigint,
  fee_bps: bigint = 30n // Default 0.3%
): PoolDatum {
  return {
    reserve_a,
    reserve_b,
    total_lp,
    fee_bps,
  };
}

/**
 * Format pool state for display
 */
export function formatPoolState(datum: PoolDatum): {
  ada: string;
  snek: string;
  lp: string;
  price: string;
} {
  const ada = (datum.reserve_a / 1_000_000n).toString() + ' ADA';
  const snek = (datum.reserve_b / 1_000_000n).toString() + ' SNEK';
  const lp = datum.total_lp.toString() + ' LP';
  const price =
    ((datum.reserve_b * 1_000_000n) / datum.reserve_a).toString() +
    ' SNEK/ADA';

  return { ada, snek, lp, price };
}

/**
 * Calculate price impact for swap
 */
export function calculatePriceImpact(
  reserve_a: bigint,
  reserve_b: bigint,
  amount_in: bigint,
  isAForB: boolean
): number {
  // Spot price before swap
  const spot_price = isAForB
    ? Number(reserve_b) / Number(reserve_a)
    : Number(reserve_a) / Number(reserve_b);

  // Execution price
  const amount_out = calculateSwapOutput(
    reserve_a,
    reserve_b,
    amount_in,
    isAForB
  );
  const execution_price =
    Number(amount_out) / Number(amount_in);

  // Price impact = (spot - execution) / spot
  return ((spot_price - execution_price) / spot_price) * 100;
}

export default {
  getAmmValidator,
  calculateSwapOutput,
  calculateInitialLPTokens,
  validatePoolInit,
  validateSwap,
  buildPoolDatum,
  formatPoolState,
  calculatePriceImpact,
};
