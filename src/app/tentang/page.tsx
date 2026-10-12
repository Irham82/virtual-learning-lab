import React from 'react';
import Link from 'next/link';
import { FlaskConical, Target, Shield, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
          <FlaskConical className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Tentang Virtual Learning Lab
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Pusat inovasi pendidikan sains dan teknologi digital yang menjembatani pemahaman teoritis dengan pengalaman praktik nyata melalui simulasi interaktif multi-dimensi.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Visi Kami</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Menjadikan pendidikan sains, matematika, dan kejuruan teknologi dapat diakses secara inklusif, aman, dan mendalam oleh seluruh pelajar di Indonesia tanpa terkendala keterbatasan fasilitas fisik laboratorium.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-tealbrand-50 text-tealbrand-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Misi Kami</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Menyediakan simulator berbasis web yang akurat secara ilmiah, modular, dan responsif. Membekali siswa dengan eksperimen terarah, modul aktivitas mandiri, serta evaluasi otomatis terstandar.
          </p>
        </div>
      </div>

      {/* Pedagogical pillars */}
      <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl space-y-6">
        <h3 className="text-xl font-bold">Pilar Pedagogis &amp; Arsitektur Sistem</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-1.5">
            <h4 className="font-bold text-tealbrand-400 text-sm">1. Eksperimen Berbasis Data</h4>
            <p className="leading-relaxed">
              Setiap simulasi mematuhi hukum fisika, matematika, dan logika komputasi sesungguhnya.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-brand-300 text-sm">2. Keamanan &amp; Integritas RBAC</h4>
            <p className="leading-relaxed">
              Otorisasi di level server memastikan perlindungan hak akses dan kerahasiaan evaluasi siswa.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-amber-400 text-sm">3. Arsitektur Modular</h4>
            <p className="leading-relaxed">
              Modul laboratorium baru dapat ditambahkan oleh administrator dengan fleksibel tanpa mengganggu sistem inti.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/laboratorium"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md"
        >
          <span>Mulai Eksplorasi Laboratorium Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
