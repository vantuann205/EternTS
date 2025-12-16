import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import LoadingAnimation from '../components/LoadingAnimation';
import ErrorModal from '../components/ErrorModal';

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
  showErrorModal: boolean;
  errorMessage: string;
  retryCount: number;
  connectWallet: () => void;
  selectWallet: (walletName: string, attemptNumber?: number) => Promise<void>;
  disconnectWallet: () => void;
  copyAddress: () => void;
  closeWalletModal: () => void;
  closeErrorModal: () => void;
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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

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

  const selectWallet = async (walletName: string, attemptNumber: number = 1) => {
    try {
      setConnecting(true);
      
      // Add small delay for smoother animation
      if (attemptNumber > 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
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
      
      // Add small delay before success to prevent jarring transition
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConnected(true);
      setShowWalletModal(false);
      setRetryCount(0); // Reset retry count on success
      setConnecting(false); // Success - stop connecting
      
    } catch (error) {
      console.error(`Error connecting wallet (attempt ${attemptNumber}):`, error);
      
      // Auto-retry up to 3 attempts total (initial + 2 retries)
      if (attemptNumber < 3) {
        console.log(`Attempt ${attemptNumber} failed, retrying... (${3 - attemptNumber} attempts left)`);
        setRetryCount(attemptNumber);
        // Keep loading state and retry after delay
        setTimeout(() => {
          selectWallet(walletName, attemptNumber + 1);
        }, 1200);
        return;
      }
      
      // All attempts failed, show error modal
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for smooth transition
      setConnecting(false);
      setShowWalletModal(false);
      setRetryCount(0);
      setErrorMessage(
        `Failed to connect to ${walletDisplayNames[walletName] || walletName} after 3 attempts.\n\n` +
        `Please make sure:\n` +
        `• Your wallet extension is installed and unlocked\n` +
        `• You have granted permission to connect\n` +
        `• Try refreshing the page and connecting again\n\n` +
        `If the problem persists, try restarting your browser.`
      );
      setShowErrorModal(true);
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

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
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
    showErrorModal,
    errorMessage,
    retryCount,
    connectWallet,
    selectWallet,
    disconnectWallet,
    copyAddress,
    closeWalletModal,
    closeErrorModal
  };

  return (
    <CardanoWalletContext.Provider value={value}>
      {children}
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={closeErrorModal}
        title="Wallet Connection Failed"
        message={errorMessage}
      />
    </CardanoWalletContext.Provider>
  );
};