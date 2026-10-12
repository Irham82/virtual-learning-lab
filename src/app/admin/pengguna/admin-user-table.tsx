'use client';

import React, { useState } from 'react';
import { toggleUserStatusAction } from '@/app/actions/admin';
import { formatDate } from '@/lib/utils';
import { Shield, User, UserX, UserCheck } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  _count: {
    progresses: number;
    quizAttempts: number;
  };
}

export function AdminUserTable({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (user: UserItem) => {
    if (user.role === 'ADMIN') {
      alert('Akun Administrator tidak dapat dinonaktifkan demi integritas sistem.');
      return;
    }

    const actionText = user.isActive ? 'menonaktifkan' : 'mengaktifkan kembali';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun "${user.name}" (${user.email})?`)) {
      return;
    }

    try {
      const res = await toggleUserStatusAction(user.id);
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: res.isActive } : u))
        );
      } else if (res?.error) {
        alert(res.error);
      }
    } catch {
      alert('Gagal mengubah status akun.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <input
          type="text"
          placeholder="Cari nama atau email pengguna..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama &amp; Email Pengguna</th>
                <th className="px-5 py-3.5">Hak Akses (Role)</th>
                <th className="px-5 py-3.5">Status Akun</th>
                <th className="px-5 py-3.5 text-center">Partisipasi Lab</th>
                <th className="px-5 py-3.5 text-center">Kuis Dikerjakan</th>
                <th className="px-5 py-3.5">Terdaftar</th>
                <th className="px-5 py-3.5 text-right">Aksi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="text-slate-500 text-[11px]">{user.email}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      {user.role === 'ADMIN' ? (
                        <>
                          <Shield className="w-3 h-3 text-amber-600" />
                          <span>ADMIN</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-brand-600" />
                          <span>USER / SISWA</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {user.isActive ? 'Aktif' : 'Dinonaktifkan'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center font-mono font-bold text-slate-700">
                    {user._count.progresses} Lab
                  </td>

                  <td className="px-5 py-4 text-center font-mono font-bold text-slate-700">
                    {user._count.quizAttempts} Kuis
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          user.isActive
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Nonaktifkan</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Aktifkan</span>
                          </>
                        )}
                      </button>
                    )}
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
