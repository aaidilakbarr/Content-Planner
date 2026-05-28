import React, { useState } from 'react';
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
  Cell,
  Legend
} from 'recharts';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  AlertCircle,
  Target,
  Settings,
  PieChart as PieIcon
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { openViewModal } = useContentStore();

  // Query live data from IndexedDB
  const contents = useLiveQuery(() => db.contents.toArray()) ?? [];

  // Local storage for weekly publication targets
  const [targets, setTargets] = useState<Record<ContentPlatform, number>>(() => {
    const saved = localStorage.getItem('weekly_publication_targets');
    return saved ? JSON.parse(saved) : { instagram: 3, youtube: 1, tiktok: 2, blog: 1, twitter: 2 };
  });
  const [isEditingTargets, setIsEditingTargets] = useState(false);

  const saveTarget = (platform: ContentPlatform, val: number) => {
    const newTargets = { ...targets, [platform]: Math.max(0, val) };
    setTargets(newTargets);
    localStorage.setItem('weekly_publication_targets', JSON.stringify(newTargets));
  };

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

  const platformPublishedCounts = contents.reduce((acc, item) => {
    if (item.status === 'published') {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
    }
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

  // Prepare chart data: KPI Target vs Actual Views
  const kpiChartData = contents
    .filter(item => item.status === 'published' && (item.targetViews !== undefined || item.actualViews !== undefined))
    .map(item => ({
      title: item.title.length > 20 ? item.title.slice(0, 20) + '...' : item.title,
      Target: item.targetViews || 0,
      Aktual: item.actualViews || 0
    }))
    .slice(-6); // Show last 6 published items with KPI

  // Prepare chart data: Content Pillars distribution
  const pillarCounts = contents.reduce((acc, item) => {
    const p = item.pillar || 'Lainnya';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const PILLAR_COLORS: Record<string, string> = {
    Edukasi: '#6366f1',  // Indigo
    Hiburan: '#ec4899',  // Pink
    Promosi: '#f59e0b',  // Amber
    Personal: '#10b981', // Emerald
    Lainnya: '#64748b'   // Slate
  };

  const pillarChartData = Object.entries(pillarCounts).map(([name, value]) => ({
    name,
    value,
    color: PILLAR_COLORS[name] || '#64748b'
  })).filter(item => item.value > 0);

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
      <div className="relative overflow-hidden rounded-2xl banner-gradient p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100/50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-full shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace Aktif</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-[var(--text-banner-title)] tracking-wide">
              Kelola Konten Sosial Media Lebih Visual
            </h1>
            <p className="text-sm text-slate-400 max-w-xl font-sans">
              Selamat datang di pusat perencanaan konten Anda. Gunakan kalender visual atau Kanban board untuk mengatur jadwal rilis konten Anda secara offline-first.
            </p>
          </div>
          
          {/* Progress Card widget */}
          <div className="glass-panel border border-slate-800/60 p-5 rounded-xl shrink-0 w-full md:w-56 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Progress Publikasi</span>
            <div className="relative flex items-center justify-center">
              {/* Semi circular SVG circle progression */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="36" stroke="rgba(0,0,0,0.03)" strokeWidth="8" fill="transparent" />
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
                <span className="text-xl font-bold font-display text-slate-100">{progressRate}%</span>
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
                  <h3 className="text-3xl font-display font-bold text-slate-100 mt-1.5">{card.value}</h3>
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

      {/* Target Volume Publication Progress Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h2 className="text-slate-100 font-display font-bold text-sm tracking-wide">Target Volume Publikasi Mingguan</h2>
          </div>
          <button 
            onClick={() => setIsEditingTargets(!isEditingTargets)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-350 rounded-xl transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isEditingTargets ? 'Selesai Atur' : 'Atur Target'}</span>
          </button>
        </div>

        {isEditingTargets ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-950/20 p-4 border border-slate-800/60 rounded-xl animate-fade-in-up">
            {Object.keys(PLATFORM_CONFIGS).map((key) => {
              const p = key as ContentPlatform;
              return (
                <div key={p} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_CONFIGS[p].color }} />
                    {PLATFORM_CONFIGS[p].label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targets[p]}
                    onChange={(e) => saveTarget(p, Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
            {Object.keys(PLATFORM_CONFIGS).map((key) => {
              const p = key as ContentPlatform;
              const pPub = platformPublishedCounts[p] || 0;
              const pTar = targets[p] || 1;
              const progress = Math.min(100, Math.round((pPub / pTar) * 100));
              
              return (
                <div key={p} className="bg-slate-950/10 border border-slate-850/30 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 capitalize">{PLATFORM_CONFIGS[p].label}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-950/40 px-1.5 py-0.5 rounded">
                        {pPub}/{pTar}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: PLATFORM_CONFIGS[p].color
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-wider block text-right">
                    {progress}% Target
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Analysis Section (Charts & Upcoming) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Recharts Distributions */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Breakdown BarChart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col h-[340px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-100 font-display font-bold text-sm tracking-wide">Status Distribusi</h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">Semua Konten</span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontFamily: 'Inter', fontSize: '11px' }}
                    itemStyle={{ color: '#fff', fontFamily: 'Inter', fontSize: '12px' }}
                  />
                  <Bar dataKey="jumlah" fill="#6366f1" radius={[4, 4, 0, 0]}>
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
              <h3 className="text-slate-100 font-display font-bold text-sm tracking-wide">Distribusi Platform</h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">Aktif</span>
            </div>
            
            {platformChartData.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center min-h-0">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={platformChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {platformChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontFamily: 'Inter', fontSize: '12px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend to make it extra aesthetic */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 px-2">
                  {platformChartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-[9px] text-slate-400 font-semibold">{entry.name} ({entry.value})</span>
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

          {/* Content Pillar Distribution PieChart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col h-[340px]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-slate-100 font-display font-bold text-sm tracking-wide">Pilar Konten (Category Balance)</h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">Pilar</span>
            </div>

            {pillarChartData.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center min-h-0">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pillarChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pillarChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontFamily: 'Inter', fontSize: '12px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend for Content Pillars */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 px-2">
                  {pillarChartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-[9px] text-slate-400 font-semibold">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-8 text-center">
                <PieIcon className="w-7 h-7 text-slate-650 mb-2" />
                <span>Belum ada data pilar konten.</span>
                <p className="text-[9px] text-slate-605 mt-1 max-w-[150px]">Atur Pilar Konten di modal edit rencana untuk memunculkan data.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming content in 7 days list */}
        <div className="xl:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col h-[340px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-100 font-display font-bold text-sm tracking-wide">Rilis Konten Terdekat</h3>
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

      {/* Fitur 2: Chart Performa (Target vs. Actual Metrics) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h2 className="text-slate-100 font-display font-bold text-sm tracking-wide">KPI Performa Konten: Target vs. Hasil Aktual (Penayangan)</h2>
        </div>

        {kpiChartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={kpiChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="title" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontFamily: 'Inter', fontSize: '11px' }}
                  itemStyle={{ fontFamily: 'Inter', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }} />
                <Bar dataKey="Target" fill="#818cf8" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="Aktual" fill="#34d399" radius={[4, 4, 0, 0]} opacity={0.9} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center py-6">
            <TrendingUp className="w-8 h-8 text-slate-650 mb-2.5 animate-pulse" />
            <span className="font-bold text-slate-400">Belum Ada Data KPI Performa</span>
            <p className="text-slate-500 mt-1 max-w-xs leading-normal">
              Isi data Target Views di rencana Anda, lalu ubah status ke <strong>Published</strong> dan masukkan Actual Views untuk memunculkan chart analisis.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
export default DashboardView;
