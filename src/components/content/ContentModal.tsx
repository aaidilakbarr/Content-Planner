import React, { useState, useEffect, useRef } from 'react';
import { useContentStore } from '../../store/contentStore';
import { db } from '../../lib/db';
import { PLATFORM_CONFIGS, STATUS_CONFIGS } from '../../lib/constants';
import type { ContentPlatform, ContentStatus, ContentItem } from '../../types/content';
import {
  X,
  Calendar,
  Tag,
  Image as ImageIcon,
  Trash2,
  Save,
  Eye,
  Plus,
  TrendingUp
} from 'lucide-react';


export const ContentModal: React.FC = () => {
  const { isModalOpen, modalMode, selectedItem, closeModal } = useContentStore();

  // Local form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<ContentPlatform>('instagram');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);

  // KPI & Pilar Konten states
  const [pillar, setPillar] = useState<'Edukasi' | 'Hiburan' | 'Promosi' | 'Personal' | 'Lainnya'>('Lainnya');
  const [targetViews, setTargetViews] = useState<string>('');
  const [targetLikes, setTargetLikes] = useState<string>('');
  const [actualViews, setActualViews] = useState<string>('');
  const [actualLikes, setActualLikes] = useState<string>('');

  // Tag input temp state
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when selectedItem or modalMode changes
  useEffect(() => {
    if (isModalOpen) {
      if (selectedItem) {
        setTitle(selectedItem.title || '');
        setDescription(selectedItem.description || '');
        setPlatform(selectedItem.platform || 'instagram');
        setStatus(selectedItem.status || 'draft');
        setScheduledDate(selectedItem.scheduledDate || new Date().toISOString().split('T')[0]);
        setPublishedDate(selectedItem.publishedDate || '');
        setNotes(selectedItem.notes || '');
        setThumbnail(selectedItem.thumbnail);
        setTags(selectedItem.tags || []);
        setPillar(selectedItem.pillar || 'Lainnya');
        setTargetViews(selectedItem.targetViews !== undefined ? String(selectedItem.targetViews) : '');
        setTargetLikes(selectedItem.targetLikes !== undefined ? String(selectedItem.targetLikes) : '');
        setActualViews(selectedItem.actualViews !== undefined ? String(selectedItem.actualViews) : '');
        setActualLikes(selectedItem.actualLikes !== undefined ? String(selectedItem.actualLikes) : '');
      } else {
        // Reset form for "create" mode
        setTitle('');
        setDescription('');
        setPlatform('instagram');
        setStatus('draft');
        setScheduledDate(new Date().toISOString().split('T')[0]);
        setPublishedDate('');
        setNotes('');
        setThumbnail(undefined);
        setTags([]);
        setPillar('Lainnya');
        setTargetViews('');
        setTargetLikes('');
        setActualViews('');
        setActualLikes('');
      }
    }
  }, [isModalOpen, selectedItem, modalMode]);

  if (!isModalOpen) return null;

  // Handle adding tag
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  // Handle image upload & base64 conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (limit to ~2MB for IndexedDB performance)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar! Harap pilih gambar di bawah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem || !selectedItem.id) return;
    if (window.confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
      try {
        await db.contents.delete(selectedItem.id);
        closeModal();
      } catch (err) {
        console.error('Failed to delete content:', err);
      }
    }
  };

  // Handle Submit / Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul konten wajib diisi!');
      return;
    }

    const nowIso = new Date().toISOString();
    const payload: Omit<ContentItem, 'id'> = {
      title: title.trim(),
      description: description.trim(),
      platform,
      status,
      scheduledDate,
      publishedDate: status === 'published' ? (publishedDate || new Date().toISOString().split('T')[0]) : undefined,
      tags,
      thumbnail,
      notes: notes.trim(),
      createdAt: selectedItem?.createdAt || nowIso,
      updatedAt: nowIso,
      pillar,
      targetViews: targetViews.trim() !== '' ? Number(targetViews) : undefined,
      targetLikes: targetLikes.trim() !== '' ? Number(targetLikes) : undefined,
      actualViews: actualViews.trim() !== '' ? Number(actualViews) : undefined,
      actualLikes: actualLikes.trim() !== '' ? Number(actualLikes) : undefined
    };

    try {
      if (modalMode === 'create') {
        await db.contents.add(payload as ContentItem);
      } else if (modalMode === 'edit' && selectedItem?.id) {
        await db.contents.update(selectedItem.id, payload);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save content:', err);
      alert('Gagal menyimpan konten ke database.');
    }
  };

  const isViewMode = modalMode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={closeModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${isViewMode ? 'from-emerald-400 to-teal-400' : modalMode === 'edit' ? 'from-amber-400 to-orange-400' : 'from-indigo-500 to-purple-500'
              }`} />
            <h3 className="text-slate-100 font-display font-bold text-lg">
              {isViewMode ? 'Detail Konten' : modalMode === 'edit' ? 'Edit Rencana Konten' : 'Buat Rencana Baru'}
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-100 bg-slate-800/40 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Left Column (Main Data) */}
            <div className="md:col-span-7 space-y-5">
              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Judul Rencana Konten</label>
                {isViewMode ? (
                  <h2 className="text-xl font-bold text-slate-100 tracking-wide bg-slate-950/20 p-3 rounded-xl border border-slate-800/50">{title}</h2>
                ) : (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: 5 Tren Web Development di Tahun 2026..."
                    className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-all placeholder-slate-500"
                    required
                  />
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Deskripsi / Brief Singkat</label>
                {isViewMode ? (
                  <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-slate-800/50 whitespace-pre-line min-h-[100px]">
                    {description || <span className="text-slate-650 italic">Tidak ada deskripsi.</span>}
                  </div>
                ) : (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan brief konten, sasaran audiens, atau poin-poin utama tulisan/video..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-all placeholder-slate-500 resize-y"
                  />
                )}
              </div>

              {/* Flex Grid for Platform & Status */}
              <div className="grid grid-cols-2 gap-4">
                {/* Platform select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Platform</label>
                  {isViewMode ? (
                    <div
                      className="px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 justify-center"
                      style={{
                        borderColor: PLATFORM_CONFIGS[platform].color + '30',
                        backgroundColor: PLATFORM_CONFIGS[platform].bgColor,
                        color: PLATFORM_CONFIGS[platform].textColor
                      }}
                    >
                      <span className="capitalize">{PLATFORM_CONFIGS[platform].label}</span>
                    </div>
                  ) : (
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                      className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-xl text-sm text-slate-200 focus:outline-none transition-all"
                    >
                      {Object.values(PLATFORM_CONFIGS).map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Status select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Status</label>
                  {isViewMode ? (
                    <div
                      className="px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 justify-center"
                      style={{
                        borderColor: STATUS_CONFIGS[status].color + '30',
                        backgroundColor: STATUS_CONFIGS[status].bgColor,
                        color: STATUS_CONFIGS[status].textColor
                      }}
                    >
                      <span>{STATUS_CONFIGS[status].label}</span>
                    </div>
                  ) : (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ContentStatus)}
                      className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-xl text-sm text-slate-200 focus:outline-none transition-all"
                    >
                      {Object.entries(STATUS_CONFIGS).map(([key, value]) => (
                        <option key={key} value={key} className="bg-slate-900 text-slate-200">
                          {value.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Pilar Konten select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Pilar Konten (Content Pillar)</label>
                {isViewMode ? (
                  <div className="px-4 py-3 rounded-xl border border-slate-800 text-sm font-semibold text-slate-200 bg-slate-950/20">
                    <span>{pillar}</span>
                  </div>
                ) : (
                  <select
                    value={pillar}
                    onChange={(e) => setPillar(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-xl text-sm text-slate-200 focus:outline-none transition-all"
                  >
                    {['Edukasi', 'Hiburan', 'Promosi', 'Personal', 'Lainnya'].map((p) => (
                      <option key={p} value={p} className="bg-slate-900 text-slate-200">
                        {p}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Catatan / Ide Pendukung</label>
                {isViewMode ? (
                  <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-slate-800/50 whitespace-pre-line min-h-[70px]">
                    {notes || <span className="text-slate-650 italic">Tidak ada catatan tambahan.</span>}
                  </div>
                ) : (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Referensi riset, link pendukung, script suara, dsb..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-all placeholder-slate-500 resize-y"
                  />
                )}
              </div>
            </div>

            {/* Right Column (Meta & Media) */}
            <div className="md:col-span-5 space-y-5">

              {/* Media Thumbnail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Cover Thumbnail</label>
                <div className="relative group/thumb rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800 min-h-[176px] flex flex-col items-center justify-center transition-all">
                  {thumbnail ? (
                    <>
                      <img
                        src={thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-44 object-cover"
                      />
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={handleRemoveThumbnail}
                          className="absolute top-2 right-2 bg-rose-600/90 text-white p-1.5 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                      <div className="text-xs text-slate-500">
                        {isViewMode ? (
                          <span className="italic">Tidak ada thumbnail</span>
                        ) : (
                          <>
                            <p className="font-medium text-slate-400">Pilih gambar visual utama</p>
                            <p className="mt-1 text-[10px]">Format JPG, PNG (Max 2MB)</p>
                          </>
                        )}
                      </div>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pilih File</span>
                        </button>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 bg-slate-950/20 p-4 border border-slate-800/60 rounded-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Jadwal Tayang</span>
                  </div>
                  {isViewMode ? (
                    <p className="text-sm font-medium text-slate-200 px-1 py-1">{scheduledDate}</p>
                  ) : (
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    />
                  )}
                </div>

                {status === 'published' && (
                  <div className="space-y-1 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tanggal Terbit</span>
                    </div>
                    {isViewMode ? (
                      <p className="text-sm font-medium text-slate-200 px-1 py-1">{publishedDate || scheduledDate}</p>
                    ) : (
                      <input
                        type="date"
                        value={publishedDate}
                        onChange={(e) => setPublishedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* KPI & Target Performa */}
              <div className="space-y-3 bg-slate-950/20 p-4 border border-slate-800/60 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target vs Hasil Performa</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Target Views</label>
                    {isViewMode ? (
                      <p className="text-sm font-medium text-slate-200">{targetViews || '-'}</p>
                    ) : (
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={targetViews}
                        onChange={(e) => setTargetViews(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Target Likes</label>
                    {isViewMode ? (
                      <p className="text-sm font-medium text-slate-200">{targetLikes || '-'}</p>
                    ) : (
                      <input
                        type="number"
                        placeholder="e.g. 300"
                        value={targetLikes}
                        onChange={(e) => setTargetLikes(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      />
                    )}
                  </div>
                </div>

                {(status === 'published' || actualViews || actualLikes) && (
                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-800/60">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Actual Views</label>
                      {isViewMode ? (
                        <p className="text-sm font-medium text-slate-200">{actualViews || '-'}</p>
                      ) : (
                        <input
                          type="number"
                          placeholder="e.g. 5420"
                          value={actualViews}
                          onChange={(e) => setActualViews(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Actual Likes</label>
                      {isViewMode ? (
                        <p className="text-sm font-medium text-slate-200">{actualLikes || '-'}</p>
                      ) : (
                        <input
                          type="number"
                          placeholder="e.g. 340"
                          value={actualLikes}
                          onChange={(e) => setActualLikes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kategori / Tags</span>
                </label>

                {/* Chip container */}
                <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-slate-950/20 border border-slate-800/80 rounded-xl">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 text-xs font-medium rounded-full"
                    >
                      <span>#{tag}</span>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(i)}
                          className="hover:bg-indigo-900/50 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3 text-indigo-400 hover:text-indigo-200" />
                        </button>
                      )}
                    </span>
                  ))}
                  {tags.length === 0 && <span className="text-xs text-slate-600 italic self-center px-1">Belum ada tag</span>}
                </div>

                {!isViewMode && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Ketik tag lalu tekan Enter..."
                    className="w-full px-3.5 py-2.5 bg-slate-950/30 border border-slate-800 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 rounded-xl text-xs text-slate-100 focus:outline-none transition-all placeholder-slate-500"
                  />
                )}
              </div>

            </div>

          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div>
            {/* Delete button (only for Edit/View mode) */}
            {modalMode !== 'create' && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800/50 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 text-sm font-semibold rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Konten</span>
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
            >
              Batal
            </button>

            {/* Save / Edit Toggle button */}
            {isViewMode ? (
              <button
                type="button"
                onClick={() => useContentStore.setState({ modalMode: 'edit' })}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                <Eye className="w-4 h-4" />
                <span>Edit Konten</span>
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Rencana</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default ContentModal;
