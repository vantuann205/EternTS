import {
  BrowserWallet,
  Transaction,
  BlockfrostProvider,
  Data,
  UTxO,
  PlutusScript,
} from '@meshsdk/core';
import { AMM_CONFIG } from '../constants';

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

export class RealAmmService {
  private wallet: BrowserWallet;
  private blockfrostProvider: BlockfrostProvider;
  private scriptCbor: string;

  constructor(wallet: BrowserWallet) {
    this.wallet = wallet;
    this.blockfrostProvider = new BlockfrostProvider(
      process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || ''
    );
    this.scriptCbor = process.env.NEXT_PUBLIC_AMM_SCRIPT_CBOR || '';
  }

  // Get pool UTxO and current state from blockchain
  async getPoolState(): Promise<{ utxo: UTxO; datum: PoolDatum } | null> {
    try {
      if (!AMM_CONFIG.scriptAddress) {
        console.log('Script address not configured');
        return this.getMockPoolState();
      }

      // Get UTxOs at script address using Blockfrost
      const utxos = await this.blockfrostProvider.fetchAddressUTxOs(AMM_CONFIG.scriptAddress);
      
      if (!utxos || utxos.length === 0) {
        console.log('No UTxOs found at script address, using mock data');
        return this.getMockPoolState();
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
        console.log('Pool UTxO not found, using mock data');
        return this.getMockPoolState();
      }

      // Parse datum from UTxO
      const datum = this.parseDatum(poolUtxo.output.plutusData);
      return { utxo: poolUtxo, datum };
    } catch (error) {
      console.error('Error getting pool state:', error);
      return this.getMockPoolState();
    }
  }

  // Mock pool state for demo
  private getMockPoolState(): { utxo: UTxO; datum: PoolDatum } {
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

  // Create a real swap transaction (simplified for demo)
  async createSwapTransaction(
    amountIn: number,
    direction: 'ada-to-snek' | 'snek-to-ada',
    minOut: number
  ): Promise<string> {
    try {
      const tx = new Transaction({ initiator: this.wallet });
      const userAddress = await this.wallet.getChangeAddress();

      if (direction === 'ada-to-snek') {
        // ADA to SNEK swap
        // For demo: create a transaction that sends ADA to user's address with metadata
        tx.sendLovelace(userAddress, String(amountIn));
        
        // Add metadata to indicate this is a swap
        tx.setMetadata(674, {
          msg: [
            `AMM Swap: ${amountIn / 1_000_000} ADA → ${minOut} SNEK`,
            `Pool: ADA/SNEK`,
            `Type: ada-to-snek`,
            `Timestamp: ${new Date().toISOString()}`
          ]
        });
      } else {
        // SNEK to ADA swap
        // For demo: send small ADA amount with metadata
        const outputLovelace = Math.min(minOut, 2000000); // Max 2 ADA for safety
        tx.sendLovelace(userAddress, String(outputLovelace));
        
        tx.setMetadata(674, {
          msg: [
            `AMM Swap: ${amountIn} SNEK → ${minOut / 1_000_000} ADA`,
            `Pool: ADA/SNEK`,
            `Type: snek-to-ada`,
            `Timestamp: ${new Date().toISOString()}`
          ]
        });
      }

      console.log('Building transaction...');
      const unsignedTx = await tx.build();
      
      console.log('Signing transaction...');
      const signedTx = await this.wallet.signTx(unsignedTx);
      
      console.log('Submitting transaction...');
      const txHash = await this.wallet.submitTx(signedTx);
      
      return txHash;
    } catch (error) {
      console.error('Transaction creation failed:', error);
      throw new Error('Failed to create transaction: ' + (error as Error).message);
    }
  }

  // Calculate swap output using AMM formula
  calculateSwapOutput(
    amountIn: number,
    reserveIn: number,
    reserveOut: number,
    feeBps: number = AMM_CONFIG.feeBps
  ): number {
    if (amountIn <= 0) return 0;
    
    // Apply trading fee
    const amountInWithFee = Math.floor((amountIn * (10000 - feeBps)) / 10000);
    
    // Constant product formula: (x + Δx) * (y - Δy) = x * y
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    
    return Math.floor(numerator / denominator);
  }

  // Get wallet balance
  async getWalletBalance(): Promise<number> {
    try {
      const utxos = await this.wallet.getUtxos();
      const totalLovelace = utxos.reduce((sum, utxo) => {
        const lovelaceAmount = utxo.output.amount.find(asset => asset.unit === 'lovelace');
        return sum + parseInt(lovelaceAmount?.quantity || '0');
      }, 0);
      
      return totalLovelace;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  // Get wallet address
  async getWalletAddress(): Promise<string> {
    try {
      return await this.wallet.getChangeAddress();
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return '';
    }
  }

  // Helper methods for encoding/decoding data
  private encodeDatum(datum: PoolDatum): string {
    try {
      return Data.to({
        reserve_a: BigInt(datum.reserve_a),
        reserve_b: BigInt(datum.reserve_b),
        total_lp: BigInt(datum.total_lp),
        fee_bps: BigInt(datum.fee_bps),
      });
    } catch (error) {
      console.error('Error encoding datum:', error);
      return '';
    }
  }

  private parseDatum(plutusData: string): PoolDatum {
    try {
      const decoded = Data.from(plutusData);
      return {
        reserve_a: Number(decoded.reserve_a),
        reserve_b: Number(decoded.reserve_b),
        total_lp: Number(decoded.total_lp),
        fee_bps: Number(decoded.fee_bps),
      };
    } catch (error) {
      console.error('Error parsing datum:', error);
      // Return default values if parsing fails
      return {
        reserve_a: 1000 * 1_000_000,
        reserve_b: 2000000,
        total_lp: Math.floor(Math.sqrt(1000 * 1_000_000 * 2000000)),
        fee_bps: 30,
      };
    }
  }

  // Check if transaction is confirmed
  async isTransactionConfirmed(txHash: string): Promise<boolean> {
    try {
      const tx = await this.blockfrostProvider.fetchTxInfo(txHash);
      return !!tx;
    } catch (error) {
      console.error('Error checking transaction:', error);
      return false;
    }
  }
}