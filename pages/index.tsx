import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import SwapCard from '../components/SwapCard';
import TradingViewChart from '../components/TradingViewChart';
import GeminiDrawer from '../components/GeminiDrawer';
import { Token } from '../types';
import { TOKENS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import ApiStatus from '../components/ApiStatus';
import DebugPanel from '../components/DebugPanel';
import ChartTest from '../components/ChartTest';


const Home: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Swap');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [insightToken, setInsightToken] = useState<Token | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // We keep a "primary" token for the chart view if user is in "Explore" mode, 
  // or use the input token from swap to show chart side-by-side on desktop.
  // For simplicity, let's just track a selected token for chart.
  const [chartToken, setChartToken] = useState<Token>(TOKENS[0]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleConnectWallet = () => {
    setIsWalletConnected(!isWalletConnected);
  };

  const handleTokenAnalysis = (token: Token) => {
    setInsightToken(token);
    setIsDrawerOpen(true);
  };

  return (
    <>
      <Head>
        <title>EternTS</title>
        <meta name="description" content="A EternTS clone built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen font-sans selection:bg-pink-500/30 transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-slate-950 text-white' 
          : 'bg-gradient-to-br from-slate-50 to-gray-100 text-slate-900'
      }`}>
        {/* Ambient background effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse ${
              theme === 'dark' 
                ? 'bg-pink-600/20 mix-blend-screen' 
                : 'bg-pink-300/40 mix-blend-multiply'
            }`} style={{ animationDuration: '10s' }} />
            <div className={`absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[100px] ${
              theme === 'dark' 
                ? 'bg-blue-600/10 mix-blend-screen' 
                : 'bg-blue-300/30 mix-blend-multiply'
            }`} />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
            <Header 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              isWalletConnected={isWalletConnected}
              onConnectWallet={handleConnectWallet}
            />

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
              {activeTab === 'Swap' && (
                 <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16">
                    {/* Left Side: Chart (Visible on Large Screens for "Pro" feel) */}
                    <div className={`hidden lg:block flex-1 w-full max-w-2xl rounded-3xl overflow-hidden backdrop-blur-sm h-[500px] transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-slate-900/50 border border-slate-800/50' 
                        : 'bg-white/70 border border-gray-200/50 shadow-lg'
                    }`}>
                       <TradingViewChart token={chartToken} />
                    </div>

                    {/* Right Side: Swap Interface */}
                    <div className="flex flex-col items-center justify-center w-full lg:w-auto">
                      <SwapCard 
                          onTokenAnalysisRequest={handleTokenAnalysis}
                          isWalletConnected={isWalletConnected}
                          onConnect={handleConnectWallet}
                          onTokenChange={setChartToken}
                      />
                      
                      {/* Helper text */}
                      <div className={`mt-8 text-sm max-w-[400px] text-center transition-colors ${
                        theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
                      }`}>
                          <p>EternTS is available on Ethereum, Polygon, Optimism, Arbitrum, Celo, BNB Chain, Avalanche, and Base.</p>
                      </div>
                    </div>
                 </div>
              )}

              {activeTab === 'Explore' && (
                  <div className={`w-full max-w-5xl rounded-3xl overflow-hidden backdrop-blur-md p-4 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-slate-900/80 border border-slate-800' 
                      : 'bg-white/80 border border-gray-200 shadow-lg'
                  }`}>
                       <TradingViewChart token={chartToken} />
                       <div className={`p-6 border-t transition-colors ${
                         theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
                       }`}>
                          <h3 className={`text-xl font-medium mb-4 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>Top Tokens</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {TOKENS.map(t => (
                                  <button 
                                      key={t.symbol}
                                      onClick={() => setChartToken(t)}
                                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors border border-transparent text-left ${
                                        theme === 'dark' 
                                          ? 'hover:bg-slate-800 hover:border-slate-700' 
                                          : 'hover:bg-gray-50 hover:border-gray-300'
                                      }`}
                                  >
                                      <span className={`text-sm w-4 ${
                                        theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                                      }`}>#{TOKENS.indexOf(t) + 1}</span>
                                      <img src={t.logoURI} className="w-8 h-8 rounded-full" alt={t.name} />
                                      <div className="flex-1">
                                          <div className={`font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                          }`}>{t.name}</div>
                                          <div className={`text-xs ${
                                            theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                                          }`}>{t.symbol}</div>
                                      </div>
                                      <div className="text-right">
                                          <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${t.price}</div>
                                          <div className={(t.change24h || 0) >= 0 ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
                                              {(t.change24h || 0) > 0 ? '+' : ''}{t.change24h}%
                                          </div>
                                      </div>
                                  </button>
                              ))}
                          </div>
                       </div>
                  </div>
              )}

               {activeTab === 'NFTs' && (
                   <div className={`text-center mt-20 ${
                     theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
                   }`}>
                       <h2 className={`text-2xl font-bold mb-2 ${
                         theme === 'dark' ? 'text-white' : 'text-gray-900'
                       }`}>NFTs coming soon</h2>
                       <p>Explore top collections across marketplaces.</p>
                   </div>
               )}
               
               {activeTab === 'Pool' && (
                   <div className={`text-center mt-20 ${
                     theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
                   }`}>
                       <h2 className={`text-2xl font-bold mb-2 ${
                         theme === 'dark' ? 'text-white' : 'text-gray-900'
                       }`}>Pools</h2>
                       <p>Provide liquidity and earn fees.</p>
                       <button className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors shadow-lg">
                           New Position
                       </button>
                   </div>
               )}

            </main>
        </div>

        <GeminiDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          token={insightToken}
        />
        
        {/* API Status Indicator */}
        <ApiStatus />
        
        {/* Debug Panel for testing API */}
        <DebugPanel />
        
        {/* Chart Test */}
        <ChartTest />

      </div>
    </>
  );
};

export default Home;