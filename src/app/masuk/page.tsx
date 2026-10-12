'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FlaskConical, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'unauthorized_admin'
      ? 'Akses ditolak: Anda harus memiliki hak akses Administrator untuk membuka halaman tersebut.'
      : ''
  );
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    formData.set('redirect', redirectUrl);

    try {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setErrorMessage(res.error);
        setIsPending(false);
      }
    } catch (err: any) {
      // If Next.js redirect threw, it is normal navigation
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage('Gagal masuk. Periksa koneksi atau kredensial.');
        setIsPending(false);
      }
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-tealbrand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-6 h-6 stroke-[2.2]" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke Akun Anda
          </h2>
          <p className="text-xs text-slate-500">
            Akses seluruh laboratorium virtual dan simpan progres belajar Anda.
          </p>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <p className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Akun Demo Cepat:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@virtuallearninglab.id', 'AdminPass123!')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[11px] transition-colors"
            >
              👑 Akun Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('siswa@virtuallearninglab.id', 'SiswaPass123!')}
              className="px-2.5 py-1.5 rounded-lg bg-brand-100 hover:bg-brand-200 text-brand-900 font-semibold text-[11px] transition-colors"
            >
              🎓 Akun Siswa Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 ${
              isPending
                ? 'bg-slate-400 cursor-wait'
                : 'bg-brand-600 hover:bg-brand-700 hover:scale-[1.01]'
            }`}
          >
            <span>{isPending ? 'Sedang Memproses...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Belum memiliki akun siswa?{' '}
          <Link href="/daftar" className="font-bold text-brand-600 hover:text-brand-700">
            Daftar Gratis di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
