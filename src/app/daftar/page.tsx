'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FlaskConical, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { registerAction } from '@/app/actions/auth';

export default function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerAction(null, formData);
      if (res?.error) {
        setErrorMessage(res.error);
        setIsPending(false);
      }
    } catch (err: any) {
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage('Gagal mendaftar. Silakan periksa input Anda.');
        setIsPending(false);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-tealbrand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-6 h-6 stroke-[2.2]" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Pendaftaran Siswa Baru
          </h2>
          <p className="text-xs text-slate-500">
            Bergabunglah dengan ribuan pelajar dalam mengeksplorasi sains interaktif secara digital.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                required
                placeholder="Nama Anda"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                placeholder="Ulangi kata sandi"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/ketentuan" className="text-brand-600 hover:underline">
              Ketentuan Penggunaan
            </Link>{' '}
            dan{' '}
            <Link href="/kebijakan-privasi" className="text-brand-600 hover:underline">
              Kebijakan Privasi
            </Link>.
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 ${
              isPending
                ? 'bg-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:from-brand-700 hover:to-tealbrand-700 hover:scale-[1.01]'
            }`}
          >
            <span>{isPending ? 'Mendaftarkan Akun...' : 'Daftar Akun Siswa'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link href="/masuk" className="font-bold text-brand-600 hover:text-brand-700">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
