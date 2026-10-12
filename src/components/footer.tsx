import React from 'react';
import Link from 'next/link';
import { FlaskConical, Mail, Phone, MapPin, Sparkles, Shield, BookCheck, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <FlaskConical className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Virtual Learning Lab
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform laboratorium virtual interaktif untuk memperdalam pemahaman sains, matematika, astronomi, dan teknologi melalui simulasi 2D &amp; 3D serta eksperimen digital berbasis data.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-tealbrand-400" />
                <span>kontak@virtuallearninglab.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-tealbrand-400" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-tealbrand-400" />
                <span>Laboratorium Sains Digital Indonesia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Laboratorium</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/laboratorium" className="hover:text-white transition-colors">
                  Katalog Lengkap
                </Link>
              </li>
              <li>
                <Link href="/laboratorium?kategori=matematika" className="hover:text-white transition-colors">
                  Lab Matematika
                </Link>
              </li>
              <li>
                <Link href="/laboratorium?kategori=ipa-fisika" className="hover:text-white transition-colors">
                  Lab Fisika
                </Link>
              </li>
              <li>
                <Link href="/laboratorium?kategori=astronomi" className="hover:text-white transition-colors">
                  Lab Astronomi 3D
                </Link>
              </li>
              <li>
                <Link href="/laboratorium?kategori=informatika" className="hover:text-white transition-colors">
                  Lab Informatika &amp; Jaringan
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Akun */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Portal Belajar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/masuk" className="hover:text-white transition-colors">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/daftar" className="hover:text-white transition-colors">
                  Daftar Siswa Baru
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard Progres
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-white transition-colors">
                  Tentang Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Legalitas & Keamanan */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Ketentuan &amp; Privasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/ketentuan" className="hover:text-white transition-colors">
                  Ketentuan Penggunaan
                </Link>
              </li>
              <li>
                <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-tealbrand-400" />
                  <span>Sistem RBAC Terproteksi</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Virtual Learning Lab. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              EdTech Modern &amp; Standar Industri
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
