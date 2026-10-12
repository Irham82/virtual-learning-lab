'use client';

import React, { useState, useEffect } from 'react';
import { createCategoryAction, deleteCategoryAction } from '@/app/actions/admin';
import { Layers, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Layers');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  // We can fetch categories via a simple client load or pass initial
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createCategoryAction(null, formData);
    if (res?.error) {
      setMessage({ text: res.error, isError: true });
    } else {
      setMessage({ text: 'Kategori berhasil ditambahkan!', isError: false });
      setName('');
      setSlug('');
      setDescription('');
      // Refresh list
      fetch('/api/admin/categories')
        .then((r) => r.json())
        .then((d) => setCategories(d));
    }
    setLoading(false);
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!confirm(`Hapus kategori "${catName}"?`)) return;
    const res = await deleteCategoryAction(catId);
    if (res?.success) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Manajemen Kategori Laboratorium
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola bidang studi dan kategori mata pelajaran untuk pengelompokan laboratorium virtual.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Add Category (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-600" />
            Tambah Kategori Baru
          </h3>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs ${
                message.isError
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Kategori *
              </label>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Geografi & Kebumian"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Slug URL *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="geografi-kebumian"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Ikon Lucide
              </label>
              <select
                name="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="Calculator">Calculator (Matematika)</option>
                <option value="Atom">Atom (Fisika)</option>
                <option value="FlaskConical">FlaskConical (Kimia)</option>
                <option value="Dna">Dna (Biologi)</option>
                <option value="Network">Network (Informatika &amp; Komputer)</option>
                <option value="Globe">Globe (Astronomi / Geografi)</option>
                <option value="Cpu">Cpu (Elektronika)</option>
                <option value="Layers">Layers (Umum)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Uraian singkat bidang keilmuan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
            >
              {loading ? 'Menyimpan...' : 'Tambahkan Kategori'}
            </button>
          </form>
        </div>

        {/* Categories List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            Daftar Kategori Terdaftar
          </h3>

          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="py-3.5 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                  <p className="font-mono text-[10px] text-slate-400">/{cat.slug}</p>
                  {cat.description && (
                    <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                      {cat.description}
                    </p>
                  )}
                  <span className="inline-block mt-1 text-[10px] text-brand-600 font-semibold">
                    {cat._count?.laboratories ?? 0} Laboratorium
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
