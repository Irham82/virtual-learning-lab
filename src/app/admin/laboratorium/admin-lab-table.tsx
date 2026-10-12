'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  toggleLabStatusAction,
  toggleLabFeaturedAction,
  deleteLabAction,
} from '@/app/actions/admin';
import {
  FileEdit,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LabItem {
  id: string;
  title: string;
  slug: string;
  subject: string;
  status: string;
  featured: boolean;
  viewCount: number;
  createdAt: Date;
  category: { name: string };
  educationLevel: { name: string };
}

export function AdminLabTable({ initialLabs }: { initialLabs: LabItem[] }) {
  const [labs, setLabs] = useState<LabItem[]>(initialLabs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (labId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    if (!confirm(`Ubah status publikasi laboratorium ini menjadi ${nextStatus}?`)) {
      return;
    }

    try {
      const res = await toggleLabStatusAction(labId, nextStatus);
      if (res.success) {
        setLabs((prev) =>
          prev.map((l) => (l.id === labId ? { ...l, status: nextStatus } : l))
        );
      }
    } catch (e) {
      alert('Gagal mengubah status laboratorium.');
    }
  };

  const handleToggleFeatured = async (labId: string) => {
    try {
      const res = await toggleLabFeaturedAction(labId);
      if (res.success) {
        setLabs((prev) =>
          prev.map((l) => (l.id === labId ? { ...l, featured: res.featured } : l))
        );
      }
    } catch (e) {
      alert('Gagal mengubah status unggulan.');
    }
  };

  const handleDelete = async (labId: string, title: string) => {
    if (
      !confirm(
        `PERINGATAN: Apakah Anda yakin ingin menghapus laboratorium "${title}" secara permanen? Seluruh aktivitas dan kuis terkait akan terhapus.`
      )
    ) {
      return;
    }

    try {
      const res = await deleteLabAction(labId);
      if (res.success) {
        setLabs((prev) => prev.filter((l) => l.id !== labId));
      }
    } catch (e) {
      alert('Gagal menghapus laboratorium.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <input
          type="text"
          placeholder="Cari nama laboratorium atau mata pelajaran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
        />

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'Semua'
                : st === 'PUBLISHED'
                ? 'Published'
                : st === 'DRAFT'
                ? 'Draft'
                : 'Arsip'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Laboratorium</th>
                <th className="px-5 py-3.5">Kategori / Jenjang</th>
                <th className="px-5 py-3.5 text-center">Unggulan</th>
                <th className="px-5 py-3.5">Status Publikasi</th>
                <th className="px-5 py-3.5">Tayang</th>
                <th className="px-5 py-3.5 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.map((lab) => (
                <tr key={lab.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 text-sm line-clamp-1">
                      {lab.title}
                    </p>
                    <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                      /laboratorium/{lab.slug}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <span className="font-semibold block text-slate-800">
                      {lab.category.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {lab.educationLevel.name}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(lab.id)}
                      title="Klik untuk ubah status unggulan"
                      className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                        lab.featured
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-slate-300 hover:text-slate-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${lab.featured ? 'fill-amber-400' : ''}`} />
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleStatus(lab.id, lab.status)}
                      title="Klik untuk ubah status"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        lab.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : lab.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lab.status === 'PUBLISHED' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : lab.status === 'DRAFT' ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Draft</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3" />
                          <span>Archived</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-5 py-4 font-mono text-slate-600">
                    {lab.viewCount}x
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/laboratorium/${lab.slug}`}
                        target="_blank"
                        title="Buka Halaman Publik"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/admin/laboratorium/${lab.id}/edit`}
                        title="Edit Konten Lab"
                        className="p-1.5 rounded-lg text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                      >
                        <FileEdit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(lab.id, lab.title)}
                        title="Hapus Lab"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
