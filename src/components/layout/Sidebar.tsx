import React from 'react';
import { useContentStore } from '../../store/contentStore';
import type { AppView } from '../../store/contentStore';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Calendar, 
  List, 
  Sparkles, 
  Database
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';


export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useContentStore();
  
  // Get live count of content items
  const totalItems = useLiveQuery(() => db.contents.count()) ?? 0;
  const publishedItems = useLiveQuery(() => db.contents.where('status').equals('published').count()) ?? 0;

  const navItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban' as AppView, label: 'Kanban Board', icon: KanbanSquare },
    { id: 'calendar' as AppView, label: 'Calendar View', icon: Calendar },
    { id: 'list' as AppView, label: 'Content List', icon: List },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 shrink-0">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-slate-100 leading-tight tracking-wide flex items-center gap-1.5">
            Planner <span className="text-indigo-400 font-extrabold">Hub</span>
          </h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Personal Content</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/5 dark:from-indigo-600/20 dark:to-purple-600/10 text-indigo-600 dark:text-slate-100 border-l-4 border-indigo-500 shadow-md shadow-indigo-500/5' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-500'}`} />
              <span className="font-sans text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Offline Database Info */}
      <div className="p-5 border-t border-slate-800/80 m-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">Offline Workspace</span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-400 font-sans">
          <div className="flex justify-between">
            <span>Total Konten:</span>
            <span className="font-bold text-slate-100 bg-slate-800 px-1.5 py-0.5 rounded">{totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span>Telah Terbit:</span>
            <span className="font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded">{publishedItems}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${totalItems ? (publishedItems / totalItems) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
