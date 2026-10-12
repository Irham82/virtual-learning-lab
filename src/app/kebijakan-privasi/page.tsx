import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <div className="space-y-2 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase">
          <Shield className="w-4 h-4" />
          <span>Keamanan Data &amp; Privasi</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">Kebijakan Privasi</h1>
        <p className="text-xs text-slate-500">
          Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-6 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Informasi yang Kami Kumpulkan</h2>
          <p>
            Virtual Learning Lab mengumpulkan informasi yang Anda berikan saat mendaftar akun, seperti nama lengkap dan alamat email. Kami juga merekam progres interaksi eksperimen, status aktivitas belajar, dan hasil skor kuis evaluasi untuk memantau perkembangan akademik Anda.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Keamanan Kata Sandi &amp; Autentikasi</h2>
          <p>
            Kata sandi Anda disimpan menggunakan algoritma hashing satu arah yang kuat (bcrypt). Administrator sistem tidak memiliki kemampuan untuk melihat teks asli kata sandi Anda. Sesi masuk diamankan melalui token JWT terenkripsi dengan atribut cookie HTTP-Only.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Penggunaan Data Aktivitas</h2>
          <p>
            Data riwayat pembelajaran semata-mata digunakan untuk menampilkan portofolio belajar pribadi Anda dan laporan statistik agregat bagi pihak sekolah atau instruktur. Kami tidak memperjualbelikan data pribadi Anda kepada pihak ketiga.
          </p>
        </section>
      </div>
    </div>
  );
}
