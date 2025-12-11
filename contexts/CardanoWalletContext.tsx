import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import LoadingAnimation from '../components/LoadingAnimation';

interface WalletOption {
  name: string;
  icon: string;
  displayName: string;
}

interface CardanoWalletContextType {
  wallet: BrowserWallet | null;
  connected: boolean;
  connecting: boolean;
  address: string;
  fullAddress: string;
  balance: string;
  showWalletModal: boolean;
  availableWallets: WalletOption[];
  connectWallet: () => void;
  selectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  copyAddress: () => void;
  closeWalletModal: () => void;
}

const CardanoWalletContext = createContext<CardanoWalletContextType | undefined>(undefined);

export const useCardanoWallet = () => {
  const context = useContext(CardanoWalletContext);
  if (!context) {
    throw new Error('useCardanoWallet must be used within a CardanoWalletProvider');
  }
  return context;
};

interface CardanoWalletProviderProps {
  children: ReactNode;
}

export const CardanoWalletProvider: React.FC<CardanoWalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  // Friendly wallet display names
  const walletDisplayNames: Record<string, string> = {
    nami: 'Nami Wallet',
    eternl: 'Eternl Wallet', 
    flint: 'Flint Wallet',
    typhon: 'Typhon Wallet',
    gerowallet: 'Gero Wallet',
    nufi: 'NuFi Wallet',
    lace: 'Lace Wallet',
    vespr: 'Vespr Wallet'
  };

  const connectWallet = () => {
    // Get available wallets from Mesh SDK - includes official logos
    try {
      const installedWallets = BrowserWallet.getInstalledWallets();
      
      const walletOptions: WalletOption[] = installedWallets.map(wallet => ({
        name: wallet.name,
        icon: wallet.icon, // Use official logo from Mesh SDK
        displayName: walletDisplayNames[wallet.name] || wallet.name.charAt(0).toUpperCase() + wallet.name.slice(1)
      }));
      
      setAvailableWallets(walletOptions);
      setShowWalletModal(true);
    } catch (error) {
      console.error('Error getting wallets:', error);
      // Fallback - show modal with empty list
      setAvailableWallets([]);
      setShowWalletModal(true);
    }
  };

  const selectWallet = async (walletName: string) => {
    try {
      setConnecting(true);
      
      const browserWallet = await BrowserWallet.enable(walletName);
      setWallet(browserWallet);
      
      // Get wallet address
      const addresses = await browserWallet.getUsedAddresses();
      if (addresses.length > 0) {
        setFullAddress(addresses[0]);
        setAddress(addresses[0]);
      }
      
      // Get wallet balance
      try {
        const utxos = await browserWallet.getUtxos();
        let totalBalance = 0;
        
        utxos.forEach(utxo => {
          utxo.output.amount.forEach(asset => {
            if (asset.unit === 'lovelace') {
              totalBalance += parseInt(asset.quantity);
            }
          });
        });
        
        // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
        const adaBalance = (totalBalance / 1000000).toFixed(6);
        setBalance(adaBalance);
      } catch (error) {
        console.error('Error getting balance:', error);
        setBalance('0');
      }
      
      setConnected(true);
      setShowWalletModal(false);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please make sure the wallet is unlocked and try again.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setConnected(false);
    setAddress('');
    setFullAddress('');
    setBalance('0');
  };

  const copyAddress = () => {
    if (fullAddress) {
      navigator.clipboard.writeText(fullAddress);
      // You could add a toast notification here
    }
  };

  const closeWalletModal = () => {
    setShowWalletModal(false);
    setConnecting(false);
  };

  // Format address for display (addr1...last4chars)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  const value: CardanoWalletContextType = {
    wallet,
    connected,
    connecting,
    address: formatAddress(address),
    fullAddress,
    balance,
    showWalletModal,
    availableWallets,
    connectWallet,
    selectWallet,
    disconnectWallet,
    copyAddress,
    closeWalletModal
  };

  return (
    <CardanoWalletContext.Provider value={value}>
      {children}
    </CardanoWalletContext.Provider>
  );
};