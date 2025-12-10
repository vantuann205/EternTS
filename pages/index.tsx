import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import SwapCard from '../components/SwapCard';
import ChartWidget from '../components/ChartWidget';
import GeminiDrawer from '../components/GeminiDrawer';
import { Token } from '../types';
import { TOKENS } from '../constants';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Swap');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [insightToken, setInsightToken] = useState<Token | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // We keep a "primary" token for the chart view if user is in "Explore" mode, 
  // or use the input token from swap to show chart side-by-side on desktop.
  // For simplicity, let's just track a selected token for chart.
  const [chartToken, setChartToken] = useState<Token>(TOKENS[0]);

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
        <title>Uniswap Clone</title>
        <meta name="description" content="A Uniswap clone built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-pink-500/30">
        {/* Ambient background effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen" />
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
                    <div className="hidden lg:block flex-1 w-full max-w-2xl bg-slate-900/50 border border-slate-800/50 rounded-3xl overflow-hidden backdrop-blur-sm h-[500px]">
                       <ChartWidget token={chartToken} />
                    </div>

                    {/* Right Side: Swap Interface */}
                    <div className="flex flex-col items-center justify-center w-full lg:w-auto">
                      <SwapCard 
                          onTokenAnalysisRequest={handleTokenAnalysis}
                          isWalletConnected={isWalletConnected}
                          onConnect={handleConnectWallet}
                      />
                      
                      {/* Helper text */}
                      <div className="mt-8 text-slate-500 text-sm max-w-[400px] text-center">
                          <p>Uniswap is available on Ethereum, Polygon, Optimism, Arbitrum, Celo, BNB Chain, Avalanche, and Base.</p>
                      </div>
                    </div>
                 </div>
              )}

              {activeTab === 'Explore' && (
                  <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md p-4">
                       <ChartWidget token={chartToken} />
                       <div className="p-6 border-t border-slate-800">
                          <h3 className="text-xl font-medium mb-4">Top Tokens</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {TOKENS.map(t => (
                                  <button 
                                      key={t.symbol}
                                      onClick={() => setChartToken(t)}
                                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 text-left"
                                  >
                                      <span className="text-slate-500 text-sm w-4">#{TOKENS.indexOf(t) + 1}</span>
                                      <img src={t.logoURI} className="w-8 h-8 rounded-full" alt={t.name} />
                                      <div className="flex-1">
                                          <div className="font-medium">{t.name}</div>
                                          <div className="text-xs text-slate-500">{t.symbol}</div>
                                      </div>
                                      <div className="text-right">
                                          <div>${t.price}</div>
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
                   <div className="text-center text-slate-500 mt-20">
                       <h2 className="text-2xl font-bold text-white mb-2">NFTs coming soon</h2>
                       <p>Explore top collections across marketplaces.</p>
                   </div>
               )}
               
               {activeTab === 'Pool' && (
                   <div className="text-center text-slate-500 mt-20">
                       <h2 className="text-2xl font-bold text-white mb-2">Pools</h2>
                       <p>Provide liquidity and earn fees.</p>
                       <button className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors">
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
      </div>
    </>
  );
};

export default Home;