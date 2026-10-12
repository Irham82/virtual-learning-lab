'use client';

import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleFavoriteAction } from '@/app/actions/learning';

export function FavoriteButton({
  labId,
  initialFavorited,
}: {
  labId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await toggleFavoriteAction(labId);
      setFavorited(res.favorited);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
        favorited
          ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${favorited ? 'fill-amber-500 text-amber-500' : ''}`} />
      <span>{favorited ? 'Tersimpan di Favorit' : 'Tambah ke Favorit'}</span>
    </button>
  );
}
