import { 
  Transaction, 
  BlockfrostProvider, 
  Data, 
  UTxO, 
  PlutusScript,
  BrowserWallet,
  Asset
} from '@meshsdk/core';
import { AMM_CONFIG } from '../constants';

// Pool Datum structure matching your Aiken contract
export interface PoolDatum {
  reserve_a: bigint;  // ADA reserve (lovelace)
  reserve_b: bigint;  // SNEK token reserve
  total_lp: bigint;   // Total LP tokens
  fee_bps: bigint;    // Fee in basis points
}

// Action types matching your Aiken contract
export type AmmAction = 
  | { InitPool: { initial_ada: bigint; initial_snek: bigint } }
  | { AddLiquidity: { amounts_a: bigint; amounts_b: bigint } }
  | { RemoveLiquidity: { lp_tokens: bigint } }
  | { SwapAForB: { amount_in: bigint; min_out: bigint } }
  | { SwapBForA: { amount_in: bigint; min_out: bigint } };

export class RealAmmContract {
  private wallet: BrowserWallet;
  private blockfrostProvider: BlockfrostProvider;
  private scriptCbor: string;
  private scriptAddress: string;

  constructor(wallet: BrowserWallet) {
    this.wallet = wallet;
    this.blockfrostProvider = new BlockfrostProvider(
      process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || ''
    );
    this.scriptCbor = process.env.NEXT_PUBLIC_AMM_SCRIPT_CBOR || '';
    this.scriptAddress = AMM_CONFIG.scriptAddress;
  }

  // Get real pool state from blockchain
  async getPoolState(): Promise<{ utxo: UTxO; datum: PoolDatum } | null> {
    try {
      console.log('Fetching pool state from:', this.scriptAddress);
      
      // Get UTxOs at script address
      const utxos = await this.blockfrostProvider.fetchAddressUTxOs(this.scriptAddress);
      
      if (!utxos || utxos.length === 0) {
        console.log('No UTxOs found at script address');
        return null;
      }

      // Find pool UTxO (should have both ADA and SNEK tokens)
      const poolUtxo = utxos.find(utxo => {
        const hasAda = utxo.output.amount.some(asset => asset.unit === 'lovelace');
        const hasSnek = utxo.output.amount.some(asset => 
          asset.unit === AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName
        );
        return hasAda && hasSnek && utxo.output.plutusData;
      });

      if (!poolUtxo || !poolUtxo.output.plutusData) {
        console.log('Pool UTxO not found');
        return null;
      }

      // Parse datum from UTxO
      const datum = this.parseDatum(poolUtxo.output.plutusData);
      console.log('Pool state loaded:', datum);
      
      return { utxo: poolUtxo, datum };
    } catch (error) {
      console.error('Error getting pool state:', error);
      return null;
    }
  }

