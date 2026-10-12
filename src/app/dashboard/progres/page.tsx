import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { CheckCircle2, Clock, Play, ArrowRight, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function UserProgressPage() {
  const user = await requireUser();

  const progresses = await prisma.learningProgress.findMany({
    where: { userId: user.id },
    include: {
      laboratory: {
        include: {
          category: true,
          educationLevel: true,
          activities: { orderBy: { stepNumber: 'asc' } },
        },
      },
    },
    orderBy: { lastAccessedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Progres Pembelajaran Saya
        </h1>
        <p className="text-xs text-slate-500">
          Daftar seluruh aktivitas eksperimen laboratorium yang sedang dan telah Anda selesaikan.
        </p>
      </div>

      {progresses.length > 0 ? (
        <div className="space-y-4">
          {progresses.map((p) => {
            let compIds: string[] = [];
            try {
              compIds = JSON.parse(p.completedActivityIds);
            } catch {
              compIds = [];
            }
            const totalAct = p.laboratory.activities.length;
            const pct = totalAct > 0 ? Math.round((compIds.length / totalAct) * 100) : 0;
            const isCompleted = p.status === 'COMPLETED';

            return (
              <div
                key={p.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {p.laboratory.subject} • {p.laboratory.educationLevel.name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {p.laboratory.title}
                    </h3>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isCompleted ? '✓ Selesai Lengkap' : 'Sedang Dipelajari'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Progres Aktivitas ({compIds.length} dari {totalAct})</span>
                    <span className="font-mono font-bold text-brand-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-brand-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span>Terakhir diakses: {formatDate(p.lastAccessedAt)}</span>
                    <span>Waktu: {Math.round(p.timeSpentSeconds / 60)} Menit</span>
                  </div>

                  <Link
                    href={`/laboratorium/${p.laboratory.slug}`}
                    className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-700"
                  >
                    <span>Lanjutkan Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">Belum Ada Progres Laboratorium</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Buka salah satu modul laboratorium dari katalog untuk mulai mempraktikkan sains interaktif.
          </p>
          <Link
            href="/laboratorium"
            className="inline-block px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 shadow-sm"
          >
            Buka Katalog Lab
          </Link>
        </div>
      )}
    </div>
  );
}
