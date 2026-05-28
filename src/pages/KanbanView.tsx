import React from 'react';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useContentStore } from '../store/contentStore';
import { PLATFORM_CONFIGS, STATUS_CONFIGS } from '../lib/constants';
import type { ContentItem, ContentStatus } from '../types/content';
import { 
  Plus, 
  Calendar
} from 'lucide-react';

export const KanbanView: React.FC = () => {
  const { searchQuery, filterPlatform, openCreateModal, openEditModal } = useContentStore();

  
  // Live query database
  const contents = useLiveQuery(() => db.contents.toArray()) ?? [];

  // Filter content items based on search and filters
  const filteredContents = contents.filter(item => {
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    
    return matchesSearch && matchesPlatform;
  });

  const columns: { status: ContentStatus; label: string; color: string }[] = [
    { status: 'draft', label: 'Draft', color: 'border-t-slate-500 bg-slate-500/5' },
    { status: 'in_progress', label: 'In Progress', color: 'border-t-amber-500 bg-amber-500/5' },
    { status: 'scheduled', label: 'Scheduled', color: 'border-t-blue-500 bg-blue-500/5' },
    { status: 'published', label: 'Published', color: 'border-t-emerald-500 bg-emerald-500/5' }
  ];

  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(item.id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ContentStatus) => {
    e.preventDefault();
    const itemIdStr = e.dataTransfer.getData('text/plain');
    const itemId = Number(itemIdStr);
    
    if (isNaN(itemId)) return;

    try {
      const item = contents.find(c => c.id === itemId);
      if (item && item.status !== targetStatus) {
        const updates: Partial<ContentItem> = { 
          status: targetStatus,
          updatedAt: new Date().toISOString()
        };
        
        // If status changes to published, assign published date
        if (targetStatus === 'published') {
          updates.publishedDate = new Date().toISOString().split('T')[0];
        }
        
        await db.contents.update(itemId, updates);
      }
    } catch (err) {
      console.error('Failed to drop item:', err);
    }
  };

  const handleQuickAdd = (status: ContentStatus) => {
    openCreateModal();
    // After opening modal, update its default status to the column status
    setTimeout(() => {
      useContentStore.setState({
        selectedItem: {
          title: '',
          description: '',
          platform: 'instagram',
          status: status,
          scheduledDate: new Date().toISOString().split('T')[0],
          tags: [],
          notes: '',
          createdAt: '',
          updatedAt: ''
        }
      });
    }, 50);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* View Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl text-slate-100 tracking-wide">Status Kanban Board</h1>
            <span className="text-[10px] bg-slate-800 text-indigo-400 border border-slate-700/80 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">Interactive DND</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seret dan lepas kartu rencana konten antar kolom untuk memperbarui status pengerjaan secara instan.
          </p>
        </div>
      </div>

      {/* Kanban Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {columns.map((col) => {
          const colItems = filteredContents.filter(item => item.status === col.status);
          
          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`rounded-2xl border border-slate-800/80 glass-panel flex flex-col max-h-[75vh] min-h-[300px] border-t-4 ${col.color}`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: STATUS_CONFIGS[col.status].color }} 
                  />
                  <h3 className="font-display font-bold text-sm text-slate-200">{col.label}</h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-950/40 border border-slate-850 px-1.5 py-0.5 rounded-md">
                    {colItems.length}
                  </span>
                </div>
                
                {/* Quick Add Button */}
                <button
                  onClick={() => handleQuickAdd(col.status)}
                  className="text-slate-500 hover:text-slate-100 p-1 hover:bg-slate-800 rounded-lg transition"
                  title={`Tambah konten ${col.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Card List container */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 pr-2">
                {colItems.map((item) => {
                  const pCfg = PLATFORM_CONFIGS[item.platform];
                  const scheduledStr = new Date(item.scheduledDate).toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => openEditModal(item)}
                      className="glass-panel-interactive border border-slate-800/60 bg-slate-950/20 rounded-xl p-3.5 cursor-grab active:cursor-grabbing relative overflow-hidden group select-none"
                    >
                      {/* Subtle color highlight in card corner */}
                      <span 
                        className="absolute top-0 right-0 w-8 h-8 rounded-bl-full opacity-20 transition duration-300 group-hover:opacity-40" 
                        style={{ backgroundColor: pCfg.color }}
                      />

                      {/* Card Thumbnail if exists */}
                      {item.thumbnail && (
                        <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-800/60 mb-3 shrink-0">
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Title */}
                      <h4 className="text-slate-100 font-sans text-xs font-semibold leading-relaxed line-clamp-2 tracking-wide group-hover:text-indigo-400 transition-colors duration-300">
                        {item.title}
                      </h4>

                      {/* Description preview */}
                      {item.description && (
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-1.5 leading-normal">
                          {item.description}
                        </p>
                      )}

                      {/* Tags chips */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {item.tags.slice(0, 2).map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="text-[8px] font-semibold text-slate-400 bg-slate-900/60 border border-slate-850 px-1 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="text-[8px] font-bold text-slate-500 px-1 py-0.5">+{item.tags.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t border-slate-850 my-2.5" />

                      {/* Metadata row */}
                      <div className="flex justify-between items-center">
                        {/* Platform chip */}
                        <span 
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide capitalize"
                          style={{ backgroundColor: pCfg.bgColor, color: pCfg.textColor }}
                        >
                          {pCfg.label}
                        </span>

                        {/* Date target */}
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{scheduledStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colItems.length === 0 && (
                  <div className="h-32 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-600 italic text-center p-4">
                    <span>Kosong</span>
                    <span className="text-[8px] text-slate-700 mt-0.5">Tarik kartu ke sini</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default KanbanView;
