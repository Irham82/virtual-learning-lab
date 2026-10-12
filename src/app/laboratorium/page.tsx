import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { LabCard } from '@/components/lab-card';
import { Search, Filter, RotateCcw, Sparkles, BookOpen } from 'lucide-react';

interface CatalogPageProps {
  searchParams: {
    q?: string;
    kategori?: string;
    jenjang?: string;
    kesulitan?: string;
    tipe?: string;
    sort?: string;
  };
}

export const revalidate = 0;

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const query = searchParams.q?.trim() || '';
  const categorySlug = searchParams.kategori || '';
  const levelSlug = searchParams.jenjang || '';
  const difficulty = searchParams.kesulitan || '';
  const simulationType = searchParams.tipe || '';
  const sortBy = searchParams.sort || 'newest';

  // Fetch filter options from database
  const [categories, educationLevels] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.educationLevel.findMany({ orderBy: { order: 'asc' } }),
  ]);

  // Build Prisma where clause
  const where: any = {
    status: 'PUBLISHED',
  };

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { shortDescription: { contains: query } },
      { subject: { contains: query } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (levelSlug) {
    where.educationLevel = { slug: levelSlug };
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (simulationType) {
    where.simulationType = simulationType;
  }

  // Sorting
  let orderBy: any = { publishedAt: 'desc' };
  if (sortBy === 'title-asc') {
    orderBy = { title: 'asc' };
  } else if (sortBy === 'duration-asc') {
    orderBy = { duration: 'asc' };
  } else if (sortBy === 'popular') {
    orderBy = { viewCount: 'desc' };
  }

  const labs = await prisma.laboratory.findMany({
    where,
    orderBy,
    include: {
      category: true,
      educationLevel: true,
    },
  });

  const hasActiveFilters = Boolean(
    query || categorySlug || levelSlug || difficulty || simulationType || (sortBy && sortBy !== 'newest')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Catalog Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Katalog Lengkap</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Semua Laboratorium Virtual
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Temukan eksperimen virtual berdasarkan mata pelajaran, jenjang sekolah, tingkat kesulitan, atau tipe simulasi interaktif.
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <form
        method="GET"
        action="/laboratorium"
        className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4"
      >
        {/* Search Row */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari berdasarkan judul, kata kunci materi, atau mata pelajaran..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Kategori:
            </label>
            <select
              name="kategori"
              defaultValue={categorySlug}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Education Level Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Jenjang:
            </label>
            <select
              name="jenjang"
              defaultValue={levelSlug}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="">Semua Jenjang</option>
              {educationLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.slug}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tingkat Kesulitan:
            </label>
            <select
              name="kesulitan"
              defaultValue={difficulty}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="">Semua Tingkat</option>
              <option value="BEGINNER">Pemula</option>
              <option value="INTERMEDIATE">Menengah</option>
              <option value="ADVANCED">Lanjutan</option>
            </select>
          </div>

          {/* Simulation Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tipe Simulasi:
            </label>
            <select
              name="tipe"
              defaultValue={simulationType}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="">Semua Tipe</option>
              <option value="THREE_D">Simulasi 3D</option>
              <option value="TWO_D">Simulasi 2D</option>
              <option value="WEB_INTERACTIVE">Web Interaktif</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Urutkan:
            </label>
            <select
              name="sort"
              defaultValue={sortBy}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="popular">Paling Populer</option>
              <option value="title-asc">Nama (A - Z)</option>
              <option value="duration-asc">Durasi Singkat</option>
            </select>
          </div>
        </div>

        {/* Submit and Reset Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900 font-bold">{labs.length}</strong> laboratorium
          </p>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Link
                href="/laboratorium"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </Link>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </form>

      {/* Lab Cards Grid or Empty State */}
      {labs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      ) : (
        <div className="py-16 px-4 bg-white rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">
            Laboratorium Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tidak ada laboratorium yang sesuai dengan kombinasi pencarian atau filter yang Anda pilih. Coba sesuaikan kata kunci pencarian.
          </p>
          <div className="pt-2">
            <Link
              href="/laboratorium"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Lihat Semua Laboratorium</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
