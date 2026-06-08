import React, { useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useContentStore } from '../store/contentStore';
import { PLATFORM_CONFIGS, STATUS_CONFIGS } from '../lib/constants';
import type { ContentPlatform, ContentStatus } from '../types/content';
import { 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Eye, 
  Filter, 
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';


export const ListView: React.FC = () => {
  const { 
    searchQuery, 
    filterPlatform, 
    setFilterPlatform,
    filterStatus, 
    setFilterStatus,
    openEditModal, 
    openViewModal 
  } = useContentStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Database live query
  const contents = useLiveQuery(() => db.contents.toArray()) ?? [];

  // Filter content items based on search and filters
  const filteredContents = contents.filter(item => {
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Handle delete
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
      try {
        await db.contents.delete(id);
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    }
  };

  // Export database to JSON file
  const handleExportJSON = () => {
    if (contents.length === 0) {
      alert('Tidak ada data konten untuk diekspor.');
      return;
    }

    try {
      const dataStr = JSON.stringify(contents, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `content_planner_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Gagal mengekspor data.');
    }
  };

  // Import database from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Mengimpor data baru akan menambahkan konten baru ke workspace Anda. Lanjutkan?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          const sanitizedItems = importedData.map((item) => {
            const newItem = { ...item };
            delete newItem.id;
            return newItem;
          });
          await db.contents.bulkAdd(sanitizedItems);
          alert(`Sukses mengimpor ${sanitizedItems.length} konten baru ke database!`);
        } else {
          alert('Format JSON cadangan tidak valid.');
        }
      } catch (err) {
        console.error('Error importing JSON:', err);
        alert('Gagal mengimpor file. Pastikan format JSON sesuai.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title & Backups Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl text-slate-100 tracking-wide">Semua Rencana Konten</h1>
            <span className="text-[10px] bg-slate-800 text-indigo-400 border border-slate-700/80 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">Daftar Workspace</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lihat semua rencana dalam bentuk tabel visual. Filter, edit, hapus, serta lakukan ekspor/impor cadangan data Anda.
          </p>
        </div>

        {/* Export / Import Backups buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Input file for import hidden */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            title="Impor Database Cadangan"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Impor Cadangan</span>
          </button>
          
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            title="Ekspor Database ke JSON"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Cadangan</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar panel */}
      <div className="p-4 rounded-xl border border-slate-800/80 glass-panel flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Cepat</span>
          </div>
          
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Platform filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold">Platform:</span>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value as ContentPlatform | 'all')}
              className="bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            >
              <option value="all">Semua Platform</option>
              {Object.values(PLATFORM_CONFIGS).map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ContentStatus | 'all')}
              className="bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            >
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_CONFIGS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Reset */}
        {(filterPlatform !== 'all' || filterStatus !== 'all' || searchQuery.trim() !== '') && (
          <button
            onClick={() => {
              setFilterPlatform('all');
              setFilterStatus('all');
              useContentStore.setState({ searchQuery: '' });
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Main Table Content */}
      <div className="rounded-2xl border border-slate-800/80 glass-panel overflow-hidden">
        {filteredContents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans text-slate-300">
              
              {/* Table Headers */}
              <thead className="bg-slate-900/40 border-b border-slate-850/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6 w-20">Cover</th>
                  <th className="p-4">Rencana Konten & Deskripsi</th>
                  <th className="p-4 w-36">Platform</th>
                  <th className="p-4 w-36">Status</th>
                  <th className="p-4 w-36">Tanggal Tayang</th>
                  <th className="p-4 pr-6 w-32 text-center">Aksi</th>
                </tr>
              </thead>

              {/* Table Body rows */}
              <tbody className="divide-y divide-slate-850/30 bg-slate-950/5">
                {filteredContents.map((item) => {
                  const pCfg = PLATFORM_CONFIGS[item.platform];
                  const sCfg = STATUS_CONFIGS[item.status];
                  const scheduledStr = new Date(item.scheduledDate).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-900/10 group/row transition duration-200"
                    >
                      {/* Thumbnail cell */}
                      <td className="p-4 pl-6">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-900 flex items-center justify-center shrink-0">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pCfg.color }} />
                          )}
                        </div>
                      </td>

                      {/* Content Title & brief cell */}
                      <td className="p-4 max-w-sm">
                        <div>
                          <h4 
                            onClick={() => openEditModal(item)}
                            className="font-semibold text-slate-100 group-hover/row:text-indigo-400 transition cursor-pointer"
                          >
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-normal">
                            {item.description || <span className="italic text-slate-650">Tidak ada deskripsi singkat.</span>}
                          </p>
                          
                          {/* Tags chips rendering */}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map((t, idx) => (
                                <span key={idx} className="text-[8px] font-bold text-slate-500 bg-slate-900/60 border border-slate-850/60 px-1 py-0.5 rounded">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Platform chip cell */}
                      <td className="p-4">
                        <span 
                          className="inline-flex px-2 py-0.5 rounded text-xs font-semibold tracking-wide capitalize"
                          style={{ backgroundColor: pCfg.bgColor, color: pCfg.textColor }}
                        >
                          {pCfg.label}
                        </span>
                      </td>

                      {/* Status chip cell */}
                      <td className="p-4">
                        <span 
                          className="inline-flex px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ backgroundColor: sCfg.bgColor, color: sCfg.textColor }}
                        >
                          {sCfg.label}
                        </span>
                      </td>

                      {/* Scheduled Date cell */}
                      <td className="p-4 font-sans text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{scheduledStr}</span>
                        </div>
                      </td>

                      {/* Action buttons cell */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openViewModal(item)}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition"
                            title="Detail Rencana"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition"
                            title="Edit Rencana"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded-lg transition"
                            title="Hapus Rencana"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500 text-xs">
            <AlertCircle className="w-8 h-8 text-slate-600 mb-2.5 animate-bounce" />
            <span className="font-bold text-slate-400 text-sm">Tidak Ada Rencana Ditemukan</span>
            <p className="text-slate-500 mt-1 max-w-xs leading-normal">Tidak ada rencana konten yang cocok dengan filter atau kata kunci pencarian Anda saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ListView;
