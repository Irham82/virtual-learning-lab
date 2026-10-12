import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import {
  LayoutDashboard,
  CheckCircle2,
  Bookmark,
  History,
  User as UserIcon,
  BookOpen,
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const links = [
    { label: 'Ringkasan Belajar', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Progres & Aktivitas', href: '/dashboard/progres', icon: CheckCircle2 },
    { label: 'Laboratorium Favorit', href: '/dashboard/favorit', icon: Bookmark },
    { label: 'Riwayat Kuis', href: '/dashboard/riwayat', icon: History },
    { label: 'Profil Saya', href: '/dashboard/profil', icon: UserIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* User Sidebar */}
        <aside className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-tealbrand-500 text-white flex items-center justify-center font-black text-lg shadow-md uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-slate-900 truncate">{user.name}</h3>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700">
                {user.role === 'ADMIN' ? 'Administrator' : 'Siswa Terdaftar'}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-700 hover:bg-brand-50/70 transition-all"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/laboratorium"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Katalog Lab</span>
            </Link>
          </div>
        </aside>

        {/* User Content Area */}
        <div className="lg:col-span-9 space-y-6">{children}</div>
      </div>
    </div>
  );
}
