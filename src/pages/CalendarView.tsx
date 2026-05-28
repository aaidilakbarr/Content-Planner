import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useContentStore } from '../store/contentStore';
import { PLATFORM_CONFIGS, STATUS_CONFIGS } from '../lib/constants';
import type { ContentItem } from '../types/content';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus
} from 'lucide-react';


export const CalendarView: React.FC = () => {
  const { searchQuery, filterPlatform, openCreateModal, openEditModal } = useContentStore();
  
  // Navigation states
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Database query
  const contents = useLiveQuery(() => db.contents.toArray()) ?? [];

  // Filter content items based on search and filters
  const filteredContents = contents.filter(item => {
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    
    return matchesSearch && matchesPlatform;
  });

  // Date manipulation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate days in the calendar grid (Month View)
  const getCalendarDays = () => {
    // Offset for starting week on Monday (1) instead of Sunday (0)
    // 0: Minggu, 1: Senin, 2: Selasa, ... 6: Sabtu
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    let startDayOfWeek = firstDayOfMonth.getDay();
    // Adjust Sunday (0) to 7, so Monday is 1, Sunday is 7
    startDayOfWeek = startDayOfWeek === 0 ? 7 : startDayOfWeek;
    
    const offsetDays = startDayOfWeek - 1; // Number of days from prev month to show
    
    const days: Date[] = [];
    
    // Fill previous month padding days
    for (let i = offsetDays; i > 0; i--) {
      days.push(new Date(currentYear, currentMonth, 1 - i));
    }
    
    // Fill current month days
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    // Fill next month padding days to make grid full multiple of 7
    const gridTotalCells = 42; // standard 6 rows
    const remainingCells = gridTotalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(new Date(currentYear, currentMonth + 1, i));
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  // Month string in Indonesian
  const monthName = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  });

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(item.id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const itemIdStr = e.dataTransfer.getData('text/plain');
    const itemId = Number(itemIdStr);
    
    if (isNaN(itemId)) return;

    const formattedTargetDate = targetDate.toISOString().split('T')[0];

    try {
      await db.contents.update(itemId, {
        scheduledDate: formattedTargetDate,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to reschedule content in calendar:', err);
    }
  };

  const handleQuickAdd = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    openCreateModal(formattedDate);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Calendar Header Navigations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl text-slate-100 tracking-wide">Jadwal Kalender Konten</h1>
            <span className="text-[10px] bg-slate-800 text-indigo-400 border border-slate-700/80 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">Visual Planner</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Klik tanggal kosong untuk quick-add rencana konten, atau seret item ke tanggal lain untuk menjadwalkan ulang.
          </p>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-1.5 rounded-xl self-start sm:self-center shrink-0">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-800 hover:text-slate-100 rounded-lg text-slate-400 transition"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleToday}
            className="px-3 py-1.5 hover:bg-slate-800 hover:text-slate-100 rounded-lg text-xs font-semibold text-slate-300 transition"
          >
            Hari Ini
          </button>

          <span className="px-4 text-xs font-bold text-slate-200 min-w-[120px] text-center font-display uppercase tracking-wider">
            {monthName}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-800 hover:text-slate-100 rounded-lg text-slate-400 transition"
            title="Bulan Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Sheet */}
      <div className="rounded-2xl border border-slate-800/80 glass-panel overflow-hidden flex flex-col">
        {/* Week Days Headers */}
        <div className="grid grid-cols-7 border-b border-slate-850/80 bg-slate-900/40 text-center shrink-0 py-3">
          {weekDays.map((wd) => (
            <span key={wd} className="text-xs font-bold text-slate-400 font-display tracking-wider uppercase">
              {wd.slice(0, 3)}
            </span>
          ))}
        </div>

        {/* Days grid cells */}
        <div className="grid grid-cols-7 grid-rows-6 bg-slate-950/20 divide-x divide-y divide-slate-850/40 border-t border-slate-850/40">
          {calendarDays.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayContents = filteredContents.filter(item => item.scheduledDate === dateStr);
            
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={`min-h-[110px] p-2 flex flex-col group relative transition duration-300 hover:bg-slate-900/20 ${
                  isCurrentMonth ? 'text-slate-100' : 'text-slate-650 bg-slate-950/40 opacity-30'
                }`}
              >
                {/* Day Header row */}
                <div className="flex justify-between items-center mb-1.5">
                  <span 
                    className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full ${
                      isToday 
                        ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 text-glow' 
                        : isCurrentMonth ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {/* Hover Quick Add icon */}
                  {isCurrentMonth && (
                    <button
                      onClick={() => handleQuickAdd(day)}
                      className="text-slate-600 hover:text-slate-100 hover:bg-slate-800 p-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-200"
                      title="Quick Add Rencana"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Day Content Event stack */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
                  {dayContents.map((item) => {
                    const pCfg = PLATFORM_CONFIGS[item.platform];
                    const sCfg = STATUS_CONFIGS[item.status];
                    
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        className="text-[10px] font-sans font-semibold p-1 px-1.5 rounded border leading-tight truncate cursor-grab active:cursor-grabbing hover:translate-x-0.5 hover:shadow transition duration-200"
                        style={{ 
                          borderColor: pCfg.color + '25', 
                          backgroundColor: pCfg.bgColor,
                          color: pCfg.textColor 
                        }}
                        title={`${pCfg.label}: ${item.title} (${sCfg.label})`}
                      >
                        <span className="font-extrabold uppercase mr-1 text-[8px]" style={{ color: pCfg.color }}>
                          {item.platform.slice(0, 2)}
                        </span>
                        {item.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CalendarView;