  // Initialize pool with real liquidity
  async initializePool(initialAda: bigint, initialSnek: bigint): Promise<string> {
    console.log('Initializing pool with:', { initialAda, initialSnek });
    
    const tx = new Transaction({ initiator: this.wallet });
    
    // Calculate initial LP tokens
    const initialLp = this.sqrt(initialAda * initialSnek);
    
    // Create pool datum
    const poolDatum: PoolDatum = {
      reserve_a: initialAda,
      reserve_b: initialSnek,
      total_lp: initialLp,
      fee_bps: BigInt(AMM_CONFIG.feeBps),
    };

    // Create redeemer
    const redeemer: AmmAction = {
      InitPool: {
        initial_ada: initialAda,
        initial_snek: initialSnek,
      }
    };

    // Send ADA to script
    tx.sendLovelace(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(poolDatum),
        },
      },
      initialAda.toString()
    );

    // Send SNEK tokens to script
    tx.sendAssets(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(poolDatum),
        },
      },
      [
        {
          unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName,
          quantity: initialSnek.toString(),
        },
      ]
    );

    // Mint LP tokens for user
    const userAddress = await this.wallet.getChangeAddress();
    tx.mintAsset(
      {
        assetName: 'LP_ADA_SNEK',
        assetQuantity: initialLp.toString(),
        metadata: {
          name: 'ADA/SNEK LP Token',
          description: 'Liquidity Provider token for ADA/SNEK pool',
        },
      }
    );

    const unsignedTx = await tx.build();
    const signedTx = await this.wallet.signTx(unsignedTx);
    return await this.wallet.submitTx(signedTx);
  }

  // Real ADA to SNEK swap
  async swapAdaForSnek(amountAda: bigint, minSnekOut: bigint): Promise<string> {
    console.log('Swapping ADA for SNEK:', { amountAda, minSnekOut });
    
    const poolState = await this.getPoolState();
    if (!poolState) {
      throw new Error('Pool not found');
    }

    const { utxo, datum } = poolState;

    // Calculate output amount with fee
    const amountOut = this.calculateSwapOutput(
      amountAda,
      datum.reserve_a,
      datum.reserve_b,
      datum.fee_bps
    );

    if (amountOut < minSnekOut) {
      throw new Error(`Insufficient output amount. Expected: ${minSnekOut}, Got: ${amountOut}`);
    }

    // Create new pool state
    const newDatum: PoolDatum = {
      reserve_a: datum.reserve_a + amountAda,
      reserve_b: datum.reserve_b - amountOut,
      total_lp: datum.total_lp,
      fee_bps: datum.fee_bps,
    };

    const redeemer: AmmAction = {
      SwapAForB: {
        amount_in: amountAda,
        min_out: minSnekOut,
      }
    };

    const tx = new Transaction({ initiator: this.wallet });

    // Consume pool UTxO
    tx.redeemValue({
      value: utxo,
      script: {
        version: 'V2',
        code: this.scriptCbor,
      },
      datum: this.encodeDatum(datum),
      redeemer: this.encodeRedeemer(redeemer),
    });

    // Send updated pool back to script
    tx.sendLovelace(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      newDatum.reserve_a.toString()
    );

    tx.sendAssets(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      [
        {
          unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName,
          quantity: newDatum.reserve_b.toString(),
        },
      ]
    );

    // Send SNEK tokens to user
    const userAddress = await this.wallet.getChangeAddress();
    tx.sendAssets(
      userAddress,
      [
        {
          unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName,
          quantity: amountOut.toString(),
        },
      ]
    );

    const unsignedTx = await tx.build();
    const signedTx = await this.wallet.signTx(unsignedTx);
    return await this.wallet.submitTx(signedTx);
  }

  // Real SNEK to ADA swap
  async swapSnekForAda(amountSnek: bigint, minAdaOut: bigint): Promise<string> {
    console.log('Swapping SNEK for ADA:', { amountSnek, minAdaOut });
    
    const poolState = await this.getPoolState();
    if (!poolState) {
      throw new Error('Pool not found');
    }

    const { utxo, datum } = poolState;

    // Calculate output amount with fee
    const amountOut = this.calculateSwapOutput(
      amountSnek,
      datum.reserve_b,
      datum.reserve_a,
      datum.fee_bps
    );

    if (amountOut < minAdaOut) {
      throw new Error(`Insufficient output amount. Expected: ${minAdaOut}, Got: ${amountOut}`);
    }

    // Create new pool state
    const newDatum: PoolDatum = {
      reserve_a: datum.reserve_a - amountOut,
      reserve_b: datum.reserve_b + amountSnek,
      total_lp: datum.total_lp,
      fee_bps: datum.fee_bps,
    };

    const redeemer: AmmAction = {
      SwapBForA: {
        amount_in: amountSnek,
        min_out: minAdaOut,
      }
    };

    const tx = new Transaction({ initiator: this.wallet });

    // Consume pool UTxO
    tx.redeemValue({
      value: utxo,
      script: {
        version: 'V2',
        code: this.scriptCbor,
      },
      datum: this.encodeDatum(datum),
      redeemer: this.encodeRedeemer(redeemer),
    });

    // Send updated pool back to script
    tx.sendLovelace(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      newDatum.reserve_a.toString()
    );

    tx.sendAssets(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      [
        {
          unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName,
          quantity: newDatum.reserve_b.toString(),
        },
      ]
    );

    // Send ADA to user
    const userAddress = await this.wallet.getChangeAddress();
    tx.sendLovelace(userAddress, amountOut.toString());

    const unsignedTx = await tx.build();
    const signedTx = await this.wallet.signTx(unsignedTx);
    return await this.wallet.submitTx(signedTx);
  }

  // Add liquidity to pool
  async addLiquidity(amountAda: bigint, amountSnek: bigint): Promise<string> {
    console.log('Adding liquidity:', { amountAda, amountSnek });
    
    const poolState = await this.getPoolState();
    if (!poolState) {
      throw new Error('Pool not found');
    }

    const { utxo, datum } = poolState;

    // Calculate LP tokens to mint
    const lpTokensToMint = (amountAda * datum.total_lp) / datum.reserve_a;

    // Create new pool state
    const newDatum: PoolDatum = {
      reserve_a: datum.reserve_a + amountAda,
      reserve_b: datum.reserve_b + amountSnek,
      total_lp: datum.total_lp + lpTokensToMint,
      fee_bps: datum.fee_bps,
    };

    const redeemer: AmmAction = {
      AddLiquidity: {
        amounts_a: amountAda,
        amounts_b: amountSnek,
      }
    };

    const tx = new Transaction({ initiator: this.wallet });

    // Consume pool UTxO
    tx.redeemValue({
      value: utxo,
      script: {
        version: 'V2',
        code: this.scriptCbor,
      },
      datum: this.encodeDatum(datum),
      redeemer: this.encodeRedeemer(redeemer),
    });

    // Send updated pool back to script
    tx.sendLovelace(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      newDatum.reserve_a.toString()
    );

    tx.sendAssets(
      {
        address: this.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      [
        {
          unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName,
          quantity: newDatum.reserve_b.toString(),
        },
      ]
    );

    // Mint LP tokens for user
    const userAddress = await this.wallet.getChangeAddress();
    tx.mintAsset(
      {
        assetName: 'LP_ADA_SNEK',
        assetQuantity: lpTokensToMint.toString(),
      }
    );

    const unsignedTx = await tx.build();
    const signedTx = await this.wallet.signTx(unsignedTx);
    return await this.wallet.submitTx(signedTx);
  }

  // Calculate swap output using AMM formula
  calculateSwapOutput(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeBps: bigint
  ): bigint {
    if (amountIn <= 0n) return 0n;
    
    // Apply trading fee
    const amountInWithFee = (amountIn * (10000n - feeBps)) / 10000n;
    
    // Constant product formula: (x + Δx) * (y - Δy) = x * y
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    
    return numerator / denominator;
  }

  // Get wallet balance
  async getWalletBalance(): Promise<{ ada: bigint; snek: bigint }> {
    try {
      const utxos = await this.wallet.getUtxos();
      
      let adaBalance = 0n;
      let snekBalance = 0n;
      
      for (const utxo of utxos) {
        for (const asset of utxo.output.amount) {
          if (asset.unit === 'lovelace') {
            adaBalance += BigInt(asset.quantity);
          } else if (asset.unit === AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName) {
            snekBalance += BigInt(asset.quantity);
          }
        }
      }
      
      return { ada: adaBalance, snek: snekBalance };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return { ada: 0n, snek: 0n };
    }
  }

  // Helper methods
  private sqrt(n: bigint): bigint {
    if (n === 0n) return 0n;
    if (n < 4n) return 1n;
    
    let x = n;
    let y = (x + 1n) / 2n;
    
    while (y < x) {
      x = y;
      y = (x + n / x) / 2n;
    }
    
    return x;
  }

  private encodeDatum(datum: PoolDatum): string {
    return Data.to({
      reserve_a: datum.reserve_a,
      reserve_b: datum.reserve_b,
      total_lp: datum.total_lp,
      fee_bps: datum.fee_bps,
    });
  }

  private parseDatum(plutusData: string): PoolDatum {
    const decoded = Data.from(plutusData);
    return {
      reserve_a: BigInt(decoded.reserve_a),
      reserve_b: BigInt(decoded.reserve_b),
      total_lp: BigInt(decoded.total_lp),
      fee_bps: BigInt(decoded.fee_bps),
    };
  }

  private encodeRedeemer(redeemer: AmmAction): string {
    return Data.to(redeemer);
  }
}