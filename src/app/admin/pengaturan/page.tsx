'use client';

import React, { useState } from 'react';
import { updateSettingsAction } from '@/app/actions/admin';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateSettingsAction(null, formData);
    if (res?.success) {
      setSaved(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Pengaturan Platform &amp; Informasi Kontak
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sesuaikan konfigurasi publik identitas platform dan kontak pengelola.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm max-w-2xl space-y-6">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan platform berhasil diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nama Platform
            </label>
            <input
              type="text"
              name="site_name"
              required
              defaultValue="Virtual Learning Lab"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Tagline Utama
            </label>
            <input
              type="text"
              name="site_tagline"
              required
              defaultValue="Jelajahi Ilmu Pengetahuan Melalui Laboratorium Virtual"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Email Narahubung / Dukungan
            </label>
            <input
              type="email"
              name="contact_email"
              required
              defaultValue="kontak@virtuallearninglab.id"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              name="contact_phone"
              required
              defaultValue="+62 812-3456-7890"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
