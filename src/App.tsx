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
  const { activeView, theme } = useContentStore();

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
    <div className="min-h-screen bg-bg-dark flex select-none">
      {/* Sidebar - fixed left panel */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div 
        className="flex-1 flex flex-col min-h-screen pl-64 transition-all duration-300"
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
      <ContentModal />
    </div>
  );
};

export default App;
