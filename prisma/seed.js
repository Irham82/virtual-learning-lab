const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Virtual Learning Lab Database Seeding ---');

  // 1. Clean existing data in reverse relation order
  await prisma.auditLog.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.learningProgress.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.learningActivity.deleteMany();
  await prisma.laboratory.deleteMany();
  await prisma.educationLevel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // 2. Create Users
  const passwordAdmin = await bcrypt.hash('AdminPass123!', 10);
  const passwordSiswa = await bcrypt.hash('SiswaPass123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@virtuallearninglab.id',
      passwordHash: passwordAdmin,
      name: 'Administrator Lab',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Kepala Pengelola Platform Laboratorium Virtual',
      isActive: true,
    },
  });

  const siswa = await prisma.user.create({
    data: {
      email: 'siswa@virtuallearninglab.id',
      passwordHash: passwordSiswa,
      name: 'Budi Santoso',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Siswa antusias eksplorasi sains dan komputer.',
      isActive: true,
    },
  });

  console.log(`Created admin (${admin.email}) and demo user (${siswa.email}).`);

  // 3. Create Education Levels
  const levels = [
    { name: 'SD / MI', slug: 'sd-mi', description: 'Tingkat Sekolah Dasar & Madrasah Ibtidaiyah', order: 1 },
    { name: 'SMP / MTs', slug: 'smp-mts', description: 'Tingkat Sekolah Menengah Pertama & MTs', order: 2 },
    { name: 'SMA / MA', slug: 'sma-ma', description: 'Tingkat Sekolah Menengah Atas & MA (IPA/IPS)', order: 3 },
    { name: 'SMK', slug: 'smk', description: 'Tingkat Sekolah Menengah Kejuruan (TIK, Rekayasa, Elektro)', order: 4 },
    { name: 'Perguruan Tinggi / Umum', slug: 'umum', description: 'Tingkat Akademik dan Pengguna Umum', order: 5 },
  ];

  const createdLevels = {};
  for (const lvl of levels) {
    createdLevels[lvl.slug] = await prisma.educationLevel.create({ data: lvl });
  }
  console.log('Created Education Levels.');

  // 4. Create Categories
  const categories = [
    {
      name: 'Matematika',
      slug: 'matematika',
      description: 'Eksperimen rasio, aljabar, geometri interaktif, dan kalkulus visual.',
      icon: 'Calculator',
      color: 'blue',
      order: 1,
    },
    {
      name: 'IPA dan Fisika',
      slug: 'ipa-fisika',
      description: 'Simulasi mekanika, gerak dan gaya, optik, termodinamika, dan gelombang.',
      icon: 'Atom',
      color: 'indigo',
      order: 2,
    },
    {
      name: 'Kimia',
      slug: 'kimia',
      description: 'Struktur atom, ikatan molekul, larutan asam basa, dan reaksi kimia.',
      icon: 'FlaskConical',
      color: 'purple',
      order: 3,
    },
    {
      name: 'Biologi',
      slug: 'biologi',
      description: 'Struktur sel, anatomi organ tubuh, fotosintesis, dan genetika.',
      icon: 'Dna',
      color: 'emerald',
      order: 4,
    },
    {
      name: 'Informatika dan Komputer',
      slug: 'informatika',
      description: 'Jaringan komputer, IP addressing & subnetting, logika sirkuit, dan pemrograman.',
      icon: 'Network',
      color: 'teal',
      order: 5,
    },
    {
      name: 'Astronomi',
      slug: 'astronomi',
      description: 'Simulasi 3D tata surya, orbit planet, fase bulan, dan eksplorasi antariksa.',
      icon: 'Globe',
      color: 'amber',
      order: 6,
    },
    {
      name: 'Elektronika',
      slug: 'elektronika',
      description: 'Hukum Ohm, komponen elektronika dasar, resistor, dan simulasi sirkuit.',
      icon: 'Cpu',
      color: 'rose',
      order: 7,
    },
  ];

  const createdCategories = {};
  for (const cat of categories) {
    createdCategories[cat.slug] = await prisma.category.create({ data: cat });
  }
  console.log('Created Categories.');

  // 5. Create Laboratories
  const labsData = [
    {
      title: 'Lab IPAS SD: Petualangan Mengenal Tata Surya (2D, 3D, AR & VR)',
      slug: 'lab-ipas-sd-tata-surya',
      shortDescription: 'Petualangan seru siswa SD mengenal Matahari dan 8 planet melalui visual 2D kartun, 3D orbit, kamera Augmented Reality (AR), dan kokpit Virtual Reality (VR)!',
      fullDescription: 'Laboratorium Virtual IPAS (Ilmu Pengetahuan Alam dan Sosial) untuk tingkat SD/MI berdasarkan Kurikulum Merdeka. Siswa diajak berpetualang ke luar angkasa dengan 4 mode pengalaman belajar imersif: animasi interaktif 2D dengan suara narasi ramah anak, model 3D orbit Three.js, mode Augmented Reality (AR) yang memproyeksikan planet melayang di atas meja belajar dengan kamera nyata, serta mode Virtual Reality (VR) 360° yang menghadirkan sensasi duduk di kokpit pesawat antariksa.',
      subject: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
      learningObjectives: JSON.stringify([
        'Mengenal Matahari sebagai pusat tata surya yang memancarkan cahaya dan panasnya sendiri.',
        'Menyebutkan dan mengurutkan 8 planet dari yang terdekat hingga terjauh dari Matahari.',
        'Membedakan ciri unik planet (misalnya cincin Saturnus, planet merah Mars, dan Bumi rumah kita).',
        'Mengeksplorasi tata surya menggunakan pengalaman multi-sensori: 2D interaktif, 3D orbit, proyeksi AR, dan kokpit VR.',
      ]),
      prerequisites: 'Rasa ingin tahu dan pengantar dasar tentang siang dan malam.',
      duration: 25,
      difficulty: 'BEGINNER',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      simulationType: 'THREE_D',
      simulationConfig: JSON.stringify({
        modes: ['2D', '3D', 'AR', 'VR'],
        enableVoice: true,
        enableMiniGame: true,
      }),
      instructions: `1. Pilih mode belajar di bagian atas: Mode 2D Edukasi, Mode 3D Orbit, Mode AR (Kamera), atau Mode VR 360°.\n2. Pada Mode 2D: Klik nama planet dan tekan tombol "🔊 Suara Narasi" untuk mendengarkan rahasia planet.\n3. Mainkan tantangan mini-game untuk menyusun 8 planet sesuai urutannya dari Matahari.\n4. Coba Mode AR dengan mengarahkan kamera ke meja belajarmu untuk melihat planet melayang di dunia nyata!\n5. Coba Mode VR untuk merasakan terbang di dalam kokpit pesawat antariksa mengitari planet.`,
      status: 'PUBLISHED',
      featured: true,
      viewCount: 420,
      categoryId: createdCategories['astronomi'].id,
      educationLevelId: createdLevels['sd-mi'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Eksperimen 1: Poros dan Gerak Rotasi Planet',
          description: 'Uji kemiringan poros Bumi (23,5°), Uranus (98°), Venus, dan amati arah putaran serta jam rotasinya.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 2,
          title: 'Eksperimen 2: Revolusi Mengitari Matahari & Garis Orbit',
          description: 'Jalankan Balapan Orbit dan amati bagaimana Merkurius berputar lebih cepat menyelesaikan 1 tahun dibandingkan planet yang jauh.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 3,
          title: 'Eksperimen 3: Perbandingan Skala Ukuran Nyata',
          description: 'Bandingkan ukuran bola planet berdampingan dan temukan berapa banyak Bumi yang muat di dalam Jupiter dan Matahari.',
          taskType: 'SIMULATION',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 4,
          title: 'Eksperimen 4: Mengapa Terjadi Siang dan Malam?',
          description: 'Putar bola Bumi 24 jam dan amati bagaimana Indonesia beralih dari terang siang hari menuju malam gelap berbintang.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 5,
          title: 'Eksperimen 5: Petualangan Menghitung Jarak dan Waktu Tempuh',
          description: 'Luncurkan berkas cahaya dan roket Apollo menuju planet target untuk menghitung waktu tempuh perjalanan antariksa.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 6,
        },
      ],
      quiz: {
        title: 'Kuis Antariksawan Cilik: Rahasia Tata Surya',
        description: 'Uji wawasanmu tentang Matahari dan planet-planet di tata surya!',
        passingScore: 70,
        questions: [
          {
            question: 'Siapakah yang menjadi pusat tata surya dan memancarkan cahaya serta panasnya sendiri?',
            options: JSON.stringify(['Bulan', 'Matahari', 'Bumi', 'Bintang Kejora']),
            correctOptionIndex: 1,
            explanation: 'Matahari adalah bintang raksasa yang menjadi pusat tata surya kita.',
            order: 1,
          },
          {
            question: 'Planet apakah yang menjadi rumah tempat tinggal kita yang memiliki air dan udara sejuk?',
            options: JSON.stringify(['Mars', 'Venus', 'Bumi', 'Merkurius']),
            correctOptionIndex: 2,
            explanation: 'Bumi adalah satu-satunya planet yang diketahui memiliki kehidupan dan air cair.',
            order: 2,
          },
          {
            question: 'Planet manakah yang terkenal paling indah karena memiliki cincin megah dari butiran es dan batu?',
            options: JSON.stringify(['Jupiter', 'Saturnus', 'Neptunus', 'Mars']),
            correctOptionIndex: 1,
            explanation: 'Saturnus dihiasi cincin es raksasa yang sangat spektakuler.',
            order: 3,
          },
          {
            question: 'Planet yang letaknya paling dekat dengan Matahari dan berputar paling cepat adalah...',
            options: JSON.stringify(['Merkurius', 'Venus', 'Uranus', 'Bumi']),
            correctOptionIndex: 0,
            explanation: 'Merkurius adalah planet pertama yang posisinya paling dekat dengan Matahari.',
            order: 4,
          },
        ],
      },
    },
    {
      title: 'Lab Matematika SD: Petualangan Rasio dan Perbandingan (2D, 3D, AR & VR)',
      slug: 'lab-matematika-sd-rasio',
      shortDescription: 'Belajar rasio & perbandingan jadi sangat mudah dan menyenangkan melalui diagram pita 2D, balok 3D, kamera AR di meja, ruang kelas VR, dan 5 eksperimen seru!',
      fullDescription: 'Laboratorium Virtual Matematika SD/MI (Fase C - Kelas 5 & 6) yang dirancang khusus sesuai Kurikulum Merdeka. Siswa diajak memahami konsep rasio dan proporsi secara konkret dan bertahap: visualisasi 2D dengan buah-buahan dan model diagram pita (tape diagram), simulasi menara balok 3D Three.js dengan rotasi spasial, mode Augmented Reality (AR) kamera nyata yang memproyeksikan tumpukan balok di atas meja belajar siswa, mode Virtual Reality (VR 360°) ruang kelas futuristik dengan dukungan kacamata VR Cardboard, serta 5 modul eksperimen sains matematika (resep sirup, skala miniatur, timbangan proporsi, diagram pita, dan lomba kecepatan).',
      subject: 'Matematika SD (Kurikulum Merdeka)',
      learningObjectives: JSON.stringify([
        'Memahami konsep dasar rasio sebagai perbandingan dua besaran atau kumpulan benda (A : B).',
        'Menyederhanakan bentuk rasio menggunakan Faktor Persekutuan Terbesar (FPB).',
        'Menggunakan model diagram pita (tape diagram) untuk memecahkan masalah rasio dan soal cerita.',
        'Menganalisis proporsi senilai dalam kehidupan sehari-hari (resep takaran sirup, skala miniatur, dan rasio kecepatan jarak terhadap waktu).',
        'Mengeksplorasi representasi spasial rasio dalam 4 dimensi media: 2D visual, 3D balok, AR meja nyata, dan VR 360°.'
      ]),
      prerequisites: 'Operasi hitung perkalian dan pembagian dasar bilangan cacah.',
      duration: 30,
      difficulty: 'BEGINNER',
      thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
      simulationType: 'THREE_D',
      simulationConfig: JSON.stringify({
        modes: ['2D', '3D', 'AR', 'VR', 'EKSPERIMEN'],
        enableVoice: true,
        enableTapeDiagram: true,
      }),
      instructions: `1. Pilih mode belajar di bagian atas: Mode 2D Visual, Mode 3D Balok, 🧪 5 Modul Eksperimen, Mode AR (Kamera), atau Mode VR 360°.\n2. Pada Mode 2D: Geser jumlah benda A dan B, amati diagram pita dan klik "Dengarkan Penjelasan" untuk mendengarkan suara narasi.\n3. Mainkan tantangan mini-game "Cari Rasio Senilai" untuk mengumpulkan bintang prestasi.\n4. Pada Mode 3D: Putar kamera 360° dan klik balok untuk melihat informasi tingkat balok.\n5. Coba Mode AR dengan mengarahkan kamera ke meja belajarmu untuk melihat balok rasio melayang di dunia nyata!\n6. Selesaikan seluruh 5 eksperimen interaktif dan kerjakan kuis evaluasi.`,
      status: 'PUBLISHED',
      featured: true,
      viewCount: 380,
      categoryId: createdCategories['matematika'].id,
      educationLevelId: createdLevels['sd-mi'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Eksperimen 1: Resep Sirup Manis (Rasio Takaran Air & Sirup)',
          description: 'Uji rasa takaran sirup terhadap air dan buktikan bahwa rasio 1:3 memiliki rasa yang sama manisnya dengan 2:6 (proporsi senilai).',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 2,
          title: 'Eksperimen 2: Miniatur Mainan & Skala Ukuran (1 : n)',
          description: 'Pelajari konsep rasio skala perbandingan antara panjang mobil mainan dan mobil sesungguhnya.',
          taskType: 'SIMULATION',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 3,
          title: 'Eksperimen 3: Timbangan Proporsi Ajaib (Uji Rasio Senilai)',
          description: 'Seimbangkan piringan neraca dengan memasukkan dua pasangan rasio yang senilai menggunakan pembuktian perkalian silang.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 4,
          title: 'Eksperimen 4: Model Diagram Pita (Soal Cerita Kurikulum Merdeka)',
          description: 'Pecahkan pembagian uang saku dengan membagi total nilai menjadi bagian-bagian kotak satuan diagram pita yang sama besar.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 5,
          title: 'Eksperimen 5: Lomba Kecepatan (Rasio Jarak terhadap Waktu)',
          description: 'Bandingkan rasio laju kecepatan Kancil Cerdas dan Kelinci Cepat dalam lintasan balap untuk memahami konsep perbandingan.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
      ],
      quiz: {
        title: 'Kuis Detektif Rasio Cilik SD: Rahasia Perbandingan',
        description: 'Uji pemahamanmu tentang perbandingan, rasio senilai, dan diagram pita!',
        passingScore: 70,
        questions: [
          {
            question: 'Di dalam keranjang terdapat 6 buah apel dan 8 buah jeruk. Berapakah bentuk paling sederhana dari rasio apel terhadap jeruk?',
            options: JSON.stringify(['2 : 3', '3 : 4', '4 : 5', '6 : 8']),
            correctOptionIndex: 1,
            explanation: 'Kedua angka dibagi dengan FPB yaitu 2: 6 ÷ 2 = 3 dan 8 ÷ 2 = 4, sehingga menjadi 3 : 4.',
            order: 1,
          },
          {
            question: 'Ibu membuat sirup dengan rasio 1 sendok sirup untuk 3 gelas air. Jika Ibu menggunakan 3 sendok sirup, berapa gelas air yang dibutuhkan agar rasa manisnya tetap sama?',
            options: JSON.stringify(['6 gelas', '9 gelas', '12 gelas', '5 gelas']),
            correctOptionIndex: 1,
            explanation: 'Rasio dikalikan 3: 1 × 3 = 3 sirup dan 3 × 3 = 9 gelas air.',
            order: 2,
          },
          {
            question: 'Sebuah mobil mainan memiliki panjang 10 cm dengan skala 1 : 40. Berapakah panjang mobil sesungguhnya?',
            options: JSON.stringify(['200 cm (2 meter)', '400 cm (4 meter)', '40 cm', '100 cm (1 meter)']),
            correctOptionIndex: 1,
            explanation: 'Panjang asli = 10 cm × 40 = 400 cm (atau 4 meter).',
            order: 3,
          },
          {
            question: 'Rasio kelereng Dimas dan Fajar adalah 2 : 3. Jika jumlah kelereng mereka berdua adalah 25 butir, berapa butir kelereng milik Dimas?',
            options: JSON.stringify(['10 butir', '15 butir', '20 butir', '5 butir']),
            correctOptionIndex: 0,
            explanation: 'Total bagian pita = 2 + 3 = 5 bagian. 1 bagian = 25 ÷ 5 = 5 butir. Kelereng Dimas (2 bagian) = 2 × 5 = 10 butir.',
            order: 4,
          },
        ],
      },
    },
    {
      title: 'Lab Matematika SD: Eksplorasi Bangun Ruang & Jaring-Jaring (2D, 3D, AR & VR)',
      slug: 'lab-matematika-sd-bangun-ruang',
      shortDescription: 'Buka dan bedah bangun ruang (Kubus, Balok, Tabung, Kerucut, Prisma, Limas) menjadi jaring-jaring bangun datar pembentuknya secara interaktif dalam 2D, 3D, AR kamera, dan museum VR 360°!',
      fullDescription: 'Laboratorium Virtual Matematika SD/MI (Fase B & C - Kelas 4, 5, 6) sesuai Kurikulum Merdeka untuk mempelajari Bangun Ruang dan Jaring-Jaring secara interaktif. Peserta didik dapat membuka dan merentangkan 7 macam bangun ruang (Kubus, Balok, Tabung, Kerucut, Prisma Segitiga, Limas Segiempat, dan Limas Segitiga) dengan slider animasi halus untuk melihat bangun datar pembentuknya (persegi, persegi panjang, lingkaran, juring lingkaran, dan segitiga). Dilengkapi dengan Mode 2D Edukasi dengan narasi suara ramah anak, Mode 3D Three.js yang dapat diputar 360°, Mode Augmented Reality (AR) di atas meja, Mode Virtual Reality (VR 360°) Ruang Angkasa, serta 5 modul eksperimen sains matematika (identifikasi jaring-jaring, rumus Euler F + V = E + 2, luas permukaan, isi volume kubus satuan, dan Kuis Juara Geometri).',
      subject: 'Matematika SD (Kurikulum Merdeka)',
      learningObjectives: JSON.stringify([
        'Mengenal 7 jenis bangun ruang: Kubus, Balok, Tabung, Kerucut, Prisma Segitiga, Limas Segiempat, dan Limas Segitiga.',
        'Membuka dan melipat jaring-jaring bangun ruang untuk mengidentifikasi bangun datar pembentuknya (persegi, segitiga, lingkaran, persegi panjang, juring).',
        'Menghitung dan memverifikasi jumlah Sisi (F), Titik Sudut (V), dan Rusuk (E) serta membuktikan Rumus Euler: F + V = E + 2.',
        'Memahami konsep luas permukaan sebagai jumlahan luas seluruh bangun datar pembentuknya.',
        'Memvisualisasikan volume bangun ruang melalui pengisian kubus satuan 1x1x1.',
        'Mengeksplorasi bangun ruang dalam 4 dimensi imersif: 2D Edukasi, 3D WebGL, Kamera AR Meja Nyata, dan Museum Antariksa VR 360°.'
      ]),
      prerequisites: 'Pengenalan bangun datar dasar (persegi, persegi panjang, segitiga, lingkaran).',
      duration: 30,
      difficulty: 'BEGINNER',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
      simulationType: 'THREE_D',
      simulationConfig: JSON.stringify({
        modes: ['2D', '3D', 'AR', 'VR', 'EKSPERIMEN'],
        enableVoice: true,
        enableUnfolding: true,
      }),
      instructions: `1. Pilih mode belajar di bagian atas: Mode 2D Edukasi, Mode 3D Interaktif, 🧪 5 Modul Eksperimen, Mode AR (Kamera), atau Mode VR 360°.\n2. Geser penggeser (slider) "Buka Jaring-Jaring (0% - 100%)" untuk melihat proses bangun ruang terbuka menjadi lembaran bidang datar.\n3. Amati perubahan warna pada tiap sisi dan dengarkan penjelasan suara interaktif dengan mengklik tombol "🔊 Dengarkan Narasi".\n4. Pilih bentuk bangun ruang lain pada daftar (Kubus, Balok, Tabung, Kerucut, Prisma Segitiga, Limas Segiempat, Limas Segitiga).\n5. Selesaikan 5 eksperimen interaktif untuk membuktikan Rumus Euler, menghitung luas permukaan, dan mengisi volume kubus satuan!`,
      status: 'PUBLISHED',
      featured: true,
      viewCount: 395,
      categoryId: createdCategories['matematika'].id,
      educationLevelId: createdLevels['sd-mi'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Eksperimen 1: Buka-Tutup Jaring-Jaring & Identifikasi Bangun Datar Pembentuk',
          description: 'Rentangkan kubus dan balok hingga 100% mendatar. Amati bahwa kubus terbentuk dari 6 persegi identik dan balok dari 3 pasang persegi panjang.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 2,
          title: 'Eksperimen 2: Menghitung Sisi, Titik Sudut, Rusuk & Rumus Euler',
          description: 'Hitung jumlah Sisi (F), Titik Sudut (V), dan Rusuk (E) pada Prisma dan Limas, lalu buktikan kebenaran rumus F + V = E + 2.',
          taskType: 'OBSERVATION',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 3,
          title: 'Eksperimen 3: Konsep Luas Permukaan dari Penjumlahan Luas Sisi',
          description: 'Ubah dimensi panjang, lebar, dan tinggi, lalu hitung total luas seluruh bidang datar jaring-jaring yang telah direntangkan.',
          taskType: 'SIMULATION',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 4,
          title: 'Eksperimen 4: Mengisi Volume Bangun Ruang dengan Kubus Satuan 1x1x1',
          description: 'Susun kubus-kubus satuan berukuran 1x1x1 ke dalam balok transparan dan hitung total kapasitas volume (p x l x t).',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 6,
        },
        {
          stepNumber: 5,
          title: 'Eksperimen 5: Kuis Evaluasi Juara Geometri SD',
          description: 'Jawab 5 soal tantangan seputar bangun datar penyusun jaring-jaring, sifat sisi dan rusuk, serta aplikasi dalam kehidupan sehari-hari.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 6,
        },
      ],
      quiz: {
        title: 'Kuis Juara Bangun Ruang & Jaring-Jaring SD',
        description: 'Uji pemahamanmu tentang bangun ruang, bangun datar pembentuk jaring-jaring, dan sifat-sifat geometri!',
        passingScore: 70,
        questions: [
          {
            question: 'Bangun ruang Kubus terbentuk dari jaring-jaring yang terdiri dari berapa bangun datar?',
            options: JSON.stringify(['6 buah Persegi yang sama besar', '6 buah Persegi Panjang', '4 buah Segitiga dan 1 Persegi', '2 buah Lingkaran dan 1 Persegi Panjang']),
            correctOptionIndex: 0,
            explanation: 'Kubus memiliki 6 sisi datar yang semuanya berbentuk bujur sangkar / persegi kongruen (sama besar).',
            order: 1,
          },
          {
            question: 'Jika jaring-jaring tabung dibuka dan direntangkan, bangun datar apakah yang membentuk selimut dan alas/tutupnya?',
            options: JSON.stringify(['1 Persegi Panjang (selimut) dan 2 Lingkaran (alas & tutup)', '2 Segitiga dan 3 Persegi Panjang', '1 Juring Lingkaran dan 1 Lingkaran', '4 Persegi dan 2 Lingkaran']),
            correctOptionIndex: 0,
            explanation: 'Tabung tersusun atas 2 lingkaran identik sebagai tutup dan alas, serta 1 persegi panjang melengkung sebagai selimut tabung dengan panjang = 2 x pi x r.',
            order: 2,
          },
          {
            question: 'Bangun ruang Kerucut tersusun dari bangun datar apa sajakah ketika jaring-jaringnya dibuka?',
            options: JSON.stringify(['1 Lingkaran (alas) dan 1 Juring Lingkaran (selimut)', '2 Segitiga dan 1 Persegi', '1 Lingkaran dan 1 Persegi Panjang', '3 Segitiga sama sisi']),
            correctOptionIndex: 0,
            explanation: 'Selimut kerucut yang melengkung ketika dibuka mendatar berbentuk juring lingkaran (sektor), dan alasnya berbentuk lingkaran utuh.',
            order: 3,
          },
          {
            question: 'Sebuah Limas Segiempat memiliki sisi alas berbentuk persegi dan sisi tegak berbentuk...',
            options: JSON.stringify(['4 buah Segitiga', '4 buah Persegi Panjang', '2 buah Lingkaran', '1 buah Trapesium']),
            correctOptionIndex: 0,
            explanation: 'Sisi tegak limas segiempat terdiri dari 4 segitiga yang puncaknya bertemu di satu titik sudut teratas.',
            order: 4,
          },
          {
            question: 'Berdasarkan Rumus Euler (Sisi + Titik Sudut = Rusuk + 2), sebuah prisma segitiga memiliki 5 sisi dan 6 titik sudut. Berapakah jumlah rusuknya?',
            options: JSON.stringify(['9 rusuk', '6 rusuk', '12 rusuk', '8 rusuk']),
            correctOptionIndex: 0,
            explanation: 'Rumus Euler: F + V = E + 2. Maka 5 + 6 = E + 2 -> 11 = E + 2 -> E = 9 rusuk (3 di alas, 3 di tutup, 3 tegak).',
            order: 5,
          },
        ],
      },
    },
    {
      title: 'Lab Rasio dan Proporsi Matematika',
      slug: 'lab-rasio-matematika',
      shortDescription: 'Eksplorasi konsep rasio, perbandingan senilai, dan skala melalui simulasi visual dinamis.',
      fullDescription: 'Laboratorium interaktif ini dirancang untuk membantu siswa memahami konsep abstrak perbandingan dan rasio matematika secara visual. Siswa dapat memanipulasi jumlah objek apel dan jeruk, mengatur rasio target, mengamati timbangan perbandingan real-time, serta memecahkan tantangan proporsi dalam kehidupan sehari-hari.',
      subject: 'Matematika',
      learningObjectives: JSON.stringify([
        'Memahami definisi rasio dan cara penulisan perbandingan (A:B).',
        'Mengidentifikasi hubungan proporsional senilai saat salah satu variabel ditingkatkan.',
        'Menganalisis bentuk sederhana dari suatu pecahan atau perbandingan rasio.',
        'Menerapkan perbandingan dalam penyelesaian masalah skala dan takaran praktis.',
      ]),
      prerequisites: 'Operasi perkalian dan pembagian dasar bilangan cacah.',
      duration: 35,
      difficulty: 'BEGINNER',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      simulationType: 'TWO_D',
      simulationConfig: JSON.stringify({
        initialA: 4,
        initialB: 6,
        theme: 'fruit-scale',
        allowCustomValues: true,
      }),
      instructions: `1. Geser slider Jumlah Objek A dan Objek B pada panel kontrol.\n2. Amati perbandingan rasio real-time dan bentuk rasio yang disederhanakan.\n3. Uji fitur Neraca Keseimbangan untuk melihat apakah proporsi bernilai setara.\n4. Selesaikan seluruh lembar aktivitas di panel samping dan ikuti kuis evaluasi.`,
      status: 'PUBLISHED',
      featured: true,
      viewCount: 142,
      categoryId: createdCategories['matematika'].id,
      educationLevelId: createdLevels['smp-mts'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Eksplorasi Nilai Rasio Dasar',
          description: 'Atur objek A = 6 dan objek B = 9. Catat perbandingan yang disederhanakan pada sistem.',
          taskType: 'SIMULATION',
          estimatedMinutes: 8,
        },
        {
          stepNumber: 2,
          title: 'Uji Proporsi Setara',
          description: 'Gunakan neraca keseimbangan untuk membandingkan rasio 4:6 dengan 10:15. Amati apakah seimbang.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 10,
        },
        {
          stepNumber: 3,
          title: 'Aplikasi Skala Peta',
          description: 'Hitung jarak sesungguhnya jika rasio skala peta adalah 1:50000 dengan jarak 3 cm.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 12,
        },
      ],
      quiz: {
        title: 'Kuis Evaluasi Rasio dan Proporsi',
        description: 'Uji pemahaman Anda mengenai penyederhanaan rasio dan perhitungan proporsi.',
        passingScore: 70,
        questions: [
          {
            question: 'Bentuk paling sederhana dari rasio 18 : 24 adalah...',
            options: JSON.stringify(['2 : 3', '3 : 4', '4 : 5', '6 : 8']),
            correctOptionIndex: 1,
            explanation: 'Membagi kedua angka dengan FPB yaitu 6 menghasilkan 18/6 = 3 dan 24/6 = 4, sehingga menjadi 3:4.',
            order: 1,
          },
          {
            question: 'Jika rasio siswa laki-laki terhadap perempuan adalah 3 : 5 dan ada 15 siswa laki-laki, berapa jumlah siswa perempuan?',
            options: JSON.stringify(['20 orang', '25 orang', '30 orang', '18 orang']),
            correctOptionIndex: 1,
            explanation: 'Faktor pengali = 15 / 3 = 5. Maka jumlah perempuan = 5 * 5 = 25 orang.',
            order: 2,
          },
          {
            question: 'Manakah dari perbandingan berikut yang setara dengan 2 : 5?',
            options: JSON.stringify(['4 : 8', '6 : 15', '10 : 20', '8 : 16']),
            correctOptionIndex: 1,
            explanation: '2:5 dikalikan 3 pada kedua sisi menghasilkan 6:15.',
            order: 3,
          },
        ],
      },
    },
    {
      title: 'Lab Virtual Tata Surya 3D Interaktif',
      slug: 'lab-virtual-tata-surya',
      shortDescription: 'Jelajahi orbit planet, kecepatan revolusi, jarak relatif, dan karakteristik planet sistem tata surya.',
      fullDescription: 'Simulasi astronomi 3D interaktif yang menyajikan sistem tata surya kita. Pengguna dapat mengamati Matahari dan planet-planet (Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus dengan cincinnya, Uranus, dan Neptunus). Pengguna dapat memutar sudut pandang kamera, mempercepat laju waktu orbit, memilih planet untuk mempelajari data fisik, serta memverifikasi Hukum Kepler.',
      subject: 'Astronomi',
      learningObjectives: JSON.stringify([
        'Mengidentifikasi urutan planet dari yang terdekat hingga terjauh dari Matahari.',
        'Menganalisis hubungan antara jarak planet dari Matahari dengan periode revolusinya (Hukum Keplar III).',
        'Memahami karakteristik fisik planet batuan (terestrial) dan planet gas raksasa.',
        'Mengeksplorasi simulasi rotasi dan revolusi benda langit dalam representasi 3D.',
      ]),
      prerequisites: 'Konsep dasar gravitasi dan struktur tata surya.',
      duration: 45,
      difficulty: 'INTERMEDIATE',
      thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80',
      simulationType: 'THREE_D',
      simulationConfig: JSON.stringify({
        defaultSpeed: 1.0,
        enableOrbits: true,
        enableLabels: true,
      }),
      instructions: `1. Gunakan klik dan geser mouse untuk memutar sudut pandang 3D orbit tata surya.\n2. Gunakan scroll mouse untuk zoom in dan zoom out.\n3. Klik salah satu planet untuk memfokuskan kamera dan membuka kartu spesifikasi astronomi.\n4. Atur penggeser kecepatan waktu untuk mengamati rotasi dan revolusi planet.`,
      status: 'PUBLISHED',
      featured: true,
      viewCount: 318,
      categoryId: createdCategories['astronomi'].id,
      educationLevelId: createdLevels['smp-mts'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Pengamatan Periode Orbit Planet Terestrial',
          description: 'Pilih Merkurius dan Bumi, bandingkan kecepatan revolusi keduanya saat simulasi berjalan.',
          taskType: 'OBSERVATION',
          estimatedMinutes: 10,
        },
        {
          stepNumber: 2,
          title: 'Analisis Cincin Saturnus dan Karakteristik Gas Raksasa',
          description: 'Fokuskan pandangan pada Saturnus dan Jupiter, telusuri komposisi atmosfer dan jari-jarinya.',
          taskType: 'SIMULATION',
          estimatedMinutes: 12,
        },
        {
          stepNumber: 3,
          title: 'Verifikasi Hukum Kepler',
          description: 'Catat rasio jarak terhadap kuadrat waktu orbit planet untuk membuktikan hukum pergerakan planet.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 15,
        },
      ],
      quiz: {
        title: 'Kuis Astronomi Tata Surya',
        description: 'Uji wawasan Anda mengenai struktur dan orbit tata surya.',
        passingScore: 70,
        questions: [
          {
            question: 'Planet apakah yang memiliki periode revolusi paling singkat mengelilingi Matahari?',
            options: JSON.stringify(['Venus', 'Merkurius', 'Mars', 'Bumi']),
            correctOptionIndex: 1,
            explanation: 'Merkurius adalah planet terdekat dengan Matahari sehingga lintas orbitnya paling pendek dan kecepatan orbitnya paling tinggi.',
            order: 1,
          },
          {
            question: 'Planet berikut yang tergolong sebagai planet terestrial (batuan) adalah...',
            options: JSON.stringify(['Jupiter', 'Saturnus', 'Mars', 'Neptunus']),
            correctOptionIndex: 2,
            explanation: 'Mars, bersama Merkurius, Venus, dan Bumi, merupakan planet kebumian yang tersusun atas batuan padat.',
            order: 2,
          },
          {
            question: 'Menurut Hukum Kepler III, semakin jauh jarak suatu planet dari Matahari, maka periode orbitnya akan...',
            options: JSON.stringify(['Semakin cepat', 'Tetap sama', 'Semakin lama', 'Menjadi nol']),
            correctOptionIndex: 2,
            explanation: 'Kuadrat periode revolusi berbanding lurus dengan pangkat tiga jarak rata-rata ke Matahari (T^2 ~ R^3).',
            order: 3,
          },
        ],
      },
    },
    {
      title: 'Lab Jaringan Komputer: Perancang Topologi',
      slug: 'lab-jaringan-topologi',
      shortDescription: 'Rancang arsitektur topologi jaringan komputer (Star, Bus, Ring, Mesh) dan uji konektivitas paket data.',
      fullDescription: 'Simulator jaringan interaktif di mana pengguna dapat menambahkan perangkat seperti Switch, Router, Server, dan PC ke dalam kanvas virtual. Hubungkan perangkat menggunakan kabel virtual, konfigurasikan IP address, serta kirimkan paket ping visual untuk menguji jalur komunikasi dan memahami kelebihan serta kelemahan masing-masing topologi.',
      subject: 'Informatika',
      learningObjectives: JSON.stringify([
        'Mengenal perangkat keras jaringan: Switch, Router, Server, dan Workstation (PC).',
        'Memahami karakteristik topologi Star, Bus, Ring, dan Mesh.',
        'Mengonfigurasi pengkabelan dan skema alamat jaringan sederhana.',
        'Menganalisis pengiriman paket ICMP (Ping) dan dampak kegagalan satu simpul (single point of failure).',
      ]),
      prerequisites: 'Konsep dasar sistem komputer dan internet.',
      duration: 50,
      difficulty: 'INTERMEDIATE',
      thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
      simulationType: 'WEB_INTERACTIVE',
      simulationConfig: JSON.stringify({
        canvasWidth: 800,
        canvasHeight: 500,
        allowPacketSimulation: true,
      }),
      instructions: `1. Pilih perangkat pada toolbox: Komputer (PC), HUB/Switch, Server, atau Router, lalu klik di kanvas untuk menempatkannya.\n2. Klik dan geser (drag & drop) perangkat untuk menata posisi layout topologi.\n3. Pilih jenis kabel: Kabel Straight (untuk beda perangkat) atau Kabel Cross (untuk perangkat sejenis), lalu klik perangkat asal dan tujuan.\n4. Klik ikon gerigi untuk membuka dialog konfigurasi IP Address, Subnet Mask, dan Default Gateway.\n5. Buka tab "Uji Kirim Paket (Ping)" untuk memvalidasi alur komunikasi data ICMP mirip Cisco Packet Tracer!`,
      status: 'PUBLISHED',
      featured: true,
      viewCount: 275,
      categoryId: createdCategories['informatika'].id,
      educationLevelId: createdLevels['smk'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Membangun Topologi Star Sederhana',
          description: 'Tempatkan 1 Switch di tengah dan sambungkan 4 PC klien. Uji koneksi ping antara PC1 dan PC3.',
          taskType: 'SIMULATION',
          estimatedMinutes: 15,
        },
        {
          stepNumber: 2,
          title: 'Integrasi Server dan Uji Layanan',
          description: 'Tambahkan Server Web dan hubungkan ke Switch. Pastikan semua klien dapat menjangkau Server.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 15,
        },
        {
          stepNumber: 3,
          title: 'Analisis Titik Kegagalan Tunggal',
          description: 'Matikan atau hapus simpul switch pusat dan amati dampaknya terhadap seluruh jaringan.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 10,
        },
      ],
      quiz: {
        title: 'Kuis Topologi Jaringan Komputer',
        description: 'Uji kompetensi mengenai desain jaringan dan alur data.',
        passingScore: 70,
        questions: [
          {
            question: 'Topologi jaringan manakah yang menggunakan satu node konsentrator pusat (seperti Switch)?',
            options: JSON.stringify(['Topologi Bus', 'Topologi Star', 'Topologi Ring', 'Topologi Mesh']),
            correctOptionIndex: 1,
            explanation: 'Topologi Star menghubungkan semua node klien ke satu perangkat konsentrator sentral seperti switch atau hub.',
            order: 1,
          },
          {
            question: 'Kelemahan utama dari topologi Bus tradisional adalah...',
            options: JSON.stringify([
              'Memerlukan kabel paling banyak',
              'Jika kabel utama (backbone) putus, seluruh jaringan akan lumpuh',
              'Sangat sulit dikonfigurasi pada perangkat PC modern',
              'Membutuhkan banyak router berkecepatan tinggi',
            ]),
            correctOptionIndex: 1,
            explanation: 'Pada topologi bus, seluruh perangkat berbagi satu media transmisi. Kerusakan kabel utama memutus jalur seluruh segmen.',
            order: 2,
          },
          {
            question: 'Protokol yang umum digunakan untuk menguji ketercapaian koneksi (ping) antar perangkat adalah...',
            options: JSON.stringify(['HTTP', 'FTP', 'ICMP', 'SMTP']),
            correctOptionIndex: 2,
            explanation: 'Ping menggunakan pesan Internet Control Message Protocol (ICMP) echo request dan echo reply.',
            order: 3,
          },
        ],
      },
    },
    {
      title: 'Lab IP Address dan Subnetting Interaktif',
      slug: 'lab-ip-subnetting',
      shortDescription: 'Pelajari kalkulasi IPv4, CIDR prefix, Network ID, Broadcast ID, dan pembagian host praktis.',
      fullDescription: 'Platform kalkulator dan simulasi logika perhitungan subnetting IPv4. Pengguna dapat memasukkan alamat IP dan memilih notasi CIDR (/24, /26, /27, dsb.) untuk melihat representasi biner dari subnet mask, menghitung rentang host yang valid, menganalisis subnetting classless (VLSM), serta menguji kemampuan menyelesaikan skenario alokasi IP.',
      subject: 'Teknik Jaringan Komputer',
      learningObjectives: JSON.stringify([
        'Memahami struktur alamat IPv4 32-bit dalam format notasi desimal bertitik.',
        'Menghitung Subnet Mask, Netmask Biner, dan panjang prefix CIDR.',
        'Menentukan Network Address, Broadcast Address, dan rentang Usable Host.',
        'Membagi satu blok jaringan besar menjadi beberapa subnet yang lebih efisien.',
      ]),
      prerequisites: 'Konsep bilangan biner dasar dan pengantar jaringan komputer.',
      duration: 40,
      difficulty: 'INTERMEDIATE',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      simulationType: 'WEB_INTERACTIVE',
      simulationConfig: JSON.stringify({
        defaultIp: '192.168.10.0',
        defaultCidr: 26,
      }),
      instructions: `1. Masukkan alamat IP host dan geser slider prefix CIDR (contoh: 192.168.10.45/26).\n2. Buka tab "📖 Cara Menghitung (5 Elemen)" untuk mempelajari langkah demi langkah konversi biner dan rumus subnetting.\n3. Pahami cara mencari Subnet Mask, Jumlah Subnet (2ˣ), IP Network (256 - Mask), IP Broadcast, dan IP Valid (2ʸ - 2).\n4. Periksa Peta Pembagian Blok Subnet pada tabel interaktif untuk melihat subnet tempat IP berada.\n5. Buka tab "Latihan Mandiri" untuk menguji kemampuan perhitungan Anda!`,
      status: 'PUBLISHED',
      featured: true,
      viewCount: 204,
      categoryId: createdCategories['informatika'].id,
      educationLevelId: createdLevels['smk'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Langkah 1: Menghitung Subnetting & Subnet Mask',
          description: 'Pelajari dekomposisi biner 32-bit dari prefix CIDR dan lakukan konversi oktet ke notasi desimal bertitik.',
          taskType: 'SIMULATION',
          estimatedMinutes: 8,
        },
        {
          stepNumber: 2,
          title: 'Langkah 2: Menghitung Jumlah Subnet (Rumus 2ˣ)',
          description: 'Hitung banyaknya bit 1 yang dipinjam dari host (x) dan tentukan jumlah sub-jaringan yang terbentuk.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 8,
        },
        {
          stepNumber: 3,
          title: 'Langkah 3: Menghitung IP Network (Alamat Jaringan)',
          description: 'Gunakan rumus interval blok subnet (256 - nilai oktet mask) dan tentukan alamat network pengenal segmen.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 8,
        },
        {
          stepNumber: 4,
          title: 'Langkah 4: Menghitung IP Broadcast',
          description: 'Tentukan alamat siaran tertinggi di setiap blok subnet dengan mengurangkan 1 dari alamat network subnet berikutnya.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 8,
        },
        {
          stepNumber: 5,
          title: 'Langkah 5: Menghitung Jumlah Host & Rentang IP Valid',
          description: 'Gunakan rumus 2ʸ - 2 untuk mencari host yang dapat digunakan serta tentukan rentang dari First Host hingga Last Host.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 8,
        },
      ],
      quiz: {
        title: 'Kuis Evaluasi Subnetting IPv4',
        description: 'Uji kemampuan menghitung subnet mask dan alokasi IP.',
        passingScore: 70,
        questions: [
          {
            question: 'Berapakah subnet mask desimal untuk prefix CIDR /26?',
            options: JSON.stringify(['255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224']),
            correctOptionIndex: 2,
            explanation: '/26 meminjam 2 bit host di oktet terakhir: 128 + 64 = 192, sehingga mask adalah 255.255.255.192.',
            order: 1,
          },
          {
            question: 'Berapa jumlah host yang dapat digunakan (usable host) pada subnet dengan prefix /29?',
            options: JSON.stringify(['6 host', '8 host', '14 host', '16 host']),
            correctOptionIndex: 0,
            explanation: 'Bit host yang tersisa = 32 - 29 = 3 bit. Total host = 2^3 = 8. Usable host = 8 - 2 = 6 host.',
            order: 2,
          },
          {
            question: 'Pada IP 192.168.1.130/25, manakah alamat broadcast untuk subnet tersebut?',
            options: JSON.stringify(['192.168.1.127', '192.168.1.255', '192.168.1.128', '192.168.1.0']),
            correctOptionIndex: 1,
            explanation: 'Subnet kedua untuk /25 mencakup rentang 192.168.1.128 sampai 192.168.1.255, sehingga broadcast-nya adalah .255.',
            order: 3,
          },
        ],
      },
    },
    {
      title: 'Lab Fisika: Simulasi Gerak dan Gaya (Hukum Newton)',
      slug: 'lab-fisika-gerak-gaya',
      shortDescription: 'Eksperimen virtual Hukum Newton, gaya gesek, percepatan massa, dan bidang miring interaktif.',
      fullDescription: 'Laboratorium mekanika fisika virtual yang memungkinkan peserta didik mengaplikasikan gaya dorong pada balok dengan variasi massa, koefisien gesekan statis/kinetis, dan gravitasi. Grafik percepatan, kecepatan, dan posisi digambar secara langsung saat simulasi berjalan.',
      subject: 'Fisika',
      learningObjectives: JSON.stringify([
        'Membuktikan Hukum Newton II: F = m * a secara eksperimen.',
        'Menganalisis pengaruh koefisien gesekan terhadap perlambatan benda.',
        'Menginterpretasikan grafik perpindahan dan kecepatan terhadap waktu.',
      ]),
      prerequisites: 'Besaran dan satuan, konsep kecepatan dan percepatan.',
      duration: 35,
      difficulty: 'BEGINNER',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
      simulationType: 'TWO_D',
      simulationConfig: JSON.stringify({ defaultMass: 5, defaultFriction: 0.2 }),
      instructions: `1. Tentukan massa balok (kg) pada slider kontrol.\n2. Tentukan gaya dorong F (Newton) yang diberikan.\n3. Tekan tombol "Mulai Gerak" untuk menjalankan simulasi fisik.\n4. Amati vektor gaya dan perubahan kurva kecepatan pada diagram.`,
      status: 'PUBLISHED',
      featured: false,
      viewCount: 160,
      categoryId: createdCategories['ipa-fisika'].id,
      educationLevelId: createdLevels['sma-ma'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Eksperimen Hubungan Gaya dan Percepatan',
          description: 'Gunakan massa tetap 2 kg, ubah gaya dorong dari 10 N ke 20 N. Catat perbandingan percepatan.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 12,
        },
      ],
      quiz: {
        title: 'Kuis Hukum Newton dan Gaya',
        description: 'Uji pemahaman dinamika gerak lurus.',
        passingScore: 70,
        questions: [
          {
            question: 'Sebuah benda bermassa 4 kg didorong dengan gaya 20 N tanpa gesekan. Berapakah percepatannya?',
            options: JSON.stringify(['5 m/s²', '10 m/s²', '2 m/s²', '80 m/s²']),
            correctOptionIndex: 0,
            explanation: 'a = F / m = 20 / 4 = 5 m/s².',
            order: 1,
          },
        ],
      },
    },
    {
      title: 'Lab Kimia: Model Struktur Atom Bohr & Orbital',
      slug: 'lab-kimia-struktur-atom',
      shortDescription: 'Bangun atom unsur kimia dengan menambahkan proton, neutron, elektron dan amati konfigurasi kulit atom.',
      fullDescription: 'Simulasi atom interaktif yang memungkinkan siswa menyusun partikel subatomik (proton, neutron, dan elektron) ke dalam inti dan kulit atom. Sistem secara otomatis menampilkan nama unsur pada tabel periodik, nomor atom, nomor massa, serta status kestabilan dan muatan listrik ion.',
      subject: 'Kimia',
      learningObjectives: JSON.stringify([
        'Menentukan jumlah proton, elektron, dan neutron dari nomor atom dan massa.',
        'Mengonfigurasi elektron berdasarkan model kulit atom Niels Bohr.',
        'Membedakan atom netral, ion positif (kation), dan ion negatif (anion).',
      ]),
      prerequisites: 'Pengantar unsur dan senyawa kimia.',
      duration: 30,
      difficulty: 'BEGINNER',
      thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
      simulationType: 'TWO_D',
      simulationConfig: JSON.stringify({ maxProtons: 18 }),
      instructions: `1. Klik tombol (+) untuk menambah proton ke dalam inti atom.\n2. Tambahkan neutron untuk menjaga stabilitas inti.\n3. Tambahkan elektron ke orbit kulit atom (K, L, M).\n4. Amati identitas unsur yang terbentuk pada kartu tabel periodik.`,
      status: 'PUBLISHED',
      featured: false,
      viewCount: 189,
      categoryId: createdCategories['kimia'].id,
      educationLevelId: createdLevels['sma-ma'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Membangun Atom Karbon (C-12)',
          description: 'Susun 6 proton, 6 neutron, dan 6 elektron. Periksa apakah atom netral dan stabil.',
          taskType: 'SIMULATION',
          estimatedMinutes: 10,
        },
      ],
      quiz: {
        title: 'Kuis Partikel Penyusun Atom',
        description: 'Uji pengetahuan proton, neutron, dan elektron.',
        passingScore: 70,
        questions: [
          {
            question: 'Nomor atom suatu unsur ditentukan secara eksklusif oleh jumlah...',
            options: JSON.stringify(['Neutron', 'Proton', 'Elektron kulit terluar', 'Nukleon total']),
            correctOptionIndex: 1,
            explanation: 'Nomor atom (Z) menyatakan jumlah proton di dalam inti atom unsur tersebut.',
            order: 1,
          },
        ],
      },
    },
    {
      title: 'Lab Biologi: Eksplorasi Sel Hewan dan Tumbuhan',
      slug: 'lab-biologi-sel-organ',
      shortDescription: 'Mikroskop virtual resolusi tinggi untuk membedah organel sel tumbuhan dan sel hewan.',
      fullDescription: 'Laboratorium mikroskopi biologi interaktif. Pengguna dapat memilih preparat sel tumbuhan atau sel hewan, menyesuaikan pembesaran lensa objektif mikroskop, mengidentifikasi organel (Nukleus, Mitokondria, Kloroplas, Vakuola, Dinding Sel), serta mempelajari fungsi fisiologis masing-masing komponen seluler.',
      subject: 'Biologi',
      learningObjectives: JSON.stringify([
        'Membedakan struktur organel khas sel tumbuhan dan sel hewan.',
        'Menjelaskan fungsi organel mitokondria, kloroplas, dan membran sel.',
        'Mengoperasikan mikroskop virtual dengan pengaturan fokus dan perbesaran.',
      ]),
      prerequisites: 'Konsep dasar makhluk hidup dan organisasi kehidupan.',
      duration: 35,
      difficulty: 'BEGINNER',
      thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop&q=80',
      simulationType: 'WEB_INTERACTIVE',
      simulationConfig: JSON.stringify({ magnificationLevels: [100, 400, 1000] }),
      instructions: `1. Pilih sampel preparat (Daun Elodea atau Sel Epitel Pipi).\n2. Geser fokus mikroskop dan pilih perbesaran (40x, 100x, 400x).\n3. Klik pada penanda organel untuk membaca anotasi ilmiah fungsinya.`,
      status: 'PUBLISHED',
      featured: false,
      viewCount: 145,
      categoryId: createdCategories['biologi'].id,
      educationLevelId: createdLevels['smp-mts'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Identifikasi Dinding Sel dan Kloroplas',
          description: 'Amati preparat sel tumbuhan dan temukan kloroplas berwarna hijau serta dinding sel kaku.',
          taskType: 'OBSERVATION',
          estimatedMinutes: 12,
        },
      ],
      quiz: {
        title: 'Kuis Struktur Seluler',
        description: 'Uji perbedaan sel hewan dan sel tumbuhan.',
        passingScore: 70,
        questions: [
          {
            question: 'Organel sel berikut yang hanya dijumpai pada sel tumbuhan adalah...',
            options: JSON.stringify(['Mitokondria', 'Kloroplas', 'Ribosom', 'Retikulum Endoplasma']),
            correctOptionIndex: 1,
            explanation: 'Kloroplas berperan dalam fotosintesis dan terdapat pada sel tumbuhan.',
            order: 1,
          },
        ],
      },
    },
    {
      title: 'Lab Elektronika: Rangkaian Listrik dan Hukum Ohm',
      slug: 'lab-elektronika-hukum-ohm',
      shortDescription: 'Simulasi sirkuit seri-paralel, resistor gelang warna, multimeter virtual, dan tegangan arus listrik.',
      fullDescription: 'Laboratorium virtual elektronika dasar untuk mempelajari hubungan antara tegangan (Volt), arus (Ampere), dan hambatan (Ohm). Susun rangkaian resistor secara seri dan paralel, pasang voltmeter dan amperemeter virtual, serta analisis penurunan tegangan sesuai Hukum Ohm (V = I * R).',
      subject: 'Elektronika',
      learningObjectives: JSON.stringify([
        'Memahami formulasi Hukum Ohm: V = I * R.',
        'Membaca kode gelang warna resistor.',
        'Menganalisis pembagi tegangan pada rangkaian seri dan pembagi arus pada rangkaian paralel.',
      ]),
      prerequisites: 'Konsep dasar arus listrik dan muatan.',
      duration: 40,
      difficulty: 'INTERMEDIATE',
      thumbnail: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80',
      simulationType: 'WEB_INTERACTIVE',
      simulationConfig: JSON.stringify({ defaultVoltage: 9, defaultResistor: 220 }),
      instructions: `1. Hubungkan sumber baterai DC dengan resistor pada papan roti (breadboard).\n2. Geser nilai tegangan baterai dan resistansi resistor.\n3. Perhatikan jarum multimeter virtual untuk membaca arus listrik yang mengalir.`,
      status: 'PUBLISHED',
      featured: false,
      viewCount: 167,
      categoryId: createdCategories['elektronika'].id,
      educationLevelId: createdLevels['smk'].id,
      createdById: admin.id,
      publishedAt: new Date(),
      activities: [
        {
          stepNumber: 1,
          title: 'Verifikasi Hukum Ohm dengan Multimeter',
          description: 'Ukur arus dengan tegangan 12V dan hambatan 100 Ohm. Bandingkan dengan perhitungan teoritis.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 15,
        },
      ],
      quiz: {
        title: 'Kuis Rangkaian dan Hukum Ohm',
        description: 'Uji kalkulasi tegangan dan arus listrik.',
        passingScore: 70,
        questions: [
          {
            question: 'Jika tegangan listrik adalah 12 Volt dan resistor bernilai 4 Ohm, berapakah arus yang mengalir?',
            options: JSON.stringify(['3 Ampere', '48 Ampere', '0.33 Ampere', '8 Ampere']),
            correctOptionIndex: 0,
            explanation: 'I = V / R = 12 / 4 = 3 Ampere.',
            order: 1,
          },
        ],
      },
    },
  ];

  for (const lab of labsData) {
    const { activities, quiz, ...labFields } = lab;
    const createdLab = await prisma.laboratory.create({
      data: labFields,
    });

    // Create activities
    const createdActivities = [];
    if (activities && activities.length > 0) {
      for (const act of activities) {
        const ca = await prisma.learningActivity.create({
          data: {
            ...act,
            laboratoryId: createdLab.id,
          },
        });
        createdActivities.push(ca);
      }
    }

    // Create quiz
    if (quiz) {
      const { questions, ...quizFields } = quiz;
      const createdQuiz = await prisma.quiz.create({
        data: {
          ...quizFields,
          laboratoryId: createdLab.id,
        },
      });

      if (questions && questions.length > 0) {
        for (const q of questions) {
          await prisma.quizQuestion.create({
            data: {
              ...q,
              quizId: createdQuiz.id,
            },
          });
        }
      }
    }

    // Give the demo user initial progress on Lab Rasio and Lab Tata Surya
    if (lab.slug === 'lab-rasio-matematika' && createdActivities.length > 0) {
      const actIds = [createdActivities[0].id];
      await prisma.learningProgress.create({
        data: {
          userId: siswa.id,
          laboratoryId: createdLab.id,
          status: 'IN_PROGRESS',
          completedActivityIds: JSON.stringify(actIds),
          timeSpentSeconds: 640,
          lastAccessedAt: new Date(),
        },
      });

      await prisma.favorite.create({
        data: {
          userId: siswa.id,
          laboratoryId: createdLab.id,
        },
      });
    }

    if (lab.slug === 'lab-virtual-tata-surya') {
      await prisma.favorite.create({
        data: {
          userId: siswa.id,
          laboratoryId: createdLab.id,
        },
      });
    }
  }

  console.log(`Seeded ${labsData.length} comprehensive laboratories.`);

  // 6. Create initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'PLATFORM_INITIALIZATION',
      entity: 'System',
      entityId: 'BOOTSTRAP',
      details: JSON.stringify({ message: 'Platform Virtual Learning Lab diinisialisasi dengan data modul sains lengkap.' }),
      ipAddress: '127.0.0.1',
    },
  });

  // 7. Create Site Settings
  const settings = [
    { key: 'site_name', value: 'Virtual Learning Lab', description: 'Nama resmi platform laboratorium virtual' },
    { key: 'site_tagline', value: 'Jelajahi Ilmu Pengetahuan Melalui Laboratorium Virtual', description: 'Tagline utama beranda' },
    { key: 'contact_email', value: 'kontak@virtuallearninglab.id', description: 'Email resmi pengelola' },
    { key: 'contact_phone', value: '+62 812-3456-7890', description: 'Nomor narahubung platform' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.create({ data: s });
  }

  console.log('Seeded Site Settings and Audit Logs.');
  console.log('--- Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
