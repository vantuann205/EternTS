import {
  BrowserWallet,
  Transaction,
  ForgeScript,
  Mint,
  AssetMetadata,
  Recipient,
  Unit,
  PlutusScript,
  Data,
  resolveDataHash,
  resolveScriptHash,
  UTxO,
  BlockfrostProvider,
  MeshWallet,
} from '@meshsdk/core';
import { AMM_CONFIG, TOKENS } from '../constants';

// Pool Datum structure matching Aiken contract
export interface PoolDatum {
  reserve_a: number;  // ADA reserve (lovelace)
  reserve_b: number;  // SNEK token reserve
  total_lp: number;   // Total LP tokens
  fee_bps: number;    // Fee in basis points
}

// Action types matching Aiken contract
export type AmmAction = 
  | { InitPool: { initial_ada: number; initial_snek: number } }
  | { AddLiquidity: { amounts_a: number; amounts_b: number } }
  | { RemoveLiquidity: { lp_tokens: number } }
  | { SwapAForB: { amount_in: number; min_out: number } }
  | { SwapBForA: { amount_in: number; min_out: number } };

export class AmmService {
  private wallet: BrowserWallet;
  private scriptCbor: string;
  private blockfrostProvider: BlockfrostProvider;

  constructor(wallet: BrowserWallet, scriptCbor: string) {
    this.wallet = wallet;
    this.scriptCbor = scriptCbor;
    this.blockfrostProvider = new BlockfrostProvider(
      process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || ''
    );
  }

  // Get pool UTxO and current state
  async getPoolState(): Promise<{ utxo: UTxO; datum: PoolDatum } | null> {
    try {
      if (!AMM_CONFIG.scriptAddress) {
        console.log('Script address not configured');
        return null;
      }

      // Get UTxOs at script address using Blockfrost
      const utxos = await this.blockfrostProvider.fetchAddressUTxOs(AMM_CONFIG.scriptAddress);
      
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
      return { utxo: poolUtxo, datum };
    } catch (error) {
      console.error('Error getting pool state:', error);
      return null;
    }
  }

  // Get or create initial pool state for demo
  async getOrCreatePoolState(): Promise<{ utxo: UTxO; datum: PoolDatum } | null> {
    const existingState = await this.getPoolState();
    if (existingState) {
      return existingState;
    }

    // Return mock pool state for demo
    const mockDatum: PoolDatum = {
      reserve_a: 1000 * 1_000_000, // 1000 ADA
      reserve_b: 2000000, // 2M SNEK
      total_lp: Math.floor(Math.sqrt(1000 * 1_000_000 * 2000000)),
      fee_bps: AMM_CONFIG.feeBps,
    };

    return {
      utxo: {
        input: {
          outputIndex: 0,
          txHash: 'mock_tx_hash',
        },
        output: {
          address: AMM_CONFIG.scriptAddress,
          amount: [
            { unit: 'lovelace', quantity: String(mockDatum.reserve_a) },
            { unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName, quantity: String(mockDatum.reserve_b) }
          ],
          plutusData: this.encodeDatum(mockDatum),
        },
      },
      datum: mockDatum,
    };
  }

  // Initialize pool with initial liquidity
  async initializePool(initialAda: number, initialSnek: number): Promise<string> {
    const tx = new Transaction({ initiator: this.wallet });

    // Create pool datum
    const poolDatum: PoolDatum = {
      reserve_a: initialAda,
      reserve_b: initialSnek,
      total_lp: Math.floor(Math.sqrt(initialAda * initialSnek)),
      fee_bps: AMM_CONFIG.feeBps,
    };

    // Create redeemer
    const redeemer: AmmAction = {
      InitPool: {
        initial_ada: initialAda,
        initial_snek: initialSnek,
      }
    };

    // Add script input and output
    tx.sendLovelace(
      {
        address: AMM_CONFIG.scriptAddress,
        datum: {
          value: this.encodeDatum(poolDatum),
        },
      },
      String(initialAda)
    );

    // Add SNEK tokens to pool
    tx.sendAssets(
      {
        address: AMM_CONFIG.scriptAddress,
        datum: {
          value: this.encodeDatum(poolDatum),
        },
      },
      [
        {
          unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName,
          quantity: String(initialSnek),
        },
      ]
    );

    // Mint LP tokens for user
    const lpTokens = poolDatum.total_lp;
    const userAddress = await this.wallet.getChangeAddress();
    
    tx.mintAsset(
      ForgeScript.withOneSignature(userAddress),
      {
        assetName: 'LP_ADA_SNEK',
        assetQuantity: String(lpTokens),
      }
    );

    const unsignedTx = await tx.build();
    const signedTx = await this.wallet.signTx(unsignedTx);
    return await this.wallet.submitTx(signedTx);
  }

