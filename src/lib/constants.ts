import type { ContentPlatform, ContentStatus, PlatformConfig } from '../types/content';


export const PLATFORM_CONFIGS: Record<ContentPlatform, PlatformConfig> = {
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    color: '#e1306c',
    bgColor: 'rgba(225, 48, 108, 0.12)',
    textColor: '#f43f5e',
    iconName: 'Instagram'
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    textColor: '#f87171',
    iconName: 'Youtube'
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok',
    color: '#00f2fe',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    textColor: '#22d3ee',
    iconName: 'Music2'
  },
  blog: {
    id: 'blog',
    label: 'Blog / Website',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    textColor: '#fb923c',
    iconName: 'FileText'
  },
  twitter: {
    id: 'twitter',
    label: 'X / Twitter',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    textColor: '#7dd3fc',
    iconName: 'Twitter'
  }
};

export const STATUS_CONFIGS: Record<ContentStatus, { label: string; color: string; bgColor: string; textColor: string }> = {
  draft: {
    label: 'Draft',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.1)',
    textColor: '#cbd5e1'
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    textColor: '#fcd34d'
  },
  scheduled: {
    label: 'Scheduled',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    textColor: '#93c5fd'
  },
  published: {
    label: 'Published',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    textColor: '#6ee7b7'
  },
  cancelled: {
    label: 'Cancelled',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    textColor: '#f87171'
  }
};
