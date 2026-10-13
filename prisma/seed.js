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
      instructions: `1. Pilih perangkat (PC, Switch, Router, Server) dari palet alat di sebelah kiri.\n2. Klik pada area kerja kanvas untuk meletakkan perangkat.\n3. Gunakan mode "Koneksi" untuk menghubungkan dua perangkat dengan kabel link.\n4. Klik "Kirim Tes Ping" dari satu PC ke PC lain atau Server untuk memvisualisasikan paket data bergerak.`,
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
      instructions: `1. Masukkan alamat IP pada kolom input (contoh: 192.168.1.0).\n2. Pilih panjang prefix CIDR (dari /8 hingga /30).\n3. Pelajari tabel konversi biner dan dekomposisi bit Network vs bit Host.\n4. Periksa hasil kalkulasi otomatis untuk Network IP, Broadcast IP, dan Total Host.\n5. Coba mode Tantangan Subnetting untuk menguji kecepatan perhitungan Anda.`,
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
          title: 'Kalkulasi Subnet Kelas C (/26)',
          description: 'Kalkulasikan IP 192.168.1.50/26. Tentukan Network ID dan Broadcast ID dari subnet tersebut.',
          taskType: 'SIMULATION',
          estimatedMinutes: 10,
        },
        {
          stepNumber: 2,
          title: 'Perhitungan Host Efektif',
          description: 'Gunakan kalkulator untuk mencari berapa jumlah usable host maksimum untuk prefix /28.',
          taskType: 'EXPERIMENT',
          estimatedMinutes: 10,
        },
        {
          stepNumber: 3,
          title: 'Studi Kasus Pembagian Lab Komputer',
          description: 'Rancang skema subnetting untuk sekolah yang membutuhkan 3 lab dengan masing-masing 25 PC.',
          taskType: 'ANALYSIS',
          estimatedMinutes: 15,
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
