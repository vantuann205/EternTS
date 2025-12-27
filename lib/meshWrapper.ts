// MeshJS Wrapper to handle module conflicts and errors
import { useEffect, useState } from 'react';

// Dynamic imports to avoid SSR issues
let MeshSDK: any = null;
let meshLoaded = false;
let meshError: string | null = null;

// Load MeshJS dynamically
export const loadMeshSDK = async () => {
  if (meshLoaded) return MeshSDK;
  if (typeof window === 'undefined') return null;

  try {
    console.log('Loading MeshJS...');
    
    // Import MeshJS components dynamically
    const [coreModule, reactModule] = await Promise.all([
      import('@meshsdk/core'),
      import('@meshsdk/react'),
    ]);

    MeshSDK = {
      ...coreModule,
      ...reactModule,
    };

    meshLoaded = true;
    console.log('MeshJS loaded successfully');
    return MeshSDK;
  } catch (error) {
    console.error('Failed to load MeshJS:', error);
    meshError = (error as Error).message;
    return null;
  }
};

// Hook to use MeshJS with error handling
export const useMeshSDK = () => {
  const [sdk, setSdk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const meshSDK = await loadMeshSDK();
        setSdk(meshSDK);
        setError(meshError);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    initSDK();
  }, []);

  return { sdk, loading, error };
};

// Wallet connection utilities
export const connectWallet = async (walletName: string) => {
  if (typeof window === 'undefined') {
    throw new Error('Window not available');
  }

  const cardano = (window as any).cardano;
  if (!cardano) {
    throw new Error('No Cardano wallets found');
  }

  let walletApi = null;
  
  try {
    switch (walletName.toLowerCase()) {
      case 'nami':
        if (cardano.nami) {
          walletApi = await cardano.nami.enable();
        }
        break;
      case 'eternl':
        if (cardano.eternl) {
          walletApi = await cardano.eternl.enable();
        }
        break;
      case 'flint':
        if (cardano.flint) {
          walletApi = await cardano.flint.enable();
        }
        break;
      default:
        throw new Error(`Unsupported wallet: ${walletName}`);
    }

    if (!walletApi) {
      throw new Error(`${walletName} wallet not found or not enabled`);
    }

    return walletApi;
  } catch (error) {
    console.error(`Failed to connect ${walletName}:`, error);
    throw error;
  }
};

// Get available wallets
export const getAvailableWallets = () => {
  if (typeof window === 'undefined') return [];

  const cardano = (window as any).cardano;
  if (!cardano) return [];

  const wallets = [];
  if (cardano.nami) wallets.push('nami');
  if (cardano.eternl) wallets.push('eternl');
  if (cardano.flint) wallets.push('flint');

  return wallets;
};

// Transaction utilities without MeshJS dependencies
export const createSimpleTransaction = async (wallet: any, recipient: string, amount: string) => {
  try {
    // Get wallet UTxOs
    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();

    // Simple transaction building (without MeshJS Transaction class)
    const txBuilder = {
      inputs: utxos.slice(0, 1), // Use first UTxO
      outputs: [
        {
          address: recipient,
          amount: [{ unit: 'lovelace', quantity: amount }],
        },
      ],
      fee: '200000', // 0.2 ADA fee
      metadata: null,
    };

    // This would normally use MeshJS Transaction class
    // For now, we'll create a simple transaction structure
    const txHex = JSON.stringify(txBuilder); // Placeholder

    // Sign transaction
    const signedTx = await wallet.signTx(txHex);
    
    // Submit transaction
    const txHash = await wallet.submitTx(signedTx);
    
    return txHash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

// Blockfrost API wrapper
export const createBlockfrostProvider = (projectId: string) => {
  return {
    fetchAddressUTxOs: async (address: string) => {
      try {
        const response = await fetch(
          `https://cardano-preprod.blockfrost.io/api/v0/addresses/${address}/utxos`,
          {
            headers: {
              'project_id': projectId,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Blockfrost API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Blockfrost API error:', error);
        return [];
      }
    },
    
    fetchTxInfo: async (txHash: string) => {
      try {
        const response = await fetch(
          `https://cardano-preprod.blockfrost.io/api/v0/txs/${txHash}`,
          {
            headers: {
              'project_id': projectId,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Blockfrost API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Blockfrost API error:', error);
        return null;
      }
    },
  };
};