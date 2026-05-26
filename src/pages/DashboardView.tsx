import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useContentStore } from '../store/contentStore';
import { PLATFORM_CONFIGS, STATUS_CONFIGS } from '../lib/constants';
import type { ContentPlatform, ContentStatus } from '../types/content';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { openViewModal } = useContentStore();


  // Query live data from IndexedDB
  const contents = useLiveQuery(() => db.contents.toArray()) ?? [];

  // Calculate statistics
  const total = contents.length;
  
  const statusCounts = contents.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<ContentStatus, number>);

  const platformCounts = contents.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {} as Record<ContentPlatform, number>);

  const published = statusCounts['published'] || 0;
  const progressRate = total ? Math.round((published / total) * 100) : 0;

  // Filter content upcoming in next 7 days
  const todayStr = new Date().toISOString().split('T')[0];
  const next7DaysStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const upcomingContents = contents
    .filter(item => item.scheduledDate >= todayStr && item.scheduledDate <= next7DaysStr && item.status !== 'published')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 4);

  // Prepare chart data: Platform distribution
  const platformChartData = Object.keys(PLATFORM_CONFIGS).map(key => {
    const p = key as ContentPlatform;
    return {
      name: PLATFORM_CONFIGS[p].label,
      value: platformCounts[p] || 0,
      color: PLATFORM_CONFIGS[p].color
    };
  }).filter(item => item.value > 0);

  // Prepare chart data: Status breakdown
  const statusChartData = Object.entries(STATUS_CONFIGS).map(([key, value]) => {
    const s = key as ContentStatus;
    return {
      name: value.label,
      jumlah: statusCounts[s] || 0,
      color: value.color
    };
  });

  const cards = [
    { 
      label: 'Total Rencana', 
      value: total, 
      desc: 'Semua platform', 
      icon: Layers, 
      colorClass: 'text-indigo-400 border-indigo-500/20 bg-indigo-950/10' 
    },
    { 
      label: 'Telah Terbit', 
      value: published, 
      desc: 'Live di platform', 
      icon: CheckCircle2, 
      colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10' 
    },
    { 
      label: 'Sedang Proses', 
      value: (statusCounts['in_progress'] || 0) + (statusCounts['draft'] || 0), 
      desc: 'Draft & In-Progress', 
      icon: Clock, 
      colorClass: 'text-amber-400 border-amber-500/20 bg-amber-950/10' 
    },
    { 
      label: 'Selesai Dijadwal', 
      value: statusCounts['scheduled'] || 0, 
      desc: 'Siap tayang otomatis', 
      icon: Calendar, 
      colorClass: 'text-blue-400 border-blue-500/20 bg-blue-950/10' 
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-semibold rounded-full shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace Aktif</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-wide">
              Kelola Konten Sosial Media Lebih Visual
            </h1>
            <p className="text-sm text-slate-300 max-w-xl font-sans">
              Selamat datang di pusat perencanaan konten Anda. Gunakan kalender visual atau Kanban board untuk mengatur jadwal rilis konten Anda secara offline-first.
            </p>
          </div>
          
          {/* Progress Card widget */}
          <div className="glass-panel border border-slate-800/60 p-5 rounded-xl shrink-0 w-full md:w-56 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Progress Publikasi</span>
            <div className="relative flex items-center justify-center">
              {/* Semi circular SVG circle progression */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="36" stroke="url(#gradient-progress)" strokeWidth="8" fill="transparent" 
                  strokeDasharray={226}
                  strokeDashoffset={226 - (226 * progressRate) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-bold font-display text-white">{progressRate}%</span>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Selesai</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{published} dari {total} Konten Live</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl border glass-panel transition duration-300 hover:scale-[1.01] hover:border-slate-700/60`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{card.label}</span>
                  <h3 className="text-3xl font-display font-bold text-white mt-1.5">{card.value}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{card.desc}</p>
                </div>
                <div className={`p-3 rounded-xl border ${card.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analysis Section (Charts & Upcoming) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Recharts Distributions */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Breakdown BarChart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col h-[340px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-display font-bold text-sm tracking-wide">Status Distribusi</h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">Semua Konten</span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontFamily: 'Inter', fontSize: '12px' }}
                    itemStyle={{ color: '#fff', fontFamily: 'Inter', fontSize: '13px' }}
                  />
                  <Bar dataKey="jumlah" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution PieChart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col h-[340px]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-display font-bold text-sm tracking-wide">Distribusi Platform</h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">Aktif</span>
            </div>
            
            {platformChartData.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center min-h-0">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={platformChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {platformChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontFamily: 'Inter', fontSize: '13px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend to make it extra aesthetic */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2 px-4">
                  {platformChartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-[11px] text-slate-400 font-semibold">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
                <AlertCircle className="w-7 h-7 text-slate-600 mb-2" />
                <span>Belum ada data distribusi platform.</span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming content in 7 days list */}
        <div className="xl:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col h-[340px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-display font-bold text-sm tracking-wide">Rilis Konten Terdekat</h3>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">7 Hari Depan</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {upcomingContents.map((item) => {
              const platformCfg = PLATFORM_CONFIGS[item.platform];
              const statusCfg = STATUS_CONFIGS[item.status];
              
              // Formatting dates nicely
              const scheduledStr = new Date(item.scheduledDate).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div 
                  key={item.id} 
                  onClick={() => openViewModal(item)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/20 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/40 transition cursor-pointer group"
                >
                  {/* Thumbnail / Platform Placeholder */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center bg-slate-900">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: platformCfg.color }} />
                    )}
                  </div>

                  {/* Title & Platform Tag */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-200 font-sans text-xs font-semibold truncate group-hover:text-indigo-400 transition">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span 
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wide"
                        style={{ backgroundColor: platformCfg.bgColor, color: platformCfg.textColor }}
                      >
                        {platformCfg.label}
                      </span>
                      <span 
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold text-slate-400 bg-slate-800/60"
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled date */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-indigo-400 font-bold block">{scheduledStr}</span>
                    <span className="text-[8px] text-slate-500 font-semibold block uppercase">Target</span>
                  </div>
                </div>
              );
            })}

            {upcomingContents.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8 text-center">
                <Calendar className="w-7 h-7 text-slate-600 mb-2" />
                <span>Tidak ada jadwal konten rilis terdekat.</span>
                <p className="text-[10px] text-slate-600 mt-1 max-w-[180px]">Mulai tambahkan konten baru lewat tombol di atas.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default DashboardView;
