import React, { useEffect } from 'react';
import { useContentStore } from './store/contentStore';
import { seedDatabaseIfEmpty } from './lib/db';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ContentModal from './components/content/ContentModal';
import DashboardView from './pages/DashboardView';
import KanbanView from './pages/KanbanView';
import CalendarView from './pages/CalendarView';
import ListView from './pages/ListView';

export const App: React.FC = () => {
  const { activeView, theme, isModalOpen, selectedItem } = useContentStore();

  // Seed database with beautiful starter data on initial loading
  useEffect(() => {
    seedDatabaseIfEmpty();
  }, []);

  // Sync light/dark class on document HTML tag
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'kanban':
        return <KanbanView />;
      case 'calendar':
        return <CalendarView />;
      case 'list':
        return <ListView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex select-none relative overflow-hidden">
      {/* Decorative background glow blobs for glassmorphism */}
      <div className="absolute top-[10%] left-[20%] w-[380px] h-[380px] bg-indigo-500/8 dark:bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[10%] w-[420px] h-[420px] bg-purple-500/8 dark:bg-purple-500/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[60%] left-[5%] w-[320px] h-[320px] bg-teal-500/4 dark:bg-teal-500/6 rounded-full blur-[90px] pointer-events-none z-0" />

      {/* Sidebar - fixed left panel */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div
        className="flex-grow flex flex-col min-h-screen pl-64 transition-all duration-300 relative z-10"
      >
        {/* Navbar Header - fixed top */}
        <Navbar />

        {/* Dynamic Scrollable Page Content */}
        <main className="flex-grow pt-28 pb-12 px-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global CRUD Modal */}
      {isModalOpen && <ContentModal key={selectedItem?.id ?? (selectedItem?.scheduledDate ? `new-${selectedItem.scheduledDate}` : 'new')} />}
    </div>
  );
};

export default App;
