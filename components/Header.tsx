import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Menu, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onConnectWallet, isWalletConnected }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const navItems = [
    { key: 'Swap', label: t('swap') },
    { key: 'Limit', label: 'Limit' },
    { key: 'Buy', label: 'Buy' },
    { key: 'Sell', label: 'Sell' },
    { key: 'Explore', label: t('explore') },
    { key: 'Pool', label: t('pool') }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

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
        <nav className={`hidden md:flex gap-4 p-1 backdrop-blur-md rounded-full border transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white/90 border-gray-300/70 shadow-lg'
        }`}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? theme === 'dark' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-gray-800 text-white shadow-md'
                  : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className={`hidden lg:flex items-center rounded-xl px-3 py-2 w-64 md:w-80 gap-2 transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border border-slate-700/50 focus-within:bg-slate-800 focus-within:border-pink-500/50' 
            : 'bg-white/90 border border-gray-300/70 shadow-md focus-within:bg-white focus-within:border-pink-400/50 focus-within:shadow-lg'
        }`}>
          <Search size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} />
          <input
            type="text"
            placeholder={t('search')}
            className={`bg-transparent border-none outline-none text-sm w-full ${
              theme === 'dark' 
                ? 'text-white placeholder-slate-500' 
                : 'text-gray-900 placeholder-gray-500'
            }`}
          />
          <span className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
            theme === 'dark' 
              ? 'text-slate-600 bg-slate-800 border-slate-700' 
              : 'text-gray-500 bg-gray-100 border-gray-300'
          }`}>/</span>
        </div>

        {/* Language Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-slate-800/50' 
                : 'hover:bg-gray-100/70'
            }`}
          >
            <Globe size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} />
            <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              {languages.find(lang => lang.code === language)?.flag}
            </span>
            <ChevronDown size={14} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} />
          </button>
          
          {isLanguageDropdownOpen && (
            <div className={`absolute right-0 top-full mt-2 rounded-xl shadow-lg z-50 min-w-[150px] border ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-gray-200 shadow-xl'
            }`}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setIsLanguageDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    theme === 'dark' 
                      ? 'hover:bg-slate-800' 
                      : 'hover:bg-gray-50'
                  } ${
                    language === lang.code 
                      ? 'text-pink-500' 
                      : theme === 'dark' 
                        ? 'text-slate-300' 
                        : 'text-gray-700'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
            theme === 'dark' 
              ? 'hover:bg-slate-800/50' 
              : 'hover:bg-gray-100/70'
          }`}
          title={theme === 'dark' ? t('lightMode') : t('darkMode')}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-yellow-400 hover:text-yellow-300 transition-colors" />
          ) : (
            <Moon size={20} className="text-slate-700 hover:text-slate-900 transition-colors" />
          )}
        </button>

        {/* Network Selector (Visual only) */}
        <div className={`hidden md:flex items-center gap-2 cursor-pointer p-2 rounded-xl transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-slate-800' 
            : 'hover:bg-gray-100'
        }`}>
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">E</div>
        </div>

        {/* Wallet Button */}
        <button
          onClick={onConnectWallet}
          className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${
            isWalletConnected
              ? theme === 'dark'
                ? 'bg-slate-800 text-white border border-slate-700 hover:border-slate-600'
                : 'bg-gray-800 text-white border border-gray-600 hover:border-gray-500 shadow-md'
              : theme === 'dark'
                ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20'
                : 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 hover:border-pink-300'
          }`}
        >
          {isWalletConnected ? '0x12...3456' : t('connect')}
        </button>
        
        {/* Mobile Menu Toggle */}
        <button className={`md:hidden p-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
