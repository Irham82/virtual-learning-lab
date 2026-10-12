import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { LabCard } from '@/components/lab-card';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Bookmark,
  Award,
  ArrowRight,
  Clock,
  Compass,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export const revalidate = 0;

export default async function UserDashboardPage() {
  const user = await requireUser();

  // Fetch user stats & progress from DB
  const [progresses, favorites, quizAttempts, recommendedLabs] = await Promise.all([
    prisma.learningProgress.findMany({
      where: { userId: user.id },
      include: {
        laboratory: {
          include: {
            category: true,
            educationLevel: true,
            activities: true,
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        laboratory: {
          include: {
            category: true,
            educationLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: { quiz: true },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.laboratory.findMany({
      where: {
        status: 'PUBLISHED',
        progresses: {
          none: { userId: user.id },
        },
      },
      take: 3,
      orderBy: { viewCount: 'desc' },
      include: {
        category: true,
        educationLevel: true,
      },
    }),
  ]);

  const completedLabsCount = progresses.filter((p) => p.status === 'COMPLETED').length;
  const inProgressCount = progresses.filter((p) => p.status === 'IN_PROGRESS').length;
  const passedQuizzesCount = quizAttempts.filter((q) => q.passed).length;

  const lastAccessed = progresses.length > 0 ? progresses[0] : null;

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-tealbrand-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-tealbrand-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selamat Datang Kembali</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Halo, {user.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Terus eksplorasi eksperimen laboratorium virtual untuk memperkuat pemahaman konsep teori Anda.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Lab Sedang Berjalan</p>
          <p className="text-2xl font-black text-brand-600 font-mono">{inProgressCount}</p>
          <p className="text-[10px] text-slate-400">Belum diselesaikan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Lab Selesai</p>
          <p className="text-2xl font-black text-emerald-600 font-mono">{completedLabsCount}</p>
          <p className="text-[10px] text-slate-400">Selesai 100%</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Kuis Lulus</p>
          <p className="text-2xl font-black text-amber-600 font-mono">{passedQuizzesCount}</p>
          <p className="text-[10px] text-slate-400">Dari {quizAttempts.length} percobaan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Lab Favorit</p>
          <p className="text-2xl font-black text-indigo-600 font-mono">{favorites.length}</p>
          <p className="text-[10px] text-slate-400">Tersimpan</p>
        </div>
      </div>

      {/* CONTINUE LEARNING SECTION (Section N: "Laboratorium terakhir dibuka & tombol lanjutkan belajar") */}
      {lastAccessed && (
        <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
              Lanjutkan Belajar Terakhir
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Terakhir dibuka {new Date(lastAccessed.lastAccessedAt).toLocaleDateString('id-ID')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                {lastAccessed.laboratory.subject} • {lastAccessed.laboratory.educationLevel.name}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                {lastAccessed.laboratory.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {lastAccessed.laboratory.shortDescription}
              </p>
            </div>

            <Link
              href={`/laboratorium/${lastAccessed.laboratory.slug}`}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
            >
              <span>Lanjutkan Belajar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Active Labs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">
            Laboratorium Aktif Saya
          </h2>
          <Link
            href="/dashboard/progres"
            className="text-xs font-bold text-brand-700 hover:underline"
          >
            Lihat Semua Progres
          </Link>
        </div>

        {progresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progresses.slice(0, 4).map((p) => {
              let compIds: string[] = [];
              try {
                compIds = JSON.parse(p.completedActivityIds);
              } catch {
                compIds = [];
              }
              const totalAct = p.laboratory.activities.length;
              const pct = totalAct > 0 ? Math.round((compIds.length / totalAct) * 100) : 0;

              return (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-brand-700">
                        {p.laboratory.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status === 'COMPLETED' ? 'Selesai' : `${pct}% Selesai`}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                      {p.laboratory.title}
                    </h3>
                  </div>

                  <div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-brand-600 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <Link
                      href={`/laboratorium/${p.laboratory.slug}`}
                      className="block text-center py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                      Buka Laboratorium
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-500">Anda belum membuka laboratorium mana pun.</p>
            <Link
              href="/laboratorium"
              className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600"
            >
              Mulai Eksplorasi Sekarang
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Labs */}
      {recommendedLabs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-tealbrand-600" />
            <h2 className="text-lg font-extrabold text-slate-900">
              Rekomendasi Laboratorium Baru
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
