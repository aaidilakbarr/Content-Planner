import Dexie, { type Table } from 'dexie';
import type { ContentItem } from '../types/content';

export class ContentPlannerDatabase extends Dexie {
  contents!: Table<ContentItem>;

  constructor() {
    super('ContentPlannerDatabase');
    this.version(1).stores({
      contents: '++id, title, platform, status, scheduledDate, createdAt, *tags'
    });
  }
}

export const db = new ContentPlannerDatabase();

// Seed data function to populate with some beautiful starter contents if database is empty
export async function seedDatabaseIfEmpty() {
  const count = await db.contents.count();
  if (count > 0) return;

  const now = new Date();
  
  const formatDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(now.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const starterContents: ContentItem[] = [
    {
      title: '10 Tips Sukses Belajar Coding Mandiri',
      description: 'Panduan lengkap bagi pemula untuk belajar web development secara otodidak, mencakup cara membuat roadmap belajar dan menjaga konsistensi.',
      platform: 'blog',
      status: 'published',
      scheduledDate: formatDate(-3),
      publishedDate: formatDate(-3),
      tags: ['coding', 'webdev', 'pemula'],
      notes: 'Artikel ini sudah publish di blog utama. Share link ke Twitter/Instagram nanti.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pillar: 'Edukasi'
    },
    {
      title: 'A Day in the Life of a Software Engineer in Jakarta',
      description: 'Vlog aesthetic tentang keseharian kerja jarak jauh (WFH) sebagai software engineer, lengkap dengan setup meja kerja dan tips produktivitas.',
      platform: 'youtube',
      status: 'scheduled',
      scheduledDate: formatDate(2),
      tags: ['wfh', 'vlog', 'programmer'],
      notes: 'Edit video sudah 80%. Butuh bikin thumbnail yang lebih eye-catching.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pillar: 'Personal'
    },
    {
      title: 'Kenapa CSS Grid Lebih Baik dari Flexbox? (Dalam 60 Detik)',
      description: 'Video edukasi singkat yang menunjukkan perbandingan nyata kapan harus menggunakan Flexbox dan kapan Grid secara visual.',
      platform: 'tiktok',
      status: 'in_progress',
      scheduledDate: formatDate(1),
      tags: ['css', 'frontend', 'tips'],
      notes: 'Siapkan script suara dan rekam layar vscode.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pillar: 'Edukasi'
    },
    {
      title: 'My Complete Developer Setup 2026 🚀',
      description: 'Carousel post menampilkan detail spesifikasi PC, keyboard mechanical, monitor, VSCode theme, dan alat-alat produktivitas kerja.',
      platform: 'instagram',
      status: 'draft',
      scheduledDate: formatDate(4),
      tags: ['setup', 'desksetup', 'productivity'],
      notes: 'Kumpulkan foto aesthetic dari setup meja di siang hari.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pillar: 'Promosi'
    },
    {
      title: 'Membangun Aplikasi Offline-First dengan Dexie.js',
      description: 'Thread mendalam di Twitter menjelaskan cara mengintegrasikan Dexie.js ke dalam aplikasi React + Vite untuk penyimpanan offline super cepat.',
      platform: 'twitter',
      status: 'draft',
      scheduledDate: formatDate(5),
      tags: ['javascript', 'react', 'indexeddb'],
      notes: 'Buat penjelasan visual alur IndexedDB.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pillar: 'Edukasi'
    },
    {
      title: 'Desain Glassmorphism dengan Tailwind CSS v4',
      description: 'Video pendek tips coding membuat layout dashboard futuristik transparan dengan blur filter kelas dunia.',
      platform: 'tiktok',
      status: 'published',
      scheduledDate: formatDate(-1),
      publishedDate: formatDate(-1),
      tags: ['tailwind', 'css', 'design'],
      notes: 'Sangat ramai di kolom komentar. Jawab beberapa pertanyaan teknis.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pillar: 'Hiburan'
    },
    {
      title: 'Strategi Konsisten Konten untuk Developer 2026',
      description: 'Berbagi tips bagaimana membagi waktu antara menulis kode produksi dan membuat aset konten berkualitas.',
      platform: 'instagram',
      status: 'published',
      scheduledDate: formatDate(-2),
      publishedDate: formatDate(-2),
      tags: ['creator', 'developer', 'tips'],
      notes: 'Postingan slide edukasi carousel.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pillar: 'Personal'
    }
  ];

  await db.contents.bulkAdd(starterContents);
  console.log('Starter contents successfully seeded to IndexedDB.');
}
