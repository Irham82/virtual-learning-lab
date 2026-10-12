import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import {
  FlaskConical,
  Users,
  CheckSquare,
  Eye,
  PlusCircle,
  FileEdit,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  await requireAdmin();

  // Actual DB Counts
  const [
    totalLabs,
    publishedLabs,
    draftLabs,
    archivedLabs,
    totalUsers,
    totalActivities,
    mostViewedLabs,
    recentLogs,
  ] = await Promise.all([
    prisma.laboratory.count(),
    prisma.laboratory.count({ where: { status: 'PUBLISHED' } }),
    prisma.laboratory.count({ where: { status: 'DRAFT' } }),
    prisma.laboratory.count({ where: { status: 'ARCHIVED' } }),
    prisma.user.count(),
    prisma.learningActivity.count(),
    prisma.laboratory.findMany({
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: { category: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { user: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ringkasan Platform Administrasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau metrik aktual laboratorium, aktivitas pembelajaran, dan log operasional sistem.
          </p>
        </div>

        <Link
          href="/admin/laboratorium/tambah"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Laboratorium Baru</span>
        </Link>
      </div>

      {/* Actual Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Lab</p>
          <p className="text-3xl font-black text-slate-900 font-mono">{totalLabs}</p>
          <p className="text-[10px] text-slate-400">Di seluruh kategori</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-emerald-800 uppercase">Dipublikasikan</p>
          <p className="text-3xl font-black text-emerald-600 font-mono">{publishedLabs}</p>
          <p className="text-[10px] text-emerald-700">Dapat diakses siswa</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-amber-800 uppercase">Draft Tersimpan</p>
          <p className="text-3xl font-black text-amber-600 font-mono">{draftLabs}</p>
          <p className="text-[10px] text-amber-700">Belum dipublikasikan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Pengguna</p>
          <p className="text-3xl font-black text-brand-600 font-mono">{totalUsers}</p>
          <p className="text-[10px] text-slate-400">Akun terdaftar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Aktivitas Belajar</p>
          <p className="text-3xl font-black text-tealbrand-600 font-mono">{totalActivities}</p>
          <p className="text-[10px] text-slate-400">Total lembar tugas</p>
        </div>
      </div>

      {/* Two Column Layout: Most Viewed Labs (Left) and Audit Logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Most Viewed Labs */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-base text-slate-900">
                Laboratorium Paling Banyak Diakses
              </h3>
            </div>
            <Link
              href="/admin/laboratorium"
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              Kelola Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {mostViewedLabs.map((lab, i) => (
              <div key={lab.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center font-mono">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-600 transition-colors">
                      <Link href={`/laboratorium/${lab.slug}`}>{lab.title}</Link>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {lab.category.name} • {lab.subject}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-tealbrand-700 bg-tealbrand-50 px-2 py-0.5 rounded">
                    <Eye className="w-3 h-3" />
                    {lab.viewCount} Tayang
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">
                Log Audit &amp; Aktivitas Sistem
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-brand-700 bg-brand-100/70 px-1.5 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="font-medium text-slate-700 text-[11px] truncate">
                  Entitas: {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}
                </p>
                {log.user && (
                  <p className="text-[10px] text-slate-500">
                    Oleh: {log.user.name} ({log.user.email})
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
