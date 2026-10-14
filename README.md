# Virtual Learning Lab (Platform Website Laboratorium Virtual Interaktif)

Virtual Learning Lab adalah platform Learning Management System (LMS) dan portal laboratorium virtual interaktif modern untuk eksplorasi sains, matematika, astronomi, informatika, dan kejuruan teknologi secara digital.

Platform ini mengintegrasikan simulasi visual 2D dan 3D (Three.js), kanvas topologi jaringan, kalkulator CIDR & subnetting IPv4, dekomposisi rasio matematika, lembar aktivitas praktikum bertahap, kuis evaluasi otomatis, serta sistem role-based access control (RBAC) di tingkat server.

---

## 🚀 Fitur Utama

### 1. Halaman Publik & Katalog
- **Hero Interaktif & Statistik Database Riil**: Metrik laboratorium, kategori, dan aktivitas yang dihitung langsung dari basis data tanpa angka fiktif.
- **Katalog Terintegrasi**: Pencarian cepat, filter multidimensi (kategori studi, jenjang pendidikan, tingkat kesulitan, tipe simulasi 2D/3D/Web), serta pengurutan dinamis.
- **Detail Laboratorium Kaya Informasi**: Teori pengantar, tujuan pembelajaran terstruktur, materi prasyarat, petunjuk penggunaan langkah demi langkah, dan estimasi waktu.

### 2. Modul Simulasi Laboratorium Nyata
- **Lab Virtual Tata Surya 3D (`Three.js`)**: Simulasi orbit heliosentris real-time dengan kontrol laju waktu Kepler, zoom/rotasi kanvas, pemilihan planet, dan pembedahan data astronomi fisik.
- **Lab Topologi Jaringan & ICMP Ping**: Kanvas jaringan interaktif untuk menghubungkan switch, PC klien, server, dan router dengan simulasi pengiriman paket ping visual, terminal respons ICMP, dan pengujian kegagalan simpul (*single point of failure*).
- **Lab IP Address & Subnetting IPv4**: Dekomposisi 32-bit biner dari subnet mask, kalkulasi instan Network ID, Broadcast ID, usable host range, wildcard, serta tantangan alokasi CIDR.
- **Lab Rasio & Proporsi Matematika 2D**: Manipulasi jumlah objek dinamis dengan penyederhanaan FPB real-time, neraca kesetaraan proporsi, dan tantangan target rasio.
- **Meja Kerja Simulasi Sensorik**: Simulasi variabel bebas/terikat untuk modul Fisika, Kimia, Biologi, dan Elektronika.

### 3. Pengalaman Belajar & Evaluasi
- **Pelacakan Progres Terpusat**: Pelacakan status *In Progress* dan *Completed* berdasarkan penyelesaian aktivitas nyata.
- **Lembar Aktivitas Bertahap**: Checkbox interaktif untuk merekam setiap tahap eksperimen siswa.
- **Kuis Evaluasi Otomatis**: Tes kompetensi dengan skor persentase instan, status kelulusan berdasarkan *passing score*, pembahasan kunci jawaban, dan perayaan kelulusan.
- **Favorit**: Kemampuan menyimpan laboratorium pilihan ke dashboard siswa.

### 4. Sistem Hak Akses (RBAC) & Keamanan
- **Dua Role Utama**: Tepat dua role terpisah: `ADMIN` dan `USER` (Siswa).
- **Server-Side Enforcement**: Validasi izin hak akses dilakukan di Middleware Next.js dan Server Actions, bukan sekadar menyembunyikan tombol di antarmuka pengguna.
- **Prinsip Least Privilege**: Pendaftaran publik selalu menghasilkan role `USER`. Akun `ADMIN` pertama hanya dibuat melalui mekanisme bootstrap database (`npm run db:seed`).
- **Autentikasi Aman**: Kata sandi di-hash menggunakan `bcryptjs` 10-round salt, sesi disimpan dalam token JWT terenkripsi dengan atribut cookie `HTTP-Only`.

### 5. Dashboard Pengguna & Administrasi
- **Dashboard Siswa (`/dashboard`)**: Sapaan personal, tombol lanjut belajar lab terakhir, ringkasan progres, riwayat nilai kuis, daftar favorit, dan rekomendasi modul baru.
- **Dashboard Administrator (`/admin`)**: Ringkasan platform aktual, tabel CRUD laboratorium dengan form terlengkap (slug otomatis, status draft/published/archived, penanda featured), manajemen kategori, jenjang pendidikan kurikulum, manajemen status aktif/nonaktif pengguna, dan log audit operasional.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend**: Next.js 14 (App Router) dengan TypeScript
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Ikon Antarmuka**: Lucide React
- **Grafis & 3D**: Three.js, Canvas, SVG
- **Database**: SQLite (pengembangan lokal instan nol konfigurasi) & PostgreSQL (kompatibel penuh untuk produksi)
- **ORM**: Prisma ORM
- **Validasi Data**: Zod
- **Autentikasi**: JWT Session (HTTP-Only Secure Cookies) + bcryptjs

