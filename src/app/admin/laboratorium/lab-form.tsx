'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createLabAction, updateLabAction } from '@/app/actions/admin';
import { ArrowLeft, Save, Sparkles, CheckCircle2 } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

interface EducationLevelOption {
  id: string;
  name: string;
}

interface LabFormProps {
  categories: CategoryOption[];
  educationLevels: EducationLevelOption[];
  initialData?: any;
  isEdit?: boolean;
}

export function LabForm({
  categories,
  educationLevels,
  initialData,
  isEdit = false,
}: LabFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Auto-generate slug from title if adding new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    try {
      let res;
      if (isEdit) {
        res = await updateLabAction(initialData.id, null, formData);
      } else {
        res = await createLabAction(null, formData);
      }

      if (res?.error) {
        setErrorMessage(res.error);
        setIsPending(false);
      }
    } catch (err: any) {
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage(err.message || 'Gagal menyimpan data laboratorium.');
        setIsPending(false);
      }
    }
  };

  let objectivesText = '';
  if (initialData?.learningObjectives) {
    try {
      const parsed = JSON.parse(initialData.learningObjectives);
      objectivesText = Array.isArray(parsed) ? parsed.join('\n') : initialData.learningObjectives;
    } catch {
      objectivesText = initialData.learningObjectives;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/laboratorium"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Laboratorium</span>
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEdit ? 'Edit Laboratorium Virtual' : 'Tambah Laboratorium Virtual Baru'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi informasi modul pembelajaran, kategori, petunjuk eksperimen, dan konfigurasi simulasi.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Laboratorium *
              </label>
              <input
                type="text"
                name="title"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Lab Rasio dan Proporsi Matematika"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Slug URL Unik *
              </label>
              <input
                type="text"
                name="slug"
                required
                readOnly={isEdit}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="lab-rasio-matematika"
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs outline-none ${
                  isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-200 focus:border-brand-500'
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Akan diakses melalui /laboratorium/{slug || '...'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Mata Pelajaran *
              </label>
              <input
                type="text"
                name="subject"
                required
                defaultValue={initialData?.subject || 'Matematika'}
                placeholder="Contoh: Matematika, Fisika, Informatika"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kategori *
              </label>
              <select
                name="categoryId"
                required
                defaultValue={initialData?.categoryId || categories[0]?.id}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Jenjang Pendidikan *
              </label>
              <select
                name="educationLevelId"
                required
                defaultValue={initialData?.educationLevelId || educationLevels[0]?.id}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                {educationLevels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tipe Pengalaman Simulasi *
              </label>
              <select
                name="simulationType"
                defaultValue={initialData?.simulationType || 'WEB_INTERACTIVE'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="WEB_INTERACTIVE">Web Interaktif</option>
                <option value="TWO_D">Simulasi 2D</option>
                <option value="THREE_D">Simulasi 3D (WebGL / Three.js)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tingkat Kesulitan *
              </label>
              <select
                name="difficulty"
                defaultValue={initialData?.difficulty || 'BEGINNER'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="BEGINNER">Pemula (Beginner)</option>
                <option value="INTERMEDIATE">Menengah (Intermediate)</option>
                <option value="ADVANCED">Lanjutan (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Estimasi Durasi (Menit) *
              </label>
              <input
                type="number"
                name="duration"
                required
                min={5}
                max={300}
                defaultValue={initialData?.duration || 35}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                name="thumbnail"
                defaultValue={initialData?.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Deskripsi Singkat (Ringkasan Katalog) *
              </label>
              <textarea
                name="shortDescription"
                required
                rows={2}
                defaultValue={initialData?.shortDescription || ''}
                placeholder="Ringkasan 1-2 kalimat untuk kartu laboratorium..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Deskripsi Lengkap / Teori Pengantar *
              </label>
              <textarea
                name="fullDescription"
                required
                rows={4}
                defaultValue={initialData?.fullDescription || ''}
                placeholder="Uraian konsep sains atau materi laboratorium..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tujuan Pembelajaran (Satu baris per tujuan) *
              </label>
              <textarea
                name="learningObjectives"
                required
                rows={3}
                defaultValue={objectivesText || 'Memahami konsep dasar materi.\nMenganalisis eksperimen visual.\nMenerapkan solusi praktis.'}
                placeholder="Pisahkan setiap tujuan dengan baris baru (Enter)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none font-mono text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Materi Prasyarat
              </label>
              <input
                type="text"
                name="prerequisites"
                defaultValue={initialData?.prerequisites || ''}
                placeholder="Contoh: Operasi perkalian dasar, konsep biner..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Petunjuk Penggunaan &amp; Langkah Eksperimen *
              </label>
              <textarea
                name="instructions"
                required
                rows={4}
                defaultValue={initialData?.instructions || '1. Amati tampilan kanvas.\n2. Gerakkan kontrol slider.\n3. Catat hasil pengamatan.'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Status & Featured Flags */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Status Publikasi *
                </label>
                <select
                  name="status"
                  defaultValue={initialData?.status || 'PUBLISHED'}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold outline-none"
                >
                  <option value="DRAFT">Draft (Disembunyikan)</option>
                  <option value="PUBLISHED">Published (Publik)</option>
                  <option value="ARCHIVED">Archived (Diarsipkan)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 pt-5">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={initialData?.featured || false}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <span>Tandai sebagai Laboratorium Unggulan (Featured)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/laboratorium"
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isPending ? 'Menyimpan...' : 'Simpan Laboratorium'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
