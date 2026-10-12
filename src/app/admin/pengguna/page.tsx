import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { AdminUserTable } from './admin-user-table';

export const revalidate = 0;

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          progresses: true,
          quizAttempts: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Manajemen Akun Pengguna
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daftar seluruh siswa dan administrator yang terdaftar di Virtual Learning Lab.
        </p>
      </div>

      <AdminUserTable initialUsers={users} />
    </div>
  );
}
