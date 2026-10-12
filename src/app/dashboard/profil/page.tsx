'use client';

import React, { useState } from 'react';
import { updateProfileAction, changePasswordAction } from '@/app/actions/auth';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserProfilePage() {
  const [profileMessage, setProfileMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [profilePending, setProfilePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfilePending(true);
    setProfileMessage(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(null, formData);
    if (res?.error) {
      setProfileMessage({ text: res.error, isError: true });
    } else {
      setProfileMessage({ text: 'Profil berhasil diperbarui.', isError: false });
    }
    setProfilePending(false);
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordPending(true);
    setPasswordMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await changePasswordAction(null, formData);
    if (res?.error) {
      setPasswordMessage({ text: res.error, isError: true });
    } else {
      setPasswordMessage({ text: 'Kata sandi berhasil diperbarui.', isError: false });
      form.reset();
    }
    setPasswordPending(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Pengaturan Akun &amp; Profil
        </h1>
        <p className="text-xs text-slate-500">
          Kelola data diri dan perbarui kata sandi akun pembelajaran Anda secara mandiri.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Informasi Profil
          </h3>

          {profileMessage && (
            <div
              className={`p-3 rounded-xl text-xs ${
                profileMessage.isError
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue="Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Biografi Singkat / Minat Studi
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Ceritakan minat sains atau bidang ilmu Anda..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={profilePending}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
            >
              {profilePending ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-tealbrand-600" />
            Ubah Kata Sandi
          </h3>

          {passwordMessage && (
            <div
              className={`p-3 rounded-xl text-xs ${
                passwordMessage.isError
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                name="confirmNewPassword"
                required
                minLength={6}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={passwordPending}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-sm"
            >
              {passwordPending ? 'Memproses...' : 'Perbarui Kata Sandi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
