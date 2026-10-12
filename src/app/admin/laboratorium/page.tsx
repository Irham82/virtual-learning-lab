import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { AdminLabTable } from './admin-lab-table';
import { PlusCircle, FlaskConical } from 'lucide-react';

export const revalidate = 0;

export default async function AdminLabsPage() {
  await requireAdmin();

  const labs = await prisma.laboratory.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      educationLevel: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Laboratorium Virtual
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola seluruh modul laboratorium, ubah status draft/publikasi, dan edit materi instruksi.
          </p>
        </div>

        <Link
          href="/admin/laboratorium/tambah"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Laboratorium</span>
        </Link>
      </div>

      <AdminLabTable initialLabs={labs} />
    </div>
  );
}
