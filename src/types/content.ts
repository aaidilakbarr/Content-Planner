export type ContentPlatform = 'instagram' | 'youtube' | 'tiktok' | 'blog' | 'twitter';

export type ContentStatus = 'draft' | 'in_progress' | 'scheduled' | 'published' | 'cancelled';

export interface ContentItem {
  id?: number; // Primary key for Dexie auto-increment
  title: string;
  description: string;
  platform: ContentPlatform;
  status: ContentStatus;
  scheduledDate: string; // ISO String (YYYY-MM-DD)
  publishedDate?: string; // ISO String (YYYY-MM-DD)
  tags: string[];
  thumbnail?: string; // base64 string
  notes?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String

  // KPI & Pilar Konten fields
  pillar?: 'Edukasi' | 'Hiburan' | 'Promosi' | 'Personal' | 'Lainnya';
  targetViews?: number;
  targetLikes?: number;
  actualViews?: number;
  actualLikes?: number;
}

export interface PlatformConfig {
  id: ContentPlatform;
  label: string;
  color: string; // Tailwind color class or hex
  bgColor: string; // HSL tailored background
  textColor: string;
  iconName: string;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<ContentStatus, number>;
  byPlatform: Record<ContentPlatform, number>;
  progressRate: number; // percentage of published vs total
}
