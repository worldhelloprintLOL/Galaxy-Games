
import React, { useState, useEffect, useMemo } from 'react';
import { GAMES as INITIAL_GAMES } from './constants';
import { Game, ProxyNode } from './types';

const CLOAK_OPTIONS = [
  { id: 'classroom', name: 'Google Classroom', title: 'Classes', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
  { id: 'drive', name: 'Google Drive', title: 'My Drive - Google Drive', icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png' },
  { id: 'docs', name: 'Google Docs', title: 'Google Docs', icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico' },
  { id: 'canvas', name: 'Canvas', title: 'Dashboard', icon: 'https://du11hjcvhe07u.cloudfront.net/favicon.ico' }
];

const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDeepCloak, setIsDeepCloak] = useState(false);
  
  const [currentCloak, setCurrentCloak] = useState('classroom');
  const [panicKey] = useState('`');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [navigatorUrl, setNavigatorUrl] = useState('');
  const [currentProxyUrl, setCurrentProxyUrl] = useState('');

  // Local Storage Sync
  useEffect(() => {
    const savedFavs = localStorage.getItem('galaxy_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedCloak = localStorage.getItem('galaxy_cloak_v2');
    if (savedCloak) setCurrentCloak(savedCloak);

    // Handle incoming game launch from URL param
    const params = new URLSearchParams(window.location.search);
    const playId = params.get('play');
    if (playId) {
      const game = INITIAL_GAMES.find(g => g.id === playId);
      if (game) setSelectedGame(game);
    }
  }, []);

  // Set Tab Identity (Title & Favicon)
  useEffect(() => {
    const cloak = CLOAK_OPTIONS.find(c => c.id === currentCloak) || CLOAK_OPTIONS[0];
    document.title = cloak.title;
    
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = cloak.icon;
    localStorage.setItem('galaxy_cloak_v2', currentCloak);
  }, [currentCloak]);

  // Panic Redirect
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === panicKey) window.location.replace('https://classroom.google.com');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [panicKey]);

  useEffect(() => {
    localStorage.setItem('galaxy_favs', JSON.stringify(favorites));
  }, [favorites]);

  const filteredGames = useMemo(() => {
    return INITIAL_GAMES.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeCategory === 'Favorites') return favorites.includes(game.id) && matchesSearch;
      if (activeCategory === 'All') return matchesSearch;
      return game.category === activeCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, favorites]);

  // Critical Fix: Strip proxy-added artifacts like .googhttps/ or duplicated protocols
  const sanitizeUrl = (url: string) => {
    let clean = url.trim();
    // Remove the trailing proxy mangling
    clean = clean.split('.googhttps')[0];
    clean = clean.split('.usercontent')[0];
    // Remove protocol double-ups
    clean = clean.replace(/^(https?:\/\/)+/i, '');
    // Remove common filter prefixes
    clean = clean.replace(/^googhttps\//i, '');
    return 'https://' + clean;
  };

  const handleNavigatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = sanitizeUrl(navigatorUrl);
    setCurrentProxyUrl(url);
  };

  const startDeepCloak = () => {
    setIsDeepCloak(true);
    // Hide scrollbars for full immersion
    document.body.style.overflow = 'hidden';
  };

  const exitDeepCloak = () => {
    setIsDeepCloak(false);
    setSelectedGame(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1e] text-slate-200">
      {/* Deep Cloak Overlay: This is the primary way to bypass filters */}
      {isDeepCloak && selectedGame && (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-in fade-in duration-300">
          <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
               <button onClick={exitDeepCloak} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
               </button>
               <img src={CLOAK_OPTIONS.find(c => c.id === currentCloak)?.icon} className="w-8 h-8 object-contain" alt="" />
               <span className="text-xl font-medium text-gray-600 tracking-tight">
                 {currentCloak === 'classroom' ? 'Google Classroom' : 
                  currentCloak === 'drive' ? 'Google Drive' : 
                  currentCloak === 'canvas' ? 'Canvas' : 'Google Docs'}
               </span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">S</div>
            </div>
          </header>
          <div className="flex-1 bg-black relative">
             {selectedGame.component ? <selectedGame.component /> : (
               <iframe 
                 className="w-full h-full border-0" 
                 referrerPolicy="no-referrer"
                 srcDoc={`<!DOCTYPE html><html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden;">${selectedGame.htmlContent}</body></html>`} 
                 title={selectedGame.title} 
               />
             )}
             {/* Invisible Escape Hatch */}
             <div className="absolute top-0 right-0 w-12 h-12 hover:bg-white/5 cursor-pointer opacity-0" onClick={exitDeepCloak} title="Exit"></div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveCategory('All')}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-all">🌌</div>
            <h1 className="text-2xl font-orbitron font-bold text-white tracking-tighter uppercase">Galaxy<span className="text-emerald-500">Games</span></h1>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md mx-10">
            <input 
              type="text" 
              placeholder="Search unblocked galaxy..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-2.5 focus:ring-2 focus:ring-emerald-500 text-sm outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setSettingsOpen(true)} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-700" title="Tab Cloaking">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
            <div className="h-8 w-px bg-slate-800 mx-1"></div>
            <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold uppercase tracking-widest hidden sm:block">Status: Safe</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 pb-32">
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar mb-10">
          {['All', 'Favorites', 'Navigator', 'Arcade', 'Puzzle', 'Strategy', 'Skill'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {activeCategory === 'Navigator' ? (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-12 text-center shadow-2xl">
              <h2 className="text-4xl font-orbitron font-bold mb-6 text-white uppercase">Proxy Navigator</h2>
              <p className="text-slate-500 mb-10 text-sm max-w-lg mx-auto italic">URL Sanitization is active. We strip ".googhttps" and proxy mangling automatically.</p>
              <form onSubmit={handleNavigatorSubmit} className="flex gap-4 p-2 bg-slate-950 rounded-3xl border border-slate-800 focus-within:border-emerald-500/50 shadow-inner">
                <input 
                  type="text" 
                  value={navigatorUrl}
                  onChange={e => setNavigatorUrl(e.target.value)}
                  placeholder="Paste URL here..."
                  className="flex-1 bg-transparent px-8 py-5 text-white outline-none placeholder:text-slate-700 font-mono"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 rounded-2xl font-bold transition-all shadow-xl active:scale-95">Go</button>
              </form>
              
              {currentProxyUrl && (
                <div className="mt-12 relative bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
                  <div className="bg-slate-800 p-4 flex items-center justify-between px-10 border-b border-slate-700">
                    <span className="text-[11px] font-mono text-emerald-400 truncate max-w-[70%]">{currentProxyUrl}</span>
                    <button onClick={() => setCurrentProxyUrl('')} className="text-slate-400 hover:text-white text-xs font-bold uppercase">Close</button>
                  </div>
                  <iframe src={currentProxyUrl} className="w-full h-[650px] border-0 bg-white" title="Safe View" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredGames.map(game => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGame(game)} 
                className="group relative bg-slate-900/30 rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl hover:-translate-y-2 duration-300 cursor-pointer"
              >
                <div className="h-52 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] to-transparent opacity-80 z-10"></div>
                  <img src={game.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={game.title} />
                  <div className="absolute bottom-6 left-8 z-20">
                     <span className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{game.category}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFavorites(prev => prev.includes(game.id) ? prev.filter(f => f !== game.id) : [...prev, game.id]); }}
                    className={`absolute top-6 right-8 z-20 p-3 rounded-2xl border transition-all ${favorites.includes(game.id) ? 'bg-rose-500 border-rose-400 text-white' : 'bg-black/50 border-white/10 text-white/50 hover:text-white'}`}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </button>
                </div>
                <div className="p-8">
                  <h4 className="font-bold text-2xl text-white group-hover:text-emerald-400 transition-colors mb-3">{game.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Game Modal */}
      {selectedGame && !isDeepCloak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedGame(null)}></div>
          <div className="relative z-10 w-full max-w-5xl bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-full">
            <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-slate-900 border-b border-slate-800 gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <h2 className="text-3xl font-orbitron font-bold text-white uppercase tracking-tighter">{selectedGame.title}</h2>
                <div className="flex gap-3">
                  <button onClick={startDeepCloak} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Deep Cloak Mode
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedGame(null)} className="p-4 bg-slate-800/50 hover:bg-rose-600 hover:text-white rounded-2xl text-slate-500 transition-all border border-slate-700">✕ Close</button>
            </div>
            <div className="flex-1 bg-black flex items-center justify-center overflow-auto p-4 sm:p-10 min-h-[400px]">
               {selectedGame.component ? <selectedGame.component /> : <iframe className="w-full h-full border-0 bg-[#0a0f1e]" srcDoc={`<!DOCTYPE html><html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden;">${selectedGame.htmlContent}</body></html>`} title={selectedGame.title} referrerPolicy="no-referrer" />}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSettingsOpen(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-orbitron font-bold text-white uppercase tracking-wider mb-8">Stealth Identity</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-[0.2em]">Select Identity Cloak</label>
                <div className="grid grid-cols-2 gap-4">
                  {CLOAK_OPTIONS.map(cloak => (
                    <button 
                      key={cloak.id} 
                      onClick={() => setCurrentCloak(cloak.id)}
                      className={`p-4 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center gap-3 ${currentCloak === cloak.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <img src={cloak.icon} className="w-5 h-5 object-contain rounded-sm" alt="" />
                      <span className="truncate">{cloak.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Panic Shortcut</span>
                    <span className="text-emerald-400 font-mono font-bold">[{panicKey}]</span>
                 </div>
                 <p className="text-[11px] text-slate-600 leading-relaxed italic">Instantly replaces current page with Google Classroom if pressed.</p>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/40">Apply Stealth</button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto border-t border-slate-900/50 py-12 bg-slate-950/20 text-center relative">
         <div className="flex items-center justify-center gap-6 text-slate-700 text-[10px] font-mono uppercase tracking-[0.3em]">
            <span>IDENTITY: {currentCloak.toUpperCase()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-900 animate-pulse"></span>
            <span>ENCRYPTION: HARDENED</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-900 animate-pulse"></span>
            <span>PROXY: CLEANED</span>
         </div>
      </footer>
    </div>
  );
};

export default App;