---

## 📦 Panduan Instalasi & Menjalankan Proyek

### 1. Kloning / Unduh Proyek
Pastikan Node.js v18+ sudah terpasang di sistem Anda.

```bash
cd website-virtual
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` (atau salin dari `.env.example`):

```env
# Database: SQLite untuk kemudahan instalasi lokal out-of-the-box
DATABASE_URL="file:./prisma/dev.db"

# Untuk PostgreSQL (Production / Supabase / Neon):
# DATABASE_URL="postgresql://username:password@localhost:5432/virtual_lab?schema=public"

JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Migrasi & Seeding Database
Jalankan sinkronisasi skema Prisma dan pengisian data awal (*demo laboratories, categories, education levels, and bootstrap users*):

```bash
npx prisma db push
node prisma/seed.js
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Kredensial Akun Pengujian (Demo)

Sistem telah dilengkapi dengan dua akun terkonfigurasi untuk memverifikasi fungsionalitas:

| Role | Email | Kata Sandi | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@virtuallearninglab.id` | `AdminPass123!` | Akses penuh dashboard `/admin`, CRUD modul, kategori, audit log |
| **Siswa / Pengguna** | `siswa@virtuallearninglab.id` | `SiswaPass123!` | Akses dashboard siswa `/dashboard`, pengerjaan lab, kuis, favorit |

> **Catatan Pembuatan Admin Baru**: Demi keamanan, publik tidak dapat membuat akun ber-role `ADMIN` melalui formulir pendaftaran. Admin baru dapat ditambahkan oleh Administrator yang berwenang melalui database atau skrip bootstrap server.

---

## 🗄️ Migrasi ke PostgreSQL untuk Lingkungan Produksi

Untuk beralih dari SQLite ke PostgreSQL di penyedia *cloud* (seperti Supabase, Neon, atau server PostgreSQL lokal):

1. Ubah konfigurasi `datasource db` pada `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Perbarui `DATABASE_URL` pada `.env` dengan kredensial PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://user:password@hostname:5432/database_name?schema=public"
   ```
3. Jalankan pembaruan klien dan migrasi Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   node prisma/seed.js
   ```

---

## 📁 Struktur Direktori Proyek

```
website-virtual/
├── prisma/
│   ├── schema.prisma         # Skema relasional basis data
│   └── seed.js               # Skrip inisialisasi modul lab & akun bootstrap
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions (Auth, Learning, Admin)
│   │   ├── admin/            # Dashboard Administrasi & CRUD Lab/User
│   │   ├── dashboard/        # Dashboard Siswa, Progres, Riwayat, Favorit
│   │   ├── laboratorium/     # Katalog & Halaman Detail Modul Lab
│   │   ├── masuk/ & daftar/  # Autentikasi Pengguna
│   │   ├── tentang/          # Halaman Visi & Misi
│   │   ├── kebijakan-privasi/# Ketentuan Privasi
│   │   ├── ketentuan/        # Ketentuan Penggunaan
│   │   ├── layout.tsx        # Root layout dengan Navbar & Footer
│   │   └── page.tsx          # Halaman Beranda Publik
│   ├── components/
│   │   ├── navbar.tsx        # Navigasi responsif
│   │   ├── footer.tsx        # Footer informasi platform
│   │   ├── lab-card.tsx      # Kartu modul laboratorium
│   │   ├── lab-activity-list # Checklist lembar aktivitas siswa
│   │   ├── lab-quiz-player   # Pemutar kuis evaluasi & scoring
│   │   └── simulations/      # Modul Simulasi Lab (3D Solar, Topology, Subnetting, Ratio)
│   ├── lib/
│   │   ├── auth.ts           # Logika JWT, enkripsi bcrypt, & verifikasi RBAC
│   │   ├── prisma.ts         # Prisma Client singleton
│   │   └── utils.ts          # Utilitas format tanggal, durasi, & badge
│   └── middleware.ts         # Edge Route Protection untuk /admin dan /dashboard
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📋 Batasan Fitur Saat Ini & Rencana Masa Depan

1. **Penyimpanan Berkas Gambar**: Saat ini gambar thumbnail menggunakan referensi URL aman (mis. CDN/Unsplash). Untuk produksi skala besar, integrasi S3/Cloudinary dapat dipasang untuk upload berkas biner langsung dari admin.
2. **Ekspor Sertifikat PDF**: Rencana penambahan unduhan otomatis sertifikat kelulusan laboratorium berbasis PDF bagi siswa yang telah menyelesaikan seluruh aktivitas dan kuis dengan nilai 100%.

---

© 2026 Virtual Learning Lab. Hak Cipta Dilindungi Undang-Undang.
