import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { logoutAction } from '@/app/actions/auth';
import {
  LayoutDashboard,
  FlaskConical,
  PlusCircle,
  Layers,
  GraduationCap,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  User,
  LogOut,
  Shield,
  ExternalLink,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  const menu = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Manajemen Laboratorium', href: '/admin/laboratorium', icon: FlaskConical },
    { label: 'Tambah Laboratorium', href: '/admin/laboratorium/tambah', icon: PlusCircle },
    { label: 'Kategori', href: '/admin/kategori', icon: Layers },
    { label: 'Jenjang Pendidikan', href: '/admin/jenjang', icon: GraduationCap },
    { label: 'Manajemen Pengguna', href: '/admin/pengguna', icon: Users },
    { label: 'Aktivitas Belajar', href: '/admin/aktivitas', icon: CheckSquare },
    { label: 'Statistik & Laporan', href: '/admin/laporan', icon: BarChart3 },
    { label: 'Pengaturan Website', href: '/admin/pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 sm:p-5 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-400 text-white flex items-center justify-center font-bold shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white tracking-tight">Admin Console</h2>
                <span className="text-[10px] font-mono text-tealbrand-400">Virtual Learning Lab</span>
              </div>
            </div>

            <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <p className="font-semibold text-slate-200 truncate">{admin.name}</p>
              <p className="text-[10px] text-amber-400 font-mono">Role: ADMINISTRATOR</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition-all text-slate-400"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Website Publik</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
