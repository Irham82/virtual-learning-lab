import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { CheckSquare, Clock, ExternalLink } from 'lucide-react';

export const revalidate = 0;

export default async function AdminActivitiesPage() {
  await requireAdmin();

  const activities = await prisma.learningActivity.findMany({
    orderBy: [{ laboratory: { title: 'asc' } }, { stepNumber: 'asc' }],
    include: {
      laboratory: {
        select: {
          title: true,
          slug: true,
          subject: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Aktivitas Pembelajaran Terstruktur
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daftar seluruh langkah eksperimen dan lembar kerja praktik di setiap laboratorium virtual.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Laboratorium</th>
                <th className="px-5 py-3.5">Langkah</th>
                <th className="px-5 py-3.5">Judul Aktivitas</th>
                <th className="px-5 py-3.5">Tipe Tugas</th>
                <th className="px-5 py-3.5">Estimasi Waktu</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900">{act.laboratory.title}</span>
                    <span className="text-[10px] text-slate-400 block">{act.laboratory.subject}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-brand-600">
                    Langkah #{act.stepNumber}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{act.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{act.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded bg-tealbrand-50 text-tealbrand-800 font-bold text-[10px] uppercase">
                      {act.taskType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-mono">
                    {act.estimatedMinutes} Menit
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/laboratorium/${act.laboratory.slug}`}
                      target="_blank"
                      className="font-bold text-brand-600 hover:underline"
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
    </div>
  );
}
