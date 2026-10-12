import React from 'react';
import Link from 'next/link';
import { BookCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <div className="space-y-2 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase">
          <BookCheck className="w-4 h-4" />
          <span>Ketentuan Layanan Platform</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">Ketentuan Penggunaan</h1>
        <p className="text-xs text-slate-500">
          Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-6 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Ketentuan Akun Pengguna</h2>
          <p>
            Dengan membuat akun di Virtual Learning Lab, Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. Pengguna dilarang melakukan tindakan eksploitasi, otomatisasi manipulasi progres, atau percobaan akses ilegal ke panel administrasi.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Hak Kekayaan Intelektual Modul Simulasi</h2>
          <p>
            Seluruh konten laboratorium, skrip simulasi 2D/3D, dan materi evaluasi dilindungi oleh hak cipta. Pengguna diperkenankan memanfaatkan modul untuk tujuan pembelajaran individu atau kegiatan belajar mengajar non-komersial.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Batasan Tanggung Jawab</h2>
          <p>
            Meskipun simulasi dirancang untuk merefleksikan model ilmiah seakurat mungkin, laboratorium virtual ini merupakan media bantu pendidikan komputasi dan tidak menggantikan sertifikasi uji keselamatan fisik laboratorium profesional jika disyaratkan.
          </p>
        </section>
      </div>
    </div>
  );
}
