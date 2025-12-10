import React from 'react';
import { Search, MoreHorizontal, Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onConnectWallet, isWalletConnected }) => {
  const navItems = ['Swap', 'Explore', 'NFTs', 'Pool'];

  return (
    <header className="flex items-center justify-between px-4 py-4 md:px-6 z-50 relative">
      <div className="flex items-center gap-8">
        {/* Logo Area */}
        <div className="flex items-center text-pink-500 cursor-pointer">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-pink-500">
             <path d="M18.84 5.38C18.66 5.16 18.25 5.56 18.42 5.81C19.34 7.15 19.89 8.78 19.89 10.54C19.89 15.39 16.32 19.41 11.69 20.09C11.51 20.12 11.33 19.98 11.35 19.8C11.45 18.9 11.5 17.98 11.5 17.04C11.5 10.98 7.37 5.92 1.83 4.29C1.65 4.24 1.57 4.02 1.72 3.92C3.25 2.87 5.09 2.25 7.07 2.25C9.37 2.25 11.47 3.07 13.11 4.43C13.29 4.58 13.56 4.52 13.66 4.31C14.39 2.86 15.89 1.87 17.63 1.87C19.5 1.87 21.08 3.12 21.5 4.83C21.55 5.03 21.36 5.19 21.16 5.14C20.35 4.95 19.51 5.03 18.84 5.38Z" fill="currentColor"/>
           </svg>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4 p-1 bg-slate-800/50 backdrop-blur-md rounded-full border border-slate-700/50">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === item
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 w-64 md:w-80 gap-2 transition-all focus-within:bg-slate-800 focus-within:border-pink-500/50">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search tokens and NFT collections"
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-slate-500"
          />
          <span className="text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">/</span>
        </div>

        {/* Network Selector (Visual only) */}
        <div className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">E</div>
        </div>

        {/* Wallet Button */}
        <button
          onClick={onConnectWallet}
          className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${
            isWalletConnected
              ? 'bg-slate-800 text-white border border-slate-700 hover:border-slate-600'
              : 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20'
          }`}
        >
          {isWalletConnected ? '0x12...3456' : 'Connect'}
        </button>
        
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-slate-400">
            <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
