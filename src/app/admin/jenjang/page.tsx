import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { createEducationLevelAction } from '@/app/actions/admin';
import { GraduationCap, Plus } from 'lucide-react';

export const revalidate = 0;

export default async function AdminEducationLevelsPage() {
  await requireAdmin();

  const levels = await prisma.educationLevel.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { laboratories: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Jenjang Pendidikan Kurikulum
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pengelompokan tingkat sekolah: SD/MI, SMP/MTs, SMA/MA, SMK, dan Perguruan Tinggi/Umum.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama Tingkat / Jenjang</th>
                <th className="px-5 py-3.5">Slug URL</th>
                <th className="px-5 py-3.5">Deskripsi</th>
                <th className="px-5 py-3.5 text-center">Jumlah Modul Lab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {levels.map((lvl) => (
                <tr key={lvl.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                    {lvl.name}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-500 text-[11px]">
                    {lvl.slug}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {lvl.description || '-'}
                  </td>
                  <td className="px-5 py-4 text-center font-mono font-bold text-brand-600">
                    {lvl._count.laboratories} Lab
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
