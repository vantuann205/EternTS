// Test AMM calculations without importing services
interface PoolDatum {
  reserve_a: number;
  reserve_b: number;
  total_lp: number;
  fee_bps: number;
}

const AMM_CONFIG = {
  feeBps: 30,
};

// Calculate swap output function
function calculateSwapOutput(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeBps: number = AMM_CONFIG.feeBps
): number {
  const amountInWithFee = Math.floor((amountIn * (10000 - feeBps)) / 10000);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn + amountInWithFee;
  return Math.floor(numerator / denominator);
}

// Test AMM calculations
function testAmmCalculations() {
  console.log('Testing AMM calculations...\n');



  // Test swap calculations
  const reserveA = 1000 * 1_000_000; // 1000 ADA in lovelace
  const reserveB = 2000000; // 2M SNEK tokens
  const feeBps = 30; // 0.3%

  console.log('Pool State:');
  console.log(`- ADA Reserve: ${reserveA / 1_000_000} ADA`);
  console.log(`- SNEK Reserve: ${reserveB.toLocaleString()} SNEK`);
  console.log(`- Fee: ${feeBps / 100}%\n`);

  // Test ADA to SNEK swap
  const adaInput = 10 * 1_000_000; // 10 ADA
  const snekOutput = calculateSwapOutput(adaInput, reserveA, reserveB, feeBps);
  
  console.log('ADA to SNEK Swap:');
  console.log(`- Input: ${adaInput / 1_000_000} ADA`);
  console.log(`- Output: ${snekOutput.toLocaleString()} SNEK`);
  console.log(`- Rate: ${(snekOutput / (adaInput / 1_000_000)).toFixed(0)} SNEK per ADA\n`);

  // Test SNEK to ADA swap
  const snekInput = 10000; // 10k SNEK
  const adaOutput = calculateSwapOutput(snekInput, reserveB, reserveA, feeBps);
  
  console.log('SNEK to ADA Swap:');
  console.log(`- Input: ${snekInput.toLocaleString()} SNEK`);
  console.log(`- Output: ${(adaOutput / 1_000_000).toFixed(6)} ADA`);
  console.log(`- Rate: ${(snekInput / (adaOutput / 1_000_000)).toFixed(0)} SNEK per ADA\n`);

  // Test price impact
  const largeAdaInput = 100 * 1_000_000; // 100 ADA
  const largeSnekOutput = calculateSwapOutput(largeAdaInput, reserveA, reserveB, feeBps);
  const largeSwapRate = largeSnekOutput / (largeAdaInput / 1_000_000);
  const normalSwapRate = snekOutput / (adaInput / 1_000_000);
  const priceImpact = ((normalSwapRate - largeSwapRate) / normalSwapRate) * 100;

  console.log('Price Impact Analysis:');
  console.log(`- Small swap (10 ADA): ${normalSwapRate.toFixed(0)} SNEK per ADA`);
  console.log(`- Large swap (100 ADA): ${largeSwapRate.toFixed(0)} SNEK per ADA`);
  console.log(`- Price impact: ${priceImpact.toFixed(2)}%\n`);

  // Test liquidity calculations
  const lpTokens = Math.floor(Math.sqrt(reserveA * reserveB));
  console.log('Liquidity Pool:');
  console.log(`- Total LP tokens: ${lpTokens.toLocaleString()}`);
  console.log(`- LP token value: ${((reserveA / 1_000_000) / lpTokens * 2).toFixed(6)} ADA equivalent per LP token\n`);
}

// Test constant product invariant
function testConstantProduct() {
  console.log('Testing Constant Product Invariant...\n');

  const initialA = 1000 * 1_000_000;
  const initialB = 2000000;
  const k = initialA * initialB;

  console.log(`Initial k = ${initialA / 1_000_000} * ${initialB.toLocaleString()} = ${(k / 1_000_000).toLocaleString()}`);

  // Simulate swap
  const swapAmount = 10 * 1_000_000;
  const fee = Math.floor(swapAmount * 0.003); // 0.3% fee
  const swapAmountAfterFee = swapAmount - fee;

  const newA = initialA + swapAmount;
  const newB = Math.floor(k / newA);
  const outputB = initialB - newB;

  console.log(`\nAfter swapping ${swapAmount / 1_000_000} ADA:`);
  console.log(`- New ADA reserve: ${newA / 1_000_000} ADA`);
  console.log(`- New SNEK reserve: ${newB.toLocaleString()} SNEK`);
  console.log(`- SNEK output: ${outputB.toLocaleString()} SNEK`);
  console.log(`- New k = ${(newA * newB / 1_000_000).toLocaleString()}`);
  console.log(`- K maintained: ${newA * newB >= k ? 'Yes' : 'No'}\n`);
}

// Run tests
console.log('='.repeat(50));
console.log('AMM Service Test Suite');
console.log('='.repeat(50));
console.log();

testAmmCalculations();
testConstantProduct();

console.log('='.repeat(50));
console.log('Tests completed!');
console.log('='.repeat(50));