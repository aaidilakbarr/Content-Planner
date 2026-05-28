import { create } from 'zustand';
import type { ContentPlatform, ContentStatus, ContentItem } from '../types/content';

export type AppView = 'dashboard' | 'kanban' | 'calendar' | 'list';

interface ContentStoreState {
  // UI views
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPlatform: ContentPlatform | 'all';
  setFilterPlatform: (platform: ContentPlatform | 'all') => void;
  filterStatus: ContentStatus | 'all';
  setFilterStatus: (status: ContentStatus | 'all') => void;

  // Edit / Add Modal State
  isModalOpen: boolean;
  modalMode: 'create' | 'edit' | 'view';
  selectedItem: ContentItem | null;
  openCreateModal: (defaultDate?: string) => void;
  openEditModal: (item: ContentItem) => void;
  openViewModal: (item: ContentItem) => void;
  closeModal: () => void;

  // Theme preferences
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useContentStore = create<ContentStoreState>((set) => ({
  // UI views
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  // Filters
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterPlatform: 'all',
  setFilterPlatform: (platform) => set({ filterPlatform: platform }),
  filterStatus: 'all',
  setFilterStatus: (status) => set({ filterStatus: status }),

  // Edit / Add Modal State
  isModalOpen: false,
  modalMode: 'create',
  selectedItem: null,
  
  openCreateModal: (defaultDate) => set({
    isModalOpen: true,
    modalMode: 'create',
    selectedItem: defaultDate ? {
      title: '',
      description: '',
      platform: 'instagram',
      status: 'draft',
      scheduledDate: defaultDate,
      tags: [],
      notes: '',
      createdAt: '',
      updatedAt: ''
    } : null
  }),

  openEditModal: (item) => set({
    isModalOpen: true,
    modalMode: 'edit',
    selectedItem: item
  }),

  openViewModal: (item) => set({
    isModalOpen: true,
    modalMode: 'view',
    selectedItem: item
  }),

  closeModal: () => set({
    isModalOpen: false,
    selectedItem: null
  }),

  // Theme management
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    return { theme: nextTheme };
  })
}));
export default useContentStore;

