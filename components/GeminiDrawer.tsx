import React, { useEffect, useState } from 'react';
import { X, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { Token, MarketInsight } from '../types';
import { getTokenInsight } from '../services/geminiService';

interface GeminiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
}

const GeminiDrawer: React.FC<GeminiDrawerProps> = ({ isOpen, onClose, token }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<MarketInsight | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      setInsight(null);
      getTokenInsight(token.name)
        .then(data => {
            setInsight(data);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, token]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-pink-500">
                    <Sparkles size={20} />
                    <h2 className="font-semibold text-lg">Gemini Insights</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {!token ? (
                    <div className="text-slate-500 text-center mt-10">Select a token to view insights</div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <img src={token.logoURI} alt={token.symbol} className="w-10 h-10 rounded-full" />
                            <div>
                                <h3 className="text-white font-bold text-xl">{token.name}</h3>
                                <div className="text-slate-400 text-sm">{token.symbol}</div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                                <Loader2 className="animate-spin text-pink-500" size={32} />
                                <p>Analyzing market data...</p>
                            </div>
                        ) : insight ? (
                            <div className="space-y-6">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <h4 className="text-slate-300 font-medium mb-2 text-sm uppercase tracking-wider">AI Summary</h4>
                                    <p className="text-slate-100 leading-relaxed text-sm">
                                        {insight.analysis}
                                    </p>
                                </div>

                                {insight.sources.length > 0 && (
                                    <div>
                                        <h4 className="text-slate-400 font-medium mb-3 text-sm">Sources</h4>
                                        <div className="flex flex-col gap-2">
                                            {insight.sources.map((source, idx) => (
                                                <a 
                                                    key={idx}
                                                    href={source.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-start gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
                                                >
                                                    <ExternalLink size={16} className="text-slate-500 group-hover:text-pink-400 mt-0.5 shrink-0" />
                                                    <span className="text-sm text-slate-300 group-hover:text-white truncate">{source.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-red-400 text-center">Unable to load insights.</div>
                        )}
                    </>
                )}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <p className="text-[10px] text-slate-600 text-center">
                    Insights generated by Gemini 2.5 Flash. Not financial advice. Always do your own research.
                </p>
            </div>
        </div>
      </div>
    </>
  );
};

export default GeminiDrawer;
