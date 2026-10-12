import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { BarChart3, TrendingUp, Users, Award, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReportsPage() {
  await requireAdmin();

  const [
    totalProgressRecords,
    completedProgressRecords,
    totalQuizAttempts,
    passedQuizAttempts,
    labs,
  ] = await Promise.all([
    prisma.learningProgress.count(),
    prisma.learningProgress.count({ where: { status: 'COMPLETED' } }),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.laboratory.findMany({
      include: {
        category: true,
        _count: {
          select: {
            progresses: true,
            quizzes: true,
          },
        },
      },
      orderBy: { viewCount: 'desc' },
    }),
  ]);

  const completionRate =
    totalProgressRecords > 0
      ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
      : 0;

  const quizPassRate =
    totalQuizAttempts > 0
      ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Laporan Analitik &amp; Statistik Pembelajaran
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Data performa ketercapaian belajar siswa, tingkat kelulusan kuis, dan rasio penyelesaian modul.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Sesi Pembelajaran</p>
          <p className="text-3xl font-black text-brand-600 font-mono">{totalProgressRecords}</p>
          <p className="text-[10px] text-slate-400">Total interaksi dimulai</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Tingkat Penyelesaian</p>
          <p className="text-3xl font-black text-emerald-600 font-mono">{completionRate}%</p>
          <p className="text-[10px] text-slate-400">{completedProgressRecords} lab selesai tuntas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Ujian / Kuis</p>
          <p className="text-3xl font-black text-indigo-600 font-mono">{totalQuizAttempts}</p>
          <p className="text-[10px] text-slate-400">Percobaan evaluasi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Taraf Kelulusan Kuis</p>
          <p className="text-3xl font-black text-amber-600 font-mono">{quizPassRate}%</p>
          <p className="text-[10px] text-slate-400">{passedQuizAttempts} peserta lulus evaluasi</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Metrik Penyerapan Modul Laboratorium
        </h3>
        <div className="divide-y divide-slate-100">
          {labs.map((lab) => (
            <div key={lab.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{lab.title}</p>
                <p className="text-slate-500 text-[11px]">{lab.category.name} • {lab.subject}</p>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Tayang</span>
                  <span className="font-bold text-slate-700">{lab.viewCount}x</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Peserta Belajar</span>
                  <span className="font-bold text-brand-600">{lab._count.progresses} Siswa</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
