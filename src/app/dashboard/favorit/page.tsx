import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { LabCard } from '@/components/lab-card';
import { Bookmark } from 'lucide-react';

export const revalidate = 0;

export default async function UserFavoritesPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
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
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Laboratorium Favorit Saya
        </h1>
        <p className="text-xs text-slate-500">
          Daftar laboratorium yang Anda simpan untuk akses cepat dan pembelajaran berulang.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <LabCard key={fav.id} lab={fav.laboratory} />
          ))}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">Belum Ada Laboratorium Favorit</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Klik tombol &ldquo;Tambah ke Favorit&rdquo; di halaman detail laboratorium untuk menyimpannya di sini.
          </p>
          <Link
            href="/laboratorium"
            className="inline-block px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 shadow-sm"
          >
            Jelajahi Laboratorium
          </Link>
        </div>
      )}
    </div>
  );
}
