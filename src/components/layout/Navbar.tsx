import React, { useState, useEffect } from 'react';
import { useContentStore } from '../../store/contentStore';
import { Plus, Search, CalendarDays, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery, openCreateModal, theme, toggleTheme } = useContentStore();
  const [greeting, setGreeting] = useState('Selamat Datang');

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Selamat Pagi 🌅');
    else if (hrs < 16) setGreeting('Selamat Siang ☀️');
    else if (hrs < 20) setGreeting('Selamat Sore 🌇');
    else setGreeting('Selamat Malam 🌙');
  }, []);

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 right-0 z-20 transition-all duration-300" style={{ left: '16rem', width: 'calc(100% - 16rem)' }}>
      {/* Greetings */}
      <div>
        <h2 className="text-slate-100 font-display font-bold text-lg leading-tight flex items-center gap-2">
          {greeting}, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Creator</span>
        </h2>
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formattedDate}</span>
        </p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4 w-1/2 justify-end">
        {/* Search Input */}
        <div className="relative w-72 max-w-xs group">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-450 group-focus-within:text-indigo-400 transition-colors" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari konten atau tag..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-800/80 rounded-xl text-slate-400 hover:text-slate-100 transition duration-300 transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-indigo-500" />
          )}
        </button>

        {/* Create Content Button */}
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-sans text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Konten</span>
        </button>
      </div>
    </header>
  );
};
export default Navbar;

