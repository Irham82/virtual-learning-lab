import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { LabCard } from '@/components/lab-card';
import { CategoryIcon } from '@/components/category-icon';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Users,
  Compass,
  Layers,
  GraduationCap,
  Play,
  Cpu,
  CheckCircle2,
  Orbit,
} from 'lucide-react';

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  // 1. Fetch real statistics from database (NO FAKE STATS!)
  const [totalPublishedLabs, totalCategories, totalUsers, totalActivities] = await Promise.all([
    prisma.laboratory.count({ where: { status: 'PUBLISHED' } }),
    prisma.category.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.learningActivity.count(),
  ]);

  // 2. Fetch categories with their lab counts
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          laboratories: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
    },
  });

  // 3. Fetch Featured Labs
  const featuredLabs = await prisma.laboratory.findMany({
    where: { status: 'PUBLISHED', featured: true },
    take: 4,
    orderBy: { updatedAt: 'desc' },
    include: {
      category: true,
      educationLevel: true,
    },
  });

  // 4. Fetch Latest Labs
  const latestLabs = await prisma.laboratory.findMany({
    where: { status: 'PUBLISHED' },
    take: 6,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      educationLevel: true,
    },
  });

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-950 to-slate-950 text-white pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tealbrand-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-800/80 border border-brand-700 text-xs font-semibold text-brand-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Portal Laboratorium Virtual Sains &amp; Teknologi</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Jelajahi Ilmu Pengetahuan Melalui{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-tealbrand-300 via-brand-300 to-indigo-200">
                  Laboratorium Virtual
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Belajar lebih menarik melalui eksperimen, simulasi interaktif, eksplorasi 3D, dan pengalaman praktik digital dari berbagai bidang ilmu.
              </p>

              {/* Search Bar */}
              <form
                action="/laboratorium"
                method="GET"
                className="max-w-xl mx-auto lg:mx-0 flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl focus-within:border-tealbrand-400 focus-within:bg-white/15 transition-all"
              >
                <div className="pl-3.5 text-slate-300">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="q"
                  placeholder="Cari laboratorium (Tata Surya, Subnetting, Rasio...)"
                  className="flex-1 px-3 py-2.5 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-tealbrand-300 to-tealbrand-400 hover:from-tealbrand-200 hover:to-tealbrand-300 shadow-md transition-all active:scale-95"
                >
                  Cari
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/laboratorium"
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
                >
                  Jelajahi Laboratorium
                </Link>
                <Link
                  href="/#kategori"
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
                >
                  Lihat Kategori
                </Link>
              </div>
            </div>

            {/* Right Interactive Preview Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl p-1 bg-gradient-to-tr from-brand-500 via-tealbrand-400 to-indigo-500 shadow-2xl shadow-brand-500/30">
                <div className="bg-slate-900 rounded-[22px] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-[11px] font-mono text-tealbrand-300">
                      Virtual Lab Live Sandbox
                    </span>
                  </div>

                  <div className="aspect-video w-full rounded-xl bg-slate-950 relative overflow-hidden flex items-center justify-center border border-slate-800 group">
                    <img
                      src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80"
                      alt="Laboratorium Virtual Tata Surya 3D"
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white drop-shadow">
                        Simulasi 3D Tata Surya &amp; Revolusi Planet
                      </p>
                      <span className="text-[10px] text-tealbrand-300">Siap Dijalankan</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      <p className="text-[10px] text-slate-500">Mode Simulasi</p>
                      <p className="font-bold text-tealbrand-400">3D WebGL / Canvas</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      <p className="text-[10px] text-slate-500">Tingkat Kurikulum</p>
                      <p className="font-bold text-amber-400">SMP / SMA / SMK</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REAL STATS COUNTER BAR (Section E.2: "Statistik platform yang berasal dari data database, bukan angka fiktif") */}
          <div className="mt-14 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-white font-mono">
                {totalPublishedLabs}
              </p>
              <p className="text-xs text-slate-400 font-medium">Laboratorium Aktif</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-tealbrand-400 font-mono">
                {totalCategories}
              </p>
              <p className="text-xs text-slate-400 font-medium">Bidang Keilmuan</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-indigo-400 font-mono">
                {totalActivities}
              </p>
              <p className="text-xs text-slate-400 font-medium">Aktivitas Praktik</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
                {totalUsers}
              </p>
              <p className="text-xs text-slate-400 font-medium">Peserta Didik Terdaftar</p>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI LABORATORIUM (Section E.3) */}
      <section id="kategori" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>Kategori Pembelajaran</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Eksplorasi Menurut Bidang Studi
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Pilih disiplin ilmu untuk menemukan modul laboratorium dan eksperimen yang sesuai.
            </p>
          </div>

          <Link
            href="/laboratorium"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 group"
          >
            <span>Semua Laboratorium</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/laboratorium?kategori=${cat.slug}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-brand-400 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-600 group-hover:text-white text-brand-700 flex items-center justify-center transition-colors">
                  <CategoryIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 group-hover:bg-brand-100 group-hover:text-brand-800 px-2 py-0.5 rounded-full transition-colors">
                  {cat._count.laboratories} Lab
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description || 'Simulasi dan eksperimen terstruktur.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LABORATORIUM UNGGULAN (Section E.4) */}
      {featuredLabs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Pilihan Kurikulum</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Laboratorium Virtual Unggulan
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Modul laboratorium paling interaktif dengan simulasi 2D/3D kaya eksperimen dan evaluasi teruji.
              </p>
            </div>

            <Link
              href="/laboratorium"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 group"
            >
              <span>Lihat Katalog Lengkap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        </section>
      )}

      {/* LABORATORIUM TERBARU (Section E.5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-tealbrand-700 uppercase tracking-wider mb-2">
              <FlaskConical className="w-4 h-4" />
              <span>Pembaruan Modul</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Laboratorium Terbaru
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Modul eksperimen virtual terkini yang siap digunakan dalam kegiatan belajar mengajar.
            </p>
          </div>

          <Link
            href="/laboratorium"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 group"
          >
            <span>Semua Modul ({totalPublishedLabs})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestLabs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      </section>

      {/* KEUNGGULAN FITUR PLATFORM (Section E.6) */}
      <section className="bg-slate-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tealbrand-400 font-mono">
              Keunggulan EdTech
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Mengapa Belajar di Virtual Learning Lab?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Platform dirancang khusus dengan standar pedagogis pendidikan abad ke-21 untuk menghadirkan pengalaman praktik sains tanpa keterbatasan fasilitas fisik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Eksperimen Interaktif</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ubah parameter, gerakkan slider kuantitas, dan amati respons sistem secara real-time seperti di laboratorium riset nyata.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-tealbrand-500/20 text-tealbrand-400 flex items-center justify-center">
                <Orbit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Simulasi 2D dan 3D</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Mulai dari visualisasi Three.js orbit tata surya hingga kanvas topologi jaringan dan kalkulator biner yang responsif di semua perangkat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Pembelajaran Mandiri</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Siswa dapat belajar sesuai kecepatan masing-masing didukung petunjuk langkah demi langkah dan modul prasyarat yang jelas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Materi Lintas Mata Pelajaran</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Mencakup Matematika, Fisika, Kimia, Biologi, Teknik Komputer dan Jaringan (TKJ), Astronomi, dan Elektronika.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Aktivitas dan Kuis Evaluasi</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Lembar aktivitas terarah dan kuis evaluasi otomatis dengan kunci jawaban dan pembahasan untuk mengukur ketercapaian kompetensi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Pelacakan Progres Terpusat</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Riwayat pengerjaan, skor kuis, dan status laboratorium otomatis tersimpan dan dapat dilanjutkan kapan saja dari dashboard pengguna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-tealbrand-600 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black">
              Siap Memulai Eksperimen Laboratorium Digital?
            </h2>
            <p className="text-brand-100 text-sm leading-relaxed">
              Daftar akun gratis sekarang dan akses simulasi virtual interaktif tanpa memerlukan perlengkapan fisik berbahaya atau mahal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/daftar"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-brand-900 hover:bg-slate-100 shadow-md transition-all hover:scale-105"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/laboratorium"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-brand-800/60 hover:bg-brand-800 text-white border border-brand-500/50 transition-all"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
