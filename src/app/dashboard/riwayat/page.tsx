import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { Award, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function UserQuizHistoryPage() {
  const user = await requireUser();

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
    include: {
      quiz: {
        include: {
          laboratory: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Riwayat Evaluasi &amp; Kuis
        </h1>
        <p className="text-xs text-slate-500">
          Catatan hasil tes kompetensi dan skor kuis yang telah Anda selesaikan.
        </p>
      </div>

      {attempts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Laboratorium / Kuis</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Nilai Skor</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {attempt.quiz.title}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {attempt.quiz.laboratory.title}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(attempt.completedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {attempt.score}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Kriteria: {attempt.quiz.passingScore}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          attempt.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {attempt.passed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lulus</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Belum Lulus</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/laboratorium/${attempt.quiz.laboratory.slug}`}
                        className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        Buka Lab
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">Belum Ada Riwayat Kuis</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Selesaikan modul laboratorium dan kerjakan kuis evaluasi untuk merekam skor Anda.
          </p>
        </div>
      )}
    </div>
  );
}