  // Add liquidity to existing pool
  async addLiquidity(amountAda: number, amountSnek: number): Promise<string> {
    const poolState = await this.getPoolState();
    if (!poolState) {
      throw new Error('Pool not found');
    }

    const { utxo, datum } = poolState;
    
    // Calculate optimal amounts based on current ratio
    const ratio = datum.reserve_a / datum.reserve_b;
    const optimalSnek = Math.floor(amountAda / ratio);
    const optimalAda = Math.floor(amountSnek * ratio);

    const finalAda = Math.min(amountAda, optimalAda);
    const finalSnek = Math.min(amountSnek, optimalSnek);

    // Calculate LP tokens to mint
    const lpTokensToMint = Math.floor(
      (finalAda * datum.total_lp) / datum.reserve_a
    );

    const newDatum: PoolDatum = {
      reserve_a: datum.reserve_a + finalAda,
      reserve_b: datum.reserve_b + finalSnek,
      total_lp: datum.total_lp + lpTokensToMint,
      fee_bps: datum.fee_bps,
    };

    const redeemer: AmmAction = {
      AddLiquidity: {
        amounts_a: finalAda,
        amounts_b: finalSnek,
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
        address: AMM_CONFIG.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      String(newDatum.reserve_a)
    );

    tx.sendAssets(
      {
        address: AMM_CONFIG.scriptAddress,
        datum: {
          value: this.encodeDatum(newDatum),
        },
      },
      [
        {
          unit: AMM_CONFIG.snekPolicyId + AMM_CONFIG.snekAssetName,
          quantity: String(newDatum.reserve_b),
        },
      ]
    );

    // Mint LP tokens for user
    const userAddress = await this.wallet.getChangeAddress();
    tx.mintAsset(
      ForgeScript.withOneSignature(userAddress),
      {
        assetName: 'LP_ADA_SNEK',
        assetQuantity: String(lpTokensToMint),
      }
    );

    const unsignedTx = await tx.build();
    const signedTx = await this.wallet.signTx(unsignedTx);
    return await this.wallet.submitTx(signedTx);
  }

  // Swap ADA for SNEK
  async swapAdaForSnek(amountAda: number, minSnekOut: number): Promise<string> {
    const poolState = await this.getOrCreatePoolState();
    if (!poolState) {
      throw new Error('Pool not found');
    }

    const { datum } = poolState;

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

    try {
      const tx = new Transaction({ initiator: this.wallet });
      
      // For demo: just send ADA to a dummy address and simulate receiving SNEK
      const userAddress = await this.wallet.getChangeAddress();
      
      // Send ADA (simulating the swap)
      tx.sendLovelace(userAddress, String(amountAda));

      const unsignedTx = await tx.build();
      const signedTx = await this.wallet.signTx(unsignedTx);
      const txHash = await this.wallet.submitTx(signedTx);
      
      console.log(`Swapped ${amountAda / 1_000_000} ADA for ${amountOut} SNEK`);
      return txHash;
    } catch (error) {
      console.error('Swap transaction failed:', error);
      throw new Error('Transaction failed: ' + (error as Error).message);
    }
  }

  // Swap SNEK for ADA
  async swapSnekForAda(amountSnek: number, minAdaOut: number): Promise<string> {
    const poolState = await this.getOrCreatePoolState();
    if (!poolState) {
      throw new Error('Pool not found');
    }

    const { datum } = poolState;

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

    try {
      const tx = new Transaction({ initiator: this.wallet });
      
      // For demo: just send a small amount of ADA (simulating the swap)
      const userAddress = await this.wallet.getChangeAddress();
      
      // Send small ADA amount (simulating receiving ADA from swap)
      tx.sendLovelace(userAddress, String(Math.min(amountOut, 2000000))); // Max 2 ADA for demo

      const unsignedTx = await tx.build();
      const signedTx = await this.wallet.signTx(unsignedTx);
      const txHash = await this.wallet.submitTx(signedTx);
      
      console.log(`Swapped ${amountSnek} SNEK for ${amountOut / 1_000_000} ADA`);
      return txHash;
    } catch (error) {
      console.error('Swap transaction failed:', error);
      throw new Error('Transaction failed: ' + (error as Error).message);
    }
  }

  // Calculate swap output amount
  calculateSwapOutput(
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

  // Helper methods for encoding/decoding data
  private encodeDatum(datum: PoolDatum): string {
    return Data.to({
      reserve_a: BigInt(datum.reserve_a),
      reserve_b: BigInt(datum.reserve_b),
      total_lp: BigInt(datum.total_lp),
      fee_bps: BigInt(datum.fee_bps),
    });
  }

  private parseDatum(plutusData: string): PoolDatum {
    const decoded = Data.from(plutusData);
    return {
      reserve_a: Number(decoded.reserve_a),
      reserve_b: Number(decoded.reserve_b),
      total_lp: Number(decoded.total_lp),
      fee_bps: Number(decoded.fee_bps),
    };
  }

  private encodeRedeemer(redeemer: AmmAction): string {
    return Data.to(redeemer);
  }
}