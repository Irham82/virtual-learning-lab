'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Eye,
  Camera,
  Glasses,
  Volume2,
  Sparkles,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Info,
  RefreshCw,
  Rocket,
  Sun,
  Shield,
  Layers,
  FlaskConical,
  X,
  Gauge,
  Clock,
  MapPin,
  Moon,
  Zap,
  Globe,
  Award,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SDSolarLabProps {
  onProgressUpdate?: () => void;
}

export interface PlanetSD {
  id: string;
  name: string;
  order: number;
  nickname: string;
  emoji: string;
  colorHex: string;
  colorThree: number;
  emissiveThree: number;
  sizeRatio: number;
  distRatio: number;
  speed: number;
  realDiameterKm: number;
  earthRatioText: string;
  distMillionKm: number;
  distAU: number;
  rotationHours: string;
  revolutionDays: string;
  temperature: string;
  moonsCount: number;
  colorDesc: string;
  fact: string;
  kidStory: string;
  hasRing?: boolean;
}

export const PLANETS_SD: PlanetSD[] = [
  {
    id: 'merkurius',
    name: 'Merkurius',
    order: 1,
    nickname: 'Planet Terkecil & Tercepat',
    emoji: '🪨',
    colorHex: '#e2e8f0',
    colorThree: 0xe2e8f0,
    emissiveThree: 0x94a3b8,
    sizeRatio: 1.8,
    distRatio: 14,
    speed: 0.045,
    realDiameterKm: 4879,
    earthRatioText: '0,38x ukuran Bumi (Sedikit lebih besar dari Bulan kita)',
    distMillionKm: 58,
    distAU: 0.39,
    rotationHours: '59 Hari Bumi',
    revolutionDays: '88 Hari Bumi',
    temperature: '-170°C (malam) s/d 430°C (siang)',
    moonsCount: 0,
    colorDesc: 'Abu-abu perak berkawah berbatu seperti permukaan Bulan',
    fact: 'Planet paling dekat dengan Matahari! Mengitari Matahari super kilat hanya dalam 88 hari.',
    kidStory: 'Merkurius tidak punya udara atau selimut atmosfer, sehingga saat siang sangat membara panas, dan saat malam langsung beku dingin!',
  },
  {
    id: 'venus',
    name: 'Venus',
    order: 2,
    nickname: 'Bintang Kejora yang Berkilau',
    emoji: '⭐',
    colorHex: '#fbbf24',
    colorThree: 0xffd54f,
    emissiveThree: 0xff8f00,
    sizeRatio: 2.3,
    distRatio: 22,
    speed: 0.03,
    realDiameterKm: 12104,
    earthRatioText: '0,95x ukuran Bumi (Hampir kembar seukuran Bumi)',
    distMillionKm: 108,
    distAU: 0.72,
    rotationHours: '243 Hari Bumi (Berputar terbalik ke arah barat!)',
    revolutionDays: '225 Hari Bumi',
    temperature: '465°C (Planet paling panas di tata surya!)',
    moonsCount: 0,
    colorDesc: 'Kuning keemasan terang bersinar karena diselimuti awan tebal',
    fact: 'Planet terpanas di tata surya karena efek rumah kaca gas karbon dioksida tebal yang memerangkap panas!',
    kidStory: 'Venus sering terlihat berkilau paling terang di langit fajar atau senja, itulah mengapa sering disebut Bintang Kejora.',
  },
  {
    id: 'bumi',
    name: 'Bumi',
    order: 3,
    nickname: 'Rumah Kita Tercinta',
    emoji: '🌍',
    colorHex: '#38bdf8',
    colorThree: 0x29b6f6,
    emissiveThree: 0x0284c7,
    sizeRatio: 2.5,
    distRatio: 31,
    speed: 0.02,
    realDiameterKm: 12742,
    earthRatioText: '1x (Patokan ukuran pembanding kita)',
    distMillionKm: 149.6,
    distAU: 1.0,
    rotationHours: '24 Jam (1 Hari Pergantian Siang & Malam)',
    revolutionDays: '365 Hari (1 Tahun Mengitari Matahari)',
    temperature: '-88°C s/d 58°C (Sejuk, nyaman, dan pas untuk kehidupan)',
    moonsCount: 1,
    colorDesc: 'Biru samudra cerah dengan benua hijau dan pusaran awan putih',
    fact: 'Satu-satunya planet yang diketahui memiliki air cair, oksigen melimpah, dan jutaan makhluk hidup!',
    kidStory: 'Bumi memiliki atmosfer pelindung ajaib yang menjaga udara kita dan melindungi kita dari benda langit yang jatuh!',
  },
  {
    id: 'mars',
    name: 'Mars',
    order: 4,
    nickname: 'Planet Merah Berkarat',
    emoji: '🔴',
    colorHex: '#f87171',
    colorThree: 0xff5722,
    emissiveThree: 0xd84315,
    sizeRatio: 2.0,
    distRatio: 41,
    speed: 0.015,
    realDiameterKm: 6779,
    earthRatioText: '0,53x ukuran Bumi (Kira-kira setengah ukuran Bumi)',
    distMillionKm: 228,
    distAU: 1.52,
    rotationHours: '24,6 Jam (Hampir persis sama dengan 1 hari di Bumi!)',
    revolutionDays: '687 Hari Bumi (Hampir 2 tahun Bumi)',
    temperature: '-60°C (Dingin seperti musim beku di kutub)',
    moonsCount: 2,
    colorDesc: 'Merah jingga menyala karena batuan mengandung karat besi',
    fact: 'Tanahnya penuh dengan oksida besi (karat) sehingga tampak merah cerah dari kejauhan.',
    kidStory: 'Di Mars ada gunung berapi raksasa bernama Olympus Mons yang tingginya tiga kali lipat Gunung Everest di Bumi!',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    order: 5,
    nickname: 'Raja Planet Raksasa',
    emoji: '🌀',
    colorHex: '#fb923c',
    colorThree: 0xff9800,
    emissiveThree: 0xe65100,
    sizeRatio: 5.2,
    distRatio: 56,
    speed: 0.009,
    realDiameterKm: 139820,
    earthRatioText: '11x ukuran Bumi (Muat 1.300 planet Bumi di dalamnya!)',
    distMillionKm: 778,
    distAU: 5.2,
    rotationHours: '9,9 Jam (Planet dengan putaran poros paling cepat!)',
    revolutionDays: '11,8 Tahun Bumi',
    temperature: '-110°C (Sangat dingin)',
    moonsCount: 95,
    colorDesc: 'Cokelat jingga bergaris badai dengan Bintik Merah Raksasa',
    fact: 'Planet terbesar di tata surya! Beratnya lebih dari dua kali lipat gabungan semua planet lainnya.',
    kidStory: 'Jupiter adalah raksasa pelindung Bumi! Gravitasinya yang kuat sering menarik komet berbahaya agar tidak menabrak Bumi.',
  },
  {
    id: 'saturnus',
    name: 'Saturnus',
    order: 6,
    nickname: 'Planet Cincin Berkilau',
    emoji: '🪐',
    colorHex: '#fef08a',
    colorThree: 0xffeb3b,
    emissiveThree: 0xfbc02d,
    sizeRatio: 4.2,
    distRatio: 72,
    speed: 0.007,
    realDiameterKm: 116460,
    earthRatioText: '9,4x ukuran Bumi (Muat 760 planet Bumi di dalamnya!)',
    distMillionKm: 1427,
    distAU: 9.58,
    rotationHours: '10,7 Jam',
    revolutionDays: '29,5 Tahun Bumi',
    temperature: '-140°C',
    moonsCount: 146,
    colorDesc: 'Kuning emas terang dengan cincin ganda butiran es berkilau',
    hasRing: true,
    fact: 'Memiliki sistem cincin spektakuler terlebar yang tersusun dari miliaran bongkahan es dan batuan angkasa.',
    kidStory: 'Meski ukurannya raksasa, Saturnus terbuat dari gas ringan! Kalau ada kolam renang raksasa di alam semesta, Saturnus bisa mengapung!',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    order: 7,
    nickname: 'Planet Es Menggelinding',
    emoji: '❄️',
    colorHex: '#22d3ee',
    colorThree: 0x00e5ff,
    emissiveThree: 0x00b4d8,
    sizeRatio: 3.2,
    distRatio: 88,
    speed: 0.005,
    realDiameterKm: 50724,
    earthRatioText: '4x ukuran Bumi (Muat 63 planet Bumi di dalamnya)',
    distMillionKm: 2871,
    distAU: 19.2,
    rotationHours: '17,2 Jam (Porosnya miring 98° sehingga berputar menggelinding)',
    revolutionDays: '84 Tahun Bumi',
    temperature: '-195°C (Planet es raksasa)',
    moonsCount: 28,
    colorDesc: 'Biru kehijauan toska cyan es yang sejuk bersinar',
    fact: 'Planet es raksasa yang berotasi miring 98 derajat, sehingga tampak seperti bola yang menggelinding di lintasannya.',
    kidStory: 'Uranus sangat dingin dan diselimuti gas metana yang menyerap cahaya merah dan memantulkan warna biru cyan indah!',
  },
  {
    id: 'neptunus',
    name: 'Neptunus',
    order: 8,
    nickname: 'Raksasa Biru Berangin Kencang',
    emoji: '💨',
    colorHex: '#60a5fa',
    colorThree: 0x3d5afe,
    emissiveThree: 0x1a237e,
    sizeRatio: 3.1,
    distRatio: 104,
    speed: 0.003,
    realDiameterKm: 49244,
    earthRatioText: '3,9x ukuran Bumi (Muat 57 planet Bumi di dalamnya)',
    distMillionKm: 4498,
    distAU: 30.1,
    rotationHours: '16,1 Jam',
    revolutionDays: '165 Tahun Bumi (Lama sekali!)',
    temperature: '-200°C (Planet terdingin & terjauh)',
    moonsCount: 16,
    colorDesc: 'Biru kobalt elektrik laut dalam dengan badai angin supersonic',
    fact: 'Planet paling jauh dari Matahari dengan kecepatan badai angin tercepat di tata surya mencapai 2.100 km/jam!',
    kidStory: 'Neptunus berwarna biru laut pekat yang misterius. Sejak pertama kali ditemukan manusia, Neptunus baru sekali menyelesaikan satu putaran tahun!',
  },
];

type SimulationMode = '3D' | 'GERHANA' | 'EKSPERIMEN' | '2D' | 'AR' | 'VR';

export function SDSolarMultiverseLab({ onProgressUpdate }: SDSolarLabProps) {
  const [mode, setMode] = useState<SimulationMode>('3D');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetSD>(PLANETS_SD[2]); // Default Bumi
  const [showPlanetModal, setShowPlanetModal] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // ==============================================================
  // GERHANA (ECLIPSE) STATE
  // ==============================================================
  const [eclipseType, setEclipseType] = useState<'matahari' | 'bulan'>('matahari');
  const [solarSubtype, setSolarSubtype] = useState<'total' | 'sebagian' | 'cincin'>('total');
  const [lunarSubtype, setLunarSubtype] = useState<'total' | 'sebagian' | 'penumbra'>('total');
  const [eclipseProgress, setEclipseProgress] = useState<number>(50); // 0 to 100% (50 = peak)
  const [isEclipsePlaying, setIsEclipsePlaying] = useState<boolean>(false);
  const [eclipseSpeed, setEclipseSpeed] = useState<number>(1);
  const [activeEclipseTab, setActiveEclipseTab] = useState<'simulasi' | 'susun_posisi' | 'tabel_ilmu'>('simulasi');
  const [selectedRayZone, setSelectedRayZone] = useState<'umbra' | 'penumbra' | null>(null);

  // Alignment Game State
  const [alignEclipseTarget, setAlignEclipseTarget] = useState<'matahari' | 'bulan'>('matahari');
  const [alignSlots, setAlignSlots] = useState<{ slot1: string | null; slot2: string | null; slot3: string | null }>({
    slot1: null,
    slot2: null,
    slot3: null,
  });
  const [alignFeedback, setAlignFeedback] = useState<{ isSuccess: boolean; message: string } | null>(null);

  // Mini-Game 2D state
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [hasWonGame, setHasWonGame] = useState(false);

  // 3D Canvas ref & state
  const canvas3DRef = useRef<HTMLDivElement>(null);
  const [threeHoverPlanet, setThreeHoverPlanet] = useState<string | null>(null);

  // AR state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [arScale, setArScale] = useState(1);
  const [arPlaced, setArPlaced] = useState(false);

  // VR state
  const [vrSplit, setVrSplit] = useState(false);
  const [vrWarpSpeed, setVrWarpSpeed] = useState(1);

  // ==============================================================
  // 6 EXPERIMENTS STATE
  // ==============================================================
  const [activeExp, setActiveExp] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Exp 1: Poros & Rotasi
  const [exp1PlanetId, setExp1PlanetId] = useState<string>('bumi');
  const [exp1Speed, setExp1Speed] = useState<number>(1);
  const [exp1Angle, setExp1Angle] = useState<number>(0);
  const [exp1Spinning, setExp1Spinning] = useState<boolean>(true);

  // Exp 2: Revolusi & Orbit
  const [exp2Racing, setExp2Racing] = useState<boolean>(false);
  const [exp2Laps, setExp2Laps] = useState<{ merkurius: number; bumi: number; jupiter: number }>({
    merkurius: 0,
    bumi: 0,
    jupiter: 0,
  });

  // Exp 3: Skala Ukuran
  const [exp3SelectedComp, setExp3SelectedComp] = useState<string>('jupiter');

  // Exp 4: Siang & Malam
  const [exp4Hour, setExp4Hour] = useState<number>(12); // 0 to 24
  const [exp4AutoPlay, setExp4AutoPlay] = useState<boolean>(false);

  // Exp 5: Waktu & Jarak
  const [exp5Vehicle, setExp5Vehicle] = useState<'cahaya' | 'roket' | 'pesawat' | 'mobil'>('cahaya');
  const [exp5TargetPlanetId, setExp5TargetPlanetId] = useState<string>('mars');
  const [exp5Simulating, setExp5Simulating] = useState<boolean>(false);
  const [exp5Progress, setExp5Progress] = useState<number>(0);

  // Web Speech narration
  const speakPlanetFact = (planet: PlanetSD) => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `Halo sahabat antariksa! Ini adalah ${planet.name}, ${planet.nickname}. Warnanya ${planet.colorDesc}. Ukuran diameternya ${planet.realDiameterKm.toLocaleString('id-ID')} kilometer, yaitu ${planet.earthRatioText}. Jaraknya dari matahari adalah ${planet.distMillionKm} juta kilometer. Waktu satu hari adalah ${planet.rotationHours}, dan waktu satu tahun adalah ${planet.revolutionDays}. ${planet.kidStory} ${planet.fact}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mini-game handler
  const handleAddPlanetToOrder = (p: PlanetSD) => {
    if (userOrder.includes(p.id)) return;
    const newOrder = [...userOrder, p.id];
    setUserOrder(newOrder);

    if (newOrder.length === PLANETS_SD.length) {
      const isCorrect = newOrder.every((id, idx) => id === PLANETS_SD[idx].id);
      if (isCorrect) {
        setHasWonGame(true);
        setGameFeedback('Hebat Sekali! Kamu berhasil menyusun 8 Planet sesuai urutan dari Matahari! 🌟🎖️');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        if (onProgressUpdate) onProgressUpdate();
      } else {
        setHasWonGame(false);
        setGameFeedback('Urutan masih belum tepat. Ayo periksa kembali urutan planet terdekat ke terjauh!');
      }
    }
  };

  // Eclipse Autoplay Loop
  useEffect(() => {
    if (!isEclipsePlaying) return;
    const interval = setInterval(() => {
      setEclipseProgress((prev) => {
        if (prev >= 100) return 0;
        return Math.min(100, Math.round((prev + 0.5 * eclipseSpeed) * 10) / 10);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isEclipsePlaying, eclipseSpeed]);

  // Eclipse Speech Narration
  const speakEclipseFact = (type: 'matahari' | 'bulan', subtype: string) => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      let textToSpeak = '';
      if (type === 'matahari') {
        if (subtype === 'total') {
          textToSpeak = 'Gerhana Matahari Total terjadi saat siang hari ketika Matahari, Bulan, dan Bumi berada dalam satu garis lurus sempurna. Bulan menutupi seluruh piringan matahari sehingga siang hari tiba-tiba menjadi gelap gulita selama beberapa menit dan tampak korona putih keemasan yang indah di sekeliling bulan! Jangan lupa gunakan kacamata filter khusus saat melihatnya ya!';
        } else if (subtype === 'cincin') {
          textToSpeak = 'Gerhana Matahari Cincin terjadi ketika posisi Bulan berada di titik terjauh dari Bumi. Ukuran tampak Bulan lebih kecil daripada Matahari, sehingga menyisakan cincin cahaya emas menyala di sekelilingnya seperti cincin api!';
        } else {
          textToSpeak = 'Gerhana Matahari Sebagian terjadi ketika bayangan penumbra Bulan jatuh ke permukaan Bumi. Piringan Matahari hanya tertutup sebagian seperti bulan sabit yang bercahaya!';
        }
      } else {
        if (subtype === 'total') {
          textToSpeak = 'Gerhana Bulan Total terjadi pada malam hari saat Bulan Purnama. Bumi kita berada tepat di antara Matahari dan Bulan. Seluruh permukaan Bulan masuk ke dalam bayangan umbra Bumi dan berubah warna menjadi merah tembaga atau merah darah yang disebut Blood Moon, karena atmosfer Bumi membiaskan cahaya merah matahari ke arah Bulan! Sangat aman dilihat dengan mata telanjang!';
        } else if (subtype === 'sebagian') {
          textToSpeak = 'Gerhana Bulan Sebagian terjadi ketika hanya sebagian permukaan Bulan yang masuk ke dalam bayangan umbra Bumi, sementara bagian lainnya masih terkena sinar matahari!';
        } else {
          textToSpeak = 'Gerhana Bulan Penumbra terjadi ketika Bulan melintasi bayangan penumbra Bumi yang samar. Cahaya Bulan hanya akan tampak sedikit lebih redup dari biasanya!';
        }
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Alignment Game handlers
  const handlePlaceAlignItem = (item: string) => {
    if (!alignSlots.slot1) {
      setAlignSlots({ ...alignSlots, slot1: item });
    } else if (!alignSlots.slot2) {
      setAlignSlots({ ...alignSlots, slot2: item });
    } else if (!alignSlots.slot3) {
      setAlignSlots({ ...alignSlots, slot3: item });
    }
  };

  const handleClearAlignSlots = () => {
    setAlignSlots({ slot1: null, slot2: null, slot3: null });
    setAlignFeedback(null);
  };

  const handleCheckAlignment = () => {
    const { slot1, slot2, slot3 } = alignSlots;
    if (!slot1 || !slot2 || !slot3) {
      setAlignFeedback({ isSuccess: false, message: 'Harap isi ketiga posisi benda langit terlebih dahulu!' });
      return;
    }

    if (alignEclipseTarget === 'matahari') {
      if (slot1 === 'matahari' && slot2 === 'bulan' && slot3 === 'bumi') {
        setAlignFeedback({
          isSuccess: true,
          message: '🎉 LUAR BIASA BENAR! Ketika Bulan berada di tengah-tengah antara Matahari dan Bumi, Bulan menghalangi sinar matahari ke Bumi sehingga tercipta GERHANA MATAHARI!',
        });
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setEclipseType('matahari');
        setEclipseProgress(50);
        setIsEclipsePlaying(true);
      } else {
        setAlignFeedback({
          isSuccess: false,
          message: 'Susunan belum tepat untuk Gerhana Matahari. Ingat: Matahari adalah sumber cahaya, Bulan berada di tengah menghalangi, dan Bumi menerima bayangan!',
        });
      }
    } else {
      if (slot1 === 'matahari' && slot2 === 'bumi' && slot3 === 'bulan') {
        setAlignFeedback({
          isSuccess: true,
          message: '🎉 HEBAT SEKALI! Ketika Bumi berada tepat di antara Matahari dan Bulan, bayangan raksasa Bumi menutupi permukaan Bulan sehingga tercipta GERHANA BULAN (Blood Moon)!',
        });
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setEclipseType('bulan');
        setEclipseProgress(50);
        setIsEclipsePlaying(true);
      } else {
        setAlignFeedback({
          isSuccess: false,
          message: 'Susunan belum tepat untuk Gerhana Bulan. Ingat: Bumi harus berada di tengah di antara Matahari dan Bulan agar bayangan Bumi jatuh ke Bulan!',
        });
      }
    }
  };

  // AR Camera setup
  const startCamera = async () => {
    setCameraError(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError(true);
      }
    } catch {
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'AR') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  // Exp 1: Rotation loop
  useEffect(() => {
    if (!exp1Spinning) return;
    const interval = setInterval(() => {
      setExp1Angle((prev) => (prev + 3 * exp1Speed) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [exp1Spinning, exp1Speed]);

  // Exp 2: Orbit race loop
  useEffect(() => {
    if (!exp2Racing) return;
    const interval = setInterval(() => {
      setExp2Laps((prev) => ({
        merkurius: parseFloat((prev.merkurius + 0.08).toFixed(2)),
        bumi: parseFloat((prev.bumi + 0.02).toFixed(2)),
        jupiter: parseFloat((prev.jupiter + 0.004).toFixed(3)),
      }));
    }, 60);
    return () => clearInterval(interval);
  }, [exp2Racing]);

  // Exp 4: Day & Night auto-play loop
  useEffect(() => {
    if (!exp4AutoPlay) return;
    const interval = setInterval(() => {
      setExp4Hour((prev) => (prev >= 24 ? 0 : prev + 1));
    }, 600);
    return () => clearInterval(interval);
  }, [exp4AutoPlay]);

  // Exp 5: Rocket flight simulation
  const startExp5Simulation = () => {
    setExp5Simulating(true);
    setExp5Progress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setExp5Progress(p);
      if (p >= 100) {
        clearInterval(interval);
        setExp5Simulating(false);
        confetti({ particleCount: 70, spread: 60 });
      }
    }, 80);
  };

  // ==============================================================
  // 3D THREE.JS IMPLEMENTATION WITH RAYCASTER & VIVID VISIBILITY
  // ==============================================================
  useEffect(() => {
    if (mode !== '3D' || !canvas3DRef.current) return;

    const container = canvas3DRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050816);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 80, 140);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Starfield
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 600;
      starPos[i + 1] = (Math.random() - 0.5) * 600;
      starPos[i + 2] = (Math.random() - 0.5) * 600;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, transparent: true, opacity: 0.95 });
    const stars = new THREE.Points(starsGeom, starMat);
    scene.add(stars);

    // Glowing Sun
    const sunGeom = new THREE.SphereGeometry(9, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffa000 });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sun);

    // Bright Lights so colors are vibrant
    const sunLight = new THREE.PointLight(0xffffff, 2.5, 400);
    scene.add(sunLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4); // Bright ambient lighting
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(0, 50, 50);
    scene.add(dirLight);

    // Planet Meshes for animation & raycasting
    const planetItems: { mesh: THREE.Mesh; data: PlanetSD; angle: number; haloMesh: THREE.Mesh }[] = [];
    const interactiveMeshes: THREE.Mesh[] = [];

    PLANETS_SD.forEach((p, idx) => {
      // 1. Orbit line with bright cyan/blue glow
      const curve = new THREE.EllipseCurve(0, 0, p.distRatio, p.distRatio, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(100);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(
        points.map((pt) => new THREE.Vector3(pt.x, 0, pt.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      scene.add(orbitLine);

      // 2. Planet Sphere with Vivid Emissive Material
      const pGeom = new THREE.SphereGeometry(p.sizeRatio, 32, 32);
      const pMat = new THREE.MeshStandardMaterial({
        color: p.colorThree,
        emissive: p.emissiveThree,
        emissiveIntensity: 0.45, // Radiant self-illuminating pop!
        roughness: 0.25,
        metalness: 0.15,
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);
      pMesh.userData = { planetData: p };

      // 3. Saturn Rings
      if (p.hasRing) {
        const ringGeom = new THREE.RingGeometry(p.sizeRatio * 1.6, p.sizeRatio * 2.8, 36);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        pMesh.add(ringMesh);
      }

      // 4. Subtle Outer Aura Halo Ring
      const haloGeom = new THREE.RingGeometry(p.sizeRatio * 1.1, p.sizeRatio * 1.3, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: p.colorThree,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      pMesh.add(haloMesh);

      const initAngle = (idx * (Math.PI * 2)) / PLANETS_SD.length;
      pMesh.position.set(Math.cos(initAngle) * p.distRatio, 0, Math.sin(initAngle) * p.distRatio);
      scene.add(pMesh);

      planetItems.push({ mesh: pMesh, data: p, angle: initAngle, haloMesh });
      interactiveMeshes.push(pMesh);
    });

    // Raycaster for clicking directly on 3D planets
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const target = intersects[0].object as THREE.Mesh;
        const pData = target.userData?.planetData as PlanetSD;
        if (pData) {
          renderer.domElement.style.cursor = 'pointer';
          setThreeHoverPlanet(pData.name);
        }
      } else {
        renderer.domElement.style.cursor = 'grab';
        setThreeHoverPlanet(null);
      }
    };

    const onPointerClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const target = intersects[0].object as THREE.Mesh;
        const pData = target.userData?.planetData as PlanetSD;
        if (pData) {
          setSelectedPlanet(pData);
          setShowPlanetModal(true);
          speakPlanetFact(pData);
        }
      }
    };

    // Mouse drag rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let theta = 0;
    let phi = 0.55;
    let radius = 160;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      onPointerMove(e);
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      theta -= dx * 0.007;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi + dy * 0.007));

      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(50, Math.min(260, radius + e.deltaY * 0.1));
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onPointerClick);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      sun.rotation.y += 0.004;

      planetItems.forEach((item) => {
        item.angle += item.data.speed * 0.35;
        item.mesh.position.x = Math.cos(item.angle) * item.data.distRatio;
        item.mesh.position.z = Math.sin(item.angle) * item.data.distRatio;
        item.mesh.rotation.y += 0.02;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas3DRef.current) return;
      const w = canvas3DRef.current.clientWidth;
      const h = canvas3DRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onPointerClick);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [mode]);

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* ============================================================== */}
      {/* HEADER WITH 5 MODE SELECTOR TABS                               */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              Mata Pelajaran IPAS • Kelas 4-6 SD
            </span>
            <span className="text-xs text-tealbrand-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Laboratorium Virtual Lengkap
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Petualangan Mengenal Tata Surya (2D, 3D, Gerhana, AR &amp; VR)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Eksplorasi tata surya lengkap: Animasi 2D, Orbit 3D interaktif, Simulasi Gerhana Bulan &amp; Matahari, Kamera AR, Kokpit VR, serta 6 Modul Eksperimen Sains!
          </p>
        </div>

        {/* 6 Main Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setMode('3D')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === '3D'
                ? 'bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 text-white shadow-lg shadow-tealbrand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>🚀 Mode 3D Orbit</span>
          </button>

          <button
            onClick={() => setMode('GERHANA')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === 'GERHANA'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-300" />
            <span>🌑☀️ Mode Gerhana (Bulan &amp; Matahari)</span>
          </button>

          <button
            onClick={() => setMode('EKSPERIMEN')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === 'EKSPERIMEN'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
            <span>🧪 6 Modul Eksperimen</span>
          </button>

          <button
            onClick={() => setMode('2D')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === '2D'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🎨 Mode 2D Edukasi</span>
          </button>

          <button
            onClick={() => setMode('AR')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === 'AR'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📱 Mode AR (Kamera)</span>
          </button>

          <button
            onClick={() => setMode('VR')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === 'VR'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>🥽 Mode VR 360°</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MODE 3D ORBIT DENGAN WARNA JELAS & INTERAKSI KLIK PLANET    */}
      {/* ============================================================== */}
      {mode === '3D' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="flex items-center gap-2 text-tealbrand-400 font-bold">
              <Eye className="w-4 h-4" />
              <span>Simulasi 3D Berwarna Terang &amp; Berpijar</span>
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-amber-300">
                👆 <strong>Klik bola planet mana saja</strong> untuk membuka data lengkap!
              </span>
              <span>🖱️ Drag: Putar | Scroll: Zoom</span>
            </div>
          </div>

          {/* 3D WebGL Canvas Container */}
          <div
            ref={canvas3DRef}
            className="w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative cursor-grab active:cursor-grabbing shadow-inner"
          >
            {/* Hover tooltip indicator */}
            {threeHoverPlanet && (
              <div className="absolute top-4 left-4 bg-slate-900/90 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/40 text-xs font-bold pointer-events-none shadow-lg animate-in fade-in">
                ✨ Klik untuk melihat data: <strong>{threeHoverPlanet}</strong>
              </div>
            )}

            {/* Quick Planet Pills Ribbon at bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 overflow-x-auto pb-1 z-10">
              {PLANETS_SD.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlanet(p);
                    setShowPlanetModal(true);
                    speakPlanetFact(p);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-md ${
                    selectedPlanet.id === p.id
                      ? 'bg-amber-400 text-slate-950 scale-105 ring-2 ring-amber-300'
                      : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block border border-white/40"
                    style={{ backgroundColor: p.colorHex }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pop-up Card / Sheet Data Planet saat Planet di-klik */}
          {showPlanetModal && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-5 sm:p-6 rounded-2xl border-2 border-amber-400/50 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-lg"
                    style={{ backgroundColor: selectedPlanet.colorHex + '33', borderColor: selectedPlanet.colorHex }}
                  >
                    {selectedPlanet.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-amber-400">
                        Planet {selectedPlanet.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-tealbrand-300 border border-slate-700">
                        Urutan #{selectedPlanet.order} dari Matahari
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-0.5">
                      &ldquo;{selectedPlanet.nickname}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakPlanetFact(selectedPlanet)}
                    disabled={isPlayingAudio}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlayingAudio ? 'Membaca...' : '🔊 Suara Narasi'}</span>
                  </button>
                  <button
                    onClick={() => setShowPlanetModal(false)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Data Grid: Ukuran, Jarak, Waktu, Suhu */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* 1. Ukuran Fisik */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Ukuran Diameter</span>
                  <p className="font-mono text-base font-extrabold text-tealbrand-300 mt-0.5">
                    {selectedPlanet.realDiameterKm.toLocaleString('id-ID')} km
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedPlanet.earthRatioText}</p>
                </div>

                {/* 2. Jarak dari Matahari */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Jarak ke Matahari</span>
                  <p className="font-mono text-base font-extrabold text-amber-300 mt-0.5">
                    {selectedPlanet.distMillionKm} Juta km
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedPlanet.distAU} Satuan AU</p>
                </div>

                {/* 3. Lama 1 Hari (Rotasi) */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Lama 1 Hari (Rotasi)</span>
                  <p className="font-mono text-base font-extrabold text-brand-300 mt-0.5">
                    {selectedPlanet.rotationHours}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Putaran 1 kali pada porosnya</p>
                </div>

                {/* 4. Lama 1 Tahun (Revolusi) */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Lama 1 Tahun (Revolusi)</span>
                  <p className="font-mono text-base font-extrabold text-rose-300 mt-0.5">
                    {selectedPlanet.revolutionDays}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Waktu keliling Matahari</p>
                </div>
              </div>

              {/* Extra Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">🌡️ Suhu Permukaan:</span>
                  <span className="font-bold text-slate-200">{selectedPlanet.temperature}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">🌙 Satelit Alami (Bulan):</span>
                  <span className="font-bold text-tealbrand-400">{selectedPlanet.moonsCount} Bulan</span>
                </div>
              </div>

              {/* Story & Color Info */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block border"
                    style={{ backgroundColor: selectedPlanet.colorHex }}
                  />
                  <span>Ciri Warna: {selectedPlanet.colorDesc}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedPlanet.kidStory}</p>
                <p className="text-tealbrand-200 leading-relaxed font-medium">💡 <strong>Fakta Sains:</strong> {selectedPlanet.fact}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODE GERHANA: BULAN & MATAHARI INTERAKTIF                   */}
      {/* ============================================================== */}
      {mode === 'GERHANA' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sub Navigation Bar for Gerhana */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Fase B &amp; C SD • Geometri Bayangan &amp; Antariksa
                </span>
                <span className="text-xs font-mono text-amber-400">Umbra &amp; Penumbra</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
                <Moon className="w-5 h-5 text-amber-400" />
                Laboratorium Proses Gerhana Bulan &amp; Gerhana Matahari
              </h3>
            </div>

            {/* Sub-Tabs: Simulasi, Mini Game Tantangan, Ensiklopedi */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveEclipseTab('simulasi')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeEclipseTab === 'simulasi'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔭 Simulasi &amp; POV Bumi
              </button>
              <button
                onClick={() => setActiveEclipseTab('susun_posisi')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeEclipseTab === 'susun_posisi'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🧩 Tantangan Susun Posisi
              </button>
              <button
                onClick={() => setActiveEclipseTab('tabel_ilmu')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeEclipseTab === 'tabel_ilmu'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 Ensiklopedi Umbra &amp; Penumbra
              </button>
            </div>
          </div>

          {/* TAB 1: SIMULASI & POV BUMI */}
          {activeEclipseTab === 'simulasi' && (
            <div className="space-y-6">
              {/* Controls Toolbar */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Switcher Gerhana Matahari vs Gerhana Bulan */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase mr-1">Tipe Gerhana:</span>
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => {
                        setEclipseType('matahari');
                        setEclipseProgress(50);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        eclipseType === 'matahari'
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>☀️ Gerhana Matahari</span>
                    </button>
                    <button
                      onClick={() => {
                        setEclipseType('bulan');
                        setEclipseProgress(50);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        eclipseType === 'bulan'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>🌕 Gerhana Bulan</span>
                    </button>
                  </div>
                </div>

                {/* Sub-variant Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase mr-1">Varian:</span>
                  {eclipseType === 'matahari' ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      {[
                        { id: 'total', label: '🌑 Total (Korona)' },
                        { id: 'sebagian', label: '🌘 Sebagian (Sabit)' },
                        { id: 'cincin', label: '⭕ Cincin (Ring of Fire)' },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSolarSubtype(sub.id as any)}
                          className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                            solarSubtype === sub.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs">
                      {[
                        { id: 'total', label: '🔴 Total (Blood Moon)' },
                        { id: 'sebagian', label: '🌗 Sebagian' },
                        { id: 'penumbra', label: '🌕 Penumbra (Samar)' },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setLunarSubtype(sub.id as any)}
                          className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                            lunarSubtype === sub.id
                              ? 'bg-rose-500/20 text-rose-300 border-rose-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions: Play, Reset, Voice */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEclipsePlaying(!isEclipsePlaying)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                      isEclipsePlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-brand-600 hover:bg-brand-500 text-white'
                    }`}
                  >
                    {isEclipsePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isEclipsePlaying ? 'Jeda' : 'Putar Animasi'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEclipseProgress(50);
                      setIsEclipsePlaying(false);
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="Puncak Gerhana"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      speakEclipseFact(
                        eclipseType,
                        eclipseType === 'matahari' ? solarSubtype : lunarSubtype
                      )
                    }
                    disabled={isPlayingAudio}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlayingAudio ? 'Membaca...' : '🔊 Narasi Suara'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Slider Timeline */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Garis Waktu Perjalanan Gerhana:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-tealbrand-300 border border-slate-700">
                      {eclipseProgress < 20
                        ? 'Fase 1: Sebelum Gerhana (Cahaya Penuh)'
                        : eclipseProgress < 40
                        ? 'Fase 2: Masuk Bayangan Penumbra (Awal Meredup)'
                        : eclipseProgress <= 60
                        ? 'Fase 3: PUNCAK GERHANA (Totalitas / Maksimum)'
                        : eclipseProgress < 80
                        ? 'Fase 4: Keluar dari Umbra'
                        : 'Fase 5: Gerhana Berakhir (Terang Kembali)'}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(eclipseProgress)}%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={eclipseProgress}
                  onChange={(e) => setEclipseProgress(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                  <span>0% (Awal)</span>
                  <span>25% (Kontak 1)</span>
                  <span className="text-amber-400 font-bold">50% (PUNCAK MAKSIMUM)</span>
                  <span>75% (Kontak 4)</span>
                  <span>100% (Selesai)</span>
                </div>
              </div>

              {/* Dual Column Layout: Space View (Left) & Earth POV (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left 7 cols: Space Alignment View & Ray Casting */}
                <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-sm text-slate-200">
                        1. Geometri Ruang Angkasa &amp; Kerucut Bayangan
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {eclipseType === 'matahari'
                        ? 'MATAHARI ➔ BULAN ➔ BUMI'
                        : 'MATAHARI ➔ BUMI ➔ BULAN'}
                    </span>
                  </div>

                  {/* SVG Space Canvas */}
                  <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-gradient-to-r from-slate-950 via-[#030712] to-slate-950 border border-slate-800">
                    <svg
                      viewBox="0 0 800 320"
                      className="w-full h-full select-none"
                    >
                      <defs>
                        {/* Sun Radial Glow */}
                        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="60%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </radialGradient>

                        {/* Umbra Gradient */}
                        <linearGradient id="umbraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(15, 23, 42, 0.98)" />
                          <stop offset="100%" stopColor="rgba(2, 6, 23, 0.98)" />
                        </linearGradient>

                        {/* Penumbra Gradient */}
                        <linearGradient id="penumbraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(100, 116, 139, 0.45)" />
                          <stop offset="100%" stopColor="rgba(71, 85, 105, 0.15)" />
                        </linearGradient>

                        {/* Blood Moon Radial */}
                        <radialGradient id="bloodMoonGlow" cx="40%" cy="40%" r="60%">
                          <stop offset="0%" stopColor="#fca5a5" />
                          <stop offset="60%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#991b1b" />
                        </radialGradient>
                      </defs>

                      {/* Stars in Space */}
                      {[
                        [40, 40], [120, 290], [200, 70], [270, 240], [330, 40],
                        [450, 280], [520, 50], [600, 290], [700, 60], [760, 240],
                        [490, 190], [220, 160], [640, 90]
                      ].map(([sx, sy], i) => (
                        <circle key={i} cx={sx} cy={sy} r={i % 2 === 0 ? 1.5 : 1} fill="#ffffff" opacity={0.6} />
                      ))}

                      {/* 1. MATAHARI (SUN) on the Left */}
                      <g className="cursor-pointer">
                        <circle cx="100" cy="160" r="58" fill="url(#sunGlow)" opacity={0.25} />
                        <circle cx="100" cy="160" r="50" fill="url(#sunGlow)" />
                        <text x="100" y="235" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="bold">
                          ☀️ MATAHARI
                        </text>
                      </g>

                      {/* 2. SOLAR ECLIPSE LOGIC */}
                      {eclipseType === 'matahari' && (() => {
                        const moonY = 160 + ((eclipseProgress - 50) / 50) * 75;
                        const moonX = 370;
                        const earthX = 660;
                        const earthY = 160;

                        // Penumbra polygon
                        const penumbraPoints = `
                          ${moonX},${moonY - 16}
                          ${earthX},${160 - 55}
                          ${earthX},${160 + 55}
                          ${moonX},${moonY + 16}
                        `;

                        // Umbra cone triangle/polygon to Earth
                        const umbraPoints = `
                          ${moonX},${moonY - 14}
                          ${earthX},${160 + ((moonY - 160) * 1.4) - 9}
                          ${earthX},${160 + ((moonY - 160) * 1.4) + 9}
                          ${moonX},${moonY + 14}
                        `;

                        return (
                          <g>
                            {/* Golden Sunlight Rays */}
                            <line x1="100" y1="110" x2={moonX} y2={moonY - 16} stroke="#fde047" strokeWidth="1" strokeDasharray="4 4" opacity={0.6} />
                            <line x1="100" y1="210" x2={moonX} y2={moonY + 16} stroke="#fde047" strokeWidth="1" strokeDasharray="4 4" opacity={0.6} />
                            <line x1="100" y1="110" x2={moonX} y2={moonY + 16} stroke="#fde047" strokeWidth="1" strokeDasharray="2 4" opacity={0.3} />
                            <line x1="100" y1="210" x2={moonX} y2={moonY - 16} stroke="#fde047" strokeWidth="1" strokeDasharray="2 4" opacity={0.3} />

                            {/* Penumbra Shadow Region */}
                            <polygon points={penumbraPoints} fill="url(#penumbraGrad)" />

                            {/* Umbra Shadow Cone */}
                            <polygon points={umbraPoints} fill="url(#umbraGrad)" />

                            {/* Orbit Track of Moon */}
                            <line x1={moonX} y1="70" x2={moonX} y2="250" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />

                            {/* Moon (🌑) */}
                            <circle cx={moonX} cy={moonY} r="18" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
                            <text x={moonX} y={moonY + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">🌑</text>
                            <text x={moonX} y={moonY > 160 ? moonY + 34 : moonY - 24} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                              BULAN ({Math.round(eclipseProgress)}%)
                            </text>

                            {/* Earth (🌍) */}
                            <circle cx={earthX} cy={earthY} r="38" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                            {/* Continents */}
                            <circle cx={earthX - 10} cy={earthY - 10} r="14" fill="#22c55e" opacity={0.8} />
                            <circle cx={earthX + 8} cy={earthY + 8} r="12" fill="#22c55e" opacity={0.8} />

                            {/* Umbra Shadow Spot on Earth */}
                            {Math.abs(moonY - 160) < 18 && (
                              <circle
                                cx={earthX - 35}
                                cy={160 + ((moonY - 160) * 1.4)}
                                r={solarSubtype === 'total' ? 8 : solarSubtype === 'cincin' ? 5 : 6}
                                fill="#000000"
                                opacity={0.95}
                              />
                            )}

                            <text x={earthX} y={earthY + 56} textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                              🌍 BUMI (INDONESIA)
                            </text>

                            {/* Umbra & Penumbra Interactive Callouts */}
                            <g className="cursor-pointer" onClick={() => setSelectedRayZone('umbra')}>
                              <rect x="430" y="145" width="80" height="22" rx="6" fill="#020617" stroke="#dc2626" strokeWidth="1.5" />
                              <text x="470" y="160" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
                                🖤 UMBRA
                              </text>
                            </g>

                            <g className="cursor-pointer" onClick={() => setSelectedRayZone('penumbra')}>
                              <rect x="430" y="105" width="90" height="22" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
                              <text x="475" y="120" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                                🩶 PENUMBRA
                              </text>
                            </g>
                          </g>
                        );
                      })()}

                      {/* 3. LUNAR ECLIPSE LOGIC */}
                      {eclipseType === 'bulan' && (() => {
                        const earthX = 350;
                        const earthY = 160;
                        const moonX = 650;
                        const moonY = 160 + ((eclipseProgress - 50) / 50) * 85;
                        const isInsideUmbra = Math.abs(moonY - 160) < 22;
                        const isInsidePenumbra = Math.abs(moonY - 160) < 55;

                        // Earth's massive Umbra Cone
                        const earthUmbraPoints = `
                          ${earthX},${earthY - 36}
                          760,${160 - 18}
                          760,${160 + 18}
                          ${earthX},${earthY + 36}
                        `;

                        // Earth's Penumbra Zone
                        const earthPenumbraPoints = `
                          ${earthX},${earthY - 38}
                          760,${160 - 75}
                          760,${160 + 75}
                          ${earthX},${earthY + 38}
                        `;

                        return (
                          <g>
                            {/* Sunlight reaching Earth */}
                            <line x1="100" y1="110" x2={earthX} y2={earthY - 36} stroke="#fde047" strokeWidth="1" strokeDasharray="4 4" opacity={0.6} />
                            <line x1="100" y1="210" x2={earthX} y2={earthY + 36} stroke="#fde047" strokeWidth="1" strokeDasharray="4 4" opacity={0.6} />

                            {/* Penumbra Region */}
                            <polygon points={earthPenumbraPoints} fill="url(#penumbraGrad)" />

                            {/* Earth's Umbra Shadow Cone */}
                            <polygon points={earthUmbraPoints} fill="url(#umbraGrad)" />

                            {/* Earth (🌍) in the Middle */}
                            <circle cx={earthX} cy={earthY} r="40" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                            <circle cx={earthX - 10} cy={earthY - 10} r="14" fill="#22c55e" opacity={0.8} />
                            <circle cx={earthX + 12} cy={earthY + 12} r="12" fill="#22c55e" opacity={0.8} />
                            {/* Night side of Earth */}
                            <path d={`M ${earthX} ${earthY - 40} A 40 40 0 0 1 ${earthX} ${earthY + 40} Z`} fill="#020617" opacity={0.7} />
                            <text x={earthX} y={earthY + 58} textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                              🌍 BUMI (PENGHALANG)
                            </text>

                            {/* Orbit Track of Moon */}
                            <line x1={moonX} y1="65" x2={moonX} y2="255" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />

                            {/* Moon (🌕 / 🔴) in Earth's shadow */}
                            <circle
                              cx={moonX}
                              cy={moonY}
                              r="18"
                              fill={
                                isInsideUmbra
                                  ? lunarSubtype === 'total'
                                    ? 'url(#bloodMoonGlow)'
                                    : '#475569'
                                  : isInsidePenumbra
                                  ? '#94a3b8'
                                  : '#f8fafc'
                              }
                              stroke={isInsideUmbra ? '#ef4444' : '#cbd5e1'}
                              strokeWidth={isInsideUmbra ? 2.5 : 1.5}
                            />

                            <text x={moonX} y={moonY + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                              {isInsideUmbra && lunarSubtype === 'total' ? '🔴' : '🌕'}
                            </text>

                            <text
                              x={moonX}
                              y={moonY > 160 ? moonY + 34 : moonY - 24}
                              textAnchor="middle"
                              fill={isInsideUmbra && lunarSubtype === 'total' ? '#f87171' : '#cbd5e1'}
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {isInsideUmbra && lunarSubtype === 'total'
                                ? 'BLOOD MOON (MERAH TEMBAGA)'
                                : `BULAN (${Math.round(eclipseProgress)}%)`}
                            </text>

                            {/* Umbra & Penumbra Interactive Callouts */}
                            <g className="cursor-pointer" onClick={() => setSelectedRayZone('umbra')}>
                              <rect x="470" y="145" width="110" height="22" rx="6" fill="#020617" stroke="#dc2626" strokeWidth="1.5" />
                              <text x="525" y="160" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
                                🖤 UMBRA BUMI
                              </text>
                            </g>

                            <g className="cursor-pointer" onClick={() => setSelectedRayZone('penumbra')}>
                              <rect x="470" y="90" width="120" height="22" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
                              <text x="530" y="105" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                                🩶 PENUMBRA BUMI
                              </text>
                            </g>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Zone Explanations Popover Card */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-300">
                        {selectedRayZone === 'umbra'
                          ? '🖤 Wilayah Umbra (Bayangan Inti):'
                          : selectedRayZone === 'penumbra'
                          ? '🩶 Wilayah Penumbra (Bayangan Samar):'
                          : '💡 Petunjuk Observasi Geometri:'}
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        {selectedRayZone === 'umbra'
                          ? 'Umbra adalah bayangan inti yang paling gelap di mana seluruh cahaya matahari terhalang 100%. Di bumi yang dilintasi umbra terjadi Gerhana Total (siang hari menjadi gelap gulita), atau bulan yang masuk umbra berubah menjadi merah tembaga (Blood Moon).'
                          : selectedRayZone === 'penumbra'
                          ? 'Penumbra adalah daerah bayangan kabur di sekeliling umbra di mana hanya sebagian cahaya matahari yang terhalang. Di daerah penumbra terjadi Gerhana Sebagian.'
                          : 'Klik kotak UMBRA atau PENUMBRA pada diagram di atas untuk mempelajari sifat bayangan inti dan bayangan kabur!'}
                      </p>
                    </div>
                    {selectedRayZone && (
                      <button
                        onClick={() => setSelectedRayZone(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                      >
                        Tutup
                      </button>
                    )}
                  </div>
                </div>

                {/* Right 5 cols: POV Observer from Earth Surface */}
                <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-tealbrand-400" />
                      <h4 className="font-bold text-sm text-slate-200">
                        2. Sudut Pandang Siswa dari Bumi (POV)
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                      {eclipseType === 'matahari' ? 'Langit Siang Hari' : 'Langit Malam Hari'}
                    </span>
                  </div>

                  {/* POV Sky Simulation Box */}
                  {(() => {
                    const dist50 = Math.abs(eclipseProgress - 50);

                    if (eclipseType === 'matahari') {
                      // Sky color dynamic transition
                      let skyBg = '#38bdf8'; // Daylight bright blue
                      if (dist50 < 6) {
                        skyBg = '#020617'; // Pitch black during totality!
                      } else if (dist50 < 22) {
                        skyBg = '#0f172a'; // Deep twilight
                      } else if (dist50 < 38) {
                        skyBg = '#0284c7'; // Dimmed blue
                      }

                      const moonOffsetX = (eclipseProgress - 50) * 2.2;
                      const isTotality = dist50 < 6;

                      return (
                        <div
                          className="relative w-full h-[260px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center transition-colors duration-500"
                          style={{ backgroundColor: skyBg }}
                        >
                          {/* Stars visible during daytime totality */}
                          {isTotality && (
                            <div className="absolute inset-0 pointer-events-none animate-in fade-in duration-700">
                              {[
                                [20, 20], [80, 40], [240, 30], [280, 90], [40, 180],
                                [190, 210], [260, 220], [60, 110], [210, 80]
                              ].map(([sx, sy], i) => (
                                <div
                                  key={i}
                                  className="absolute text-amber-200 text-xs animate-ping"
                                  style={{ left: `${sx}px`, top: `${sy}px`, animationDuration: `${2 + i}s` }}
                                >
                                  ✨
                                </div>
                              ))}
                              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/40">
                                ⭐ Bintang Muncul di Siang Hari!
                              </div>
                            </div>
                          )}

                          {/* Corona Glow around Sun during Totality */}
                          {isTotality && solarSubtype === 'total' && (
                            <div className="absolute w-44 h-44 rounded-full bg-gradient-to-r from-amber-100 via-white to-amber-200 blur-md opacity-80 animate-pulse pointer-events-none" />
                          )}

                          {/* Sun Disk */}
                          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-2xl flex items-center justify-center">
                            {/* Moon Disk passing in front of Sun */}
                            <div
                              className="absolute rounded-full transition-transform duration-75 shadow-inner"
                              style={{
                                width: solarSubtype === 'cincin' ? '92px' : '112px',
                                height: solarSubtype === 'cincin' ? '92px' : '112px',
                                backgroundColor: isTotality && solarSubtype === 'total' ? '#000000' : '#0f172a',
                                transform: `translate(${moonOffsetX}px, ${solarSubtype === 'sebagian' ? '24px' : '0px'})`,
                              }}
                            />
                          </div>

                          {/* Diamond ring sparkle */}
                          {dist50 >= 4 && dist50 <= 7 && solarSubtype === 'total' && (
                            <div className="absolute z-20 text-2xl animate-spin text-white" style={{ animationDuration: '4s' }}>
                              💎
                            </div>
                          )}

                          {/* Badge Status at Bottom */}
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
                            <span className="font-bold text-slate-200">
                              {isTotality
                                ? solarSubtype === 'total'
                                  ? '🌑 Gerhana Matahari TOTAL (Korona Bercahaya!)'
                                  : solarSubtype === 'cincin'
                                  ? '⭕ Gerhana Matahari CINCIN (Ring of Fire!)'
                                  : '🌘 Gerhana Matahari SEBAGIAN'
                                : '☀️ Matahari Tertutup Sebagian'}
                            </span>
                            <span className="text-amber-400 font-mono font-bold">
                              {isTotality ? 'PUNCAK' : `${Math.round(100 - dist50 * 2)}% Tutup`}
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      // Lunar Eclipse POV
                      const isInsideUmbra = dist50 < 18;

                      return (
                        <div className="relative w-full h-[260px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center bg-gradient-to-b from-[#020617] via-[#050816] to-[#0b0f24]">
                          {/* Twinkling Stars */}
                          <div className="absolute inset-0 pointer-events-none">
                            {[
                              [30, 30], [80, 70], [240, 40], [290, 110], [50, 190],
                              [180, 220], [270, 230], [70, 130], [220, 90]
                            ].map(([sx, sy], i) => (
                              <div
                                key={i}
                                className="absolute text-slate-400 text-[10px]"
                                style={{ left: `${sx}px`, top: `${sy}px` }}
                              >
                                ✦
                              </div>
                            ))}
                          </div>

                          {/* Blood Moon Aura Glow */}
                          {isInsideUmbra && lunarSubtype === 'total' && (
                            <div className="absolute w-40 h-40 rounded-full bg-red-600/30 blur-xl animate-pulse pointer-events-none" />
                          )}

                          {/* Moon Disk in Night Sky */}
                          <div
                            className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
                            style={{
                              backgroundColor:
                                isInsideUmbra
                                  ? lunarSubtype === 'total'
                                    ? '#b91c1c'
                                    : '#334155'
                                  : dist50 < 35
                                  ? '#94a3b8'
                                  : '#f8fafc',
                              boxShadow:
                                isInsideUmbra && lunarSubtype === 'total'
                                  ? '0 0 35px rgba(239, 68, 68, 0.7)'
                                  : '0 0 20px rgba(248, 250, 252, 0.4)',
                            }}
                          >
                            {/* Moon surface details */}
                            <span className="text-3xl opacity-80">
                              {isInsideUmbra && lunarSubtype === 'total' ? '🔴' : '🌕'}
                            </span>
                          </div>

                          {/* Badge Status */}
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
                            <span className="font-bold text-rose-300">
                              {isInsideUmbra
                                ? lunarSubtype === 'total'
                                  ? '🔴 GERHANA BULAN TOTAL (BLOOD MOON)'
                                  : '🌗 GERHANA BULAN SEBAGIAN'
                                : '🌕 BULAN PURNAMA'}
                            </span>
                            <span className="text-tealbrand-400 font-mono font-bold">
                              {isInsideUmbra ? 'FASE TOTAL' : 'Di Luar Umbra'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {/* Observer Fact Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        {eclipseType === 'matahari' ? '🌡️ Suhu Udara' : '🌕 Fase Bulan'}
                      </span>
                      <p className="font-bold text-amber-300 mt-0.5">
                        {eclipseType === 'matahari'
                          ? Math.abs(eclipseProgress - 50) < 6
                            ? '23°C (Dingin Mendadak!)'
                            : '31°C (Hangat)'
                          : 'Bulan Purnama (Full Moon)'}
                      </p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        {eclipseType === 'matahari' ? '⚠️ Aturan Keamanan' : '👁️ Keamanan Melihat'}
                      </span>
                      <p
                        className={`font-bold mt-0.5 ${
                          eclipseType === 'matahari' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {eclipseType === 'matahari' ? 'Wajib Kacamata Khusus!' : '100% Aman Mata Telanjang'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TANTANGAN SUSUN POSISI (MINI-GAME) */}
          {activeEclipseTab === 'susun_posisi' && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-rose-300 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Misi Antariksawan Cilik: Susun Urutan Posisi Gerhana!
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Klik benda langit di bawah ini untuk mengisi kotak posisi dari kiri ke kanan agar tercipta gerhana yang diminta.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAlignEclipseTarget('matahari');
                      handleClearAlignSlots();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      alignEclipseTarget === 'matahari'
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🎯 Misi 1: Gerhana Matahari
                  </button>
                  <button
                    onClick={() => {
                      setAlignEclipseTarget('bulan');
                      handleClearAlignSlots();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      alignEclipseTarget === 'bulan'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🎯 Misi 2: Gerhana Bulan
                  </button>
                </div>
              </div>

              {/* Mission Goal Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Target Tantanganmu Sekarang:</span>
                <h3 className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
                  {alignEclipseTarget === 'matahari'
                    ? '☀️ Susun Benda Langit untuk Menciptakan GERHANA MATAHARI'
                    : '🌕 Susun Benda Langit untuk Menciptakan GERHANA BULAN'}
                </h3>
              </div>

              {/* 3 Slots */}
              <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto py-2">
                {[
                  { key: 'slot1', label: '1. Sumber Cahaya' },
                  { key: 'slot2', label: '2. Benda di Tengah' },
                  { key: 'slot3', label: '3. Penerima Bayangan' },
                ].map((s) => {
                  const val = alignSlots[s.key as keyof typeof alignSlots];
                  const itemLabel =
                    val === 'matahari'
                      ? '☀️ Matahari'
                      : val === 'bumi'
                      ? '🌍 Bumi'
                      : val === 'bulan'
                      ? '🌑 Bulan'
                      : 'Kosong';

                  return (
                    <div
                      key={s.key}
                      className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                        val
                          ? 'bg-slate-950 border-amber-400 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/40 border-dashed border-slate-700 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">{s.label}</span>
                      <span className="text-2xl">{val === 'matahari' ? '☀️' : val === 'bumi' ? '🌍' : val === 'bulan' ? '🌑' : '❓'}</span>
                      <span className={`text-xs font-bold mt-1 ${val ? 'text-amber-300' : 'text-slate-600'}`}>
                        {itemLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Selectable celestial bodies */}
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-400">Pilih Benda Langit untuk Dimasukkan ke Kotak:</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {[
                    { id: 'matahari', name: 'Matahari', emoji: '☀️', color: 'from-amber-400 to-orange-500 text-slate-950' },
                    { id: 'bumi', name: 'Bumi', emoji: '🌍', color: 'from-blue-600 to-teal-500 text-white' },
                    { id: 'bulan', name: 'Bulan', emoji: '🌑', color: 'from-slate-700 to-slate-900 text-white' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handlePlaceAlignItem(item.id)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r ${item.color} shadow-md transition-all active:scale-95`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <span>{item.name}</span>
                    </button>
                  ))}

                  <button
                    onClick={handleClearAlignSlots}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Slot</span>
                  </button>

                  <button
                    onClick={handleCheckAlignment}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Uji Susunan!</span>
                  </button>
                </div>
              </div>

              {/* Feedback alert */}
              {alignFeedback && (
                <div
                  className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 animate-in fade-in max-w-xl mx-auto ${
                    alignFeedback.isSuccess
                      ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/80 border border-rose-500 text-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{alignFeedback.message}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ENSIKLOPEDI UMBRA & PENUMBRA */}
          {activeEclipseTab === 'tabel_ilmu' && (
            <div className="space-y-6">
              {/* Concept comparison grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sun className="w-4 h-4" />
                    <span>☀️ Gerhana Matahari (Solar Eclipse)</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                    <li>• <strong>Susunan Posisi:</strong> Matahari ➔ <strong>Bulan</strong> ➔ Bumi.</li>
                    <li>• <strong>Waktu Terjadi:</strong> Selalu pada <strong>Siang Hari</strong> saat fase Bulan Baru (Bulan Mati).</li>
                    <li>• <strong>Penyebab:</strong> Bulan berada tepat di antara Matahari dan Bumi, menutupi pancaran sinar matahari.</li>
                    <li>• <strong>Durasi Totalitas:</strong> Sangat singkat, hanya sekitar 2 sampai 7 menit di satu titik lokasi bumi.</li>
                    <li>• <strong>Keamanan:</strong> ⚠️ <em>Wajib menggunakan kacamata filter matahari khusus ISO 12312-2! Jangan menatap langsung dengan mata telanjang.</em></li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Moon className="w-4 h-4" />
                    <span>🌕 Gerhana Bulan (Lunar Eclipse)</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                    <li>• <strong>Susunan Posisi:</strong> Matahari ➔ <strong>Bumi</strong> ➔ Bulan.</li>
                    <li>• <strong>Waktu Terjadi:</strong> Selalu pada <strong>Malam Hari</strong> saat fase Bulan Purnama.</li>
                    <li>• <strong>Penyebab:</strong> Bumi berada di antara Matahari dan Bulan, bayangan raksasa Bumi menutupi permukaan Bulan.</li>
                    <li>• <strong>Fenomena Blood Moon:</strong> Bulan tampak merah darah karena atmosfer Bumi membiaskan cahaya merah matahari (hamburan Rayleigh).</li>
                    <li>• <strong>Keamanan:</strong> ✅ <em>100% AMAN! Boleh dilihat langsung dengan mata telanjang tanpa alat pelindung.</em></li>
                  </ul>
                </div>
              </div>

              {/* Table Comparison */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3 overflow-x-auto">
                <h4 className="font-bold text-sm text-slate-200">
                  Tabel Perbandingan Rangkuman IPAS SD:
                </h4>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Aspek Pembeda</th>
                      <th className="py-2.5 px-3 text-amber-400 font-bold">☀️ Gerhana Matahari</th>
                      <th className="py-2.5 px-3 text-rose-400 font-bold">🌕 Gerhana Bulan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Benda di Tengah</td>
                      <td className="py-2.5 px-3">Bulan (menghalangi sinar)</td>
                      <td className="py-2.5 px-3">Bumi (menghalangi sinar)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Waktu Kejadian</td>
                      <td className="py-2.5 px-3">Siang hari</td>
                      <td className="py-2.5 px-3">Malam hari</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Fase Bulan</td>
                      <td className="py-2.5 px-3">Bulan Baru / Bulan Mati</td>
                      <td className="py-2.5 px-3">Bulan Purnama (Full Moon)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Jenis Bayangan</td>
                      <td className="py-2.5 px-3">Bayangan Bulan jatuh ke Bumi</td>
                      <td className="py-2.5 px-3">Bayangan Bumi jatuh ke Bulan</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Pemandangan Khas</td>
                      <td className="py-2.5 px-3">Langit gelap, korona putih bersinar</td>
                      <td className="py-2.5 px-3">Bulan merah tembaga (Blood Moon)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Alat Pengaman</td>
                      <td className="py-2.5 px-3 text-rose-400 font-bold">Wajib kacamata gerhana filter ISO</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">Aman tanpa alat pengaman</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* FAQ Accordion cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <h5 className="font-bold text-amber-300">🤔 Mengapa tidak terjadi gerhana setiap bulan?</h5>
                  <p className="text-slate-300 leading-relaxed">
                    Karena bidang orbit Bulan mengelilingi Bumi memiliki kemiringan sekitar <strong>5 derajat</strong> terhadap bidang orbit Bumi mengelilingi Matahari. Akibat kemiringan ini, pada kebanyakan bulan purnama atau bulan baru, posisi bayangan Bulan meleset sedikit di atas atau di bawah Bumi!
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <h5 className="font-bold text-rose-300">🔴 Mengapa Bulan tampak merah saat Gerhana Total?</h5>
                  <p className="text-slate-300 leading-relaxed">
                    Fenomena ini disebut <em>Hamburan Rayleigh</em>. Atmosfer Bumi menyaring dan menghamburkan warna biru bergelombang pendek, tetapi membiaskan berkas cahaya merah matahari bergelombang panjang ke permukaan Bulan. Sama seperti pemandangan langit senja di Bumi!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODUL EKSPERIMEN (6 EKSPERIMEN LENGKAP)                     */}
      {/* ============================================================== */}
      {mode === 'EKSPERIMEN' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sub-Tabs for 6 Experiments */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pb-2 border-b border-slate-800">
            {[
              { id: 1, label: 'Eksperimen 1', title: 'Poros & Rotasi', icon: RotateCcw },
              { id: 2, label: 'Eksperimen 2', title: 'Revolusi & Orbit', icon: RefreshCw },
              { id: 3, label: 'Eksperimen 3', title: 'Skala Ukuran', icon: Gauge },
              { id: 4, label: 'Eksperimen 4', title: 'Siang & Malam', icon: Sun },
              { id: 5, label: 'Eksperimen 5', title: 'Waktu & Jarak', icon: Rocket },
              { id: 6, label: 'Eksperimen 6', title: 'Gerhana Bulan & Matahari', icon: Moon },
            ].map((exp) => {
              const Icon = exp.icon;
              const isActive = activeExp === exp.id;
              return (
                <button
                  key={exp.id}
                  onClick={() => setActiveExp(exp.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{exp.label}</span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm mt-0.5 line-clamp-1">{exp.title}</h4>
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 1: POROS DAN ROTASI                               */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 1 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-amber-400" />
                    Eksperimen 1: Poros dan Gerak Rotasi Planet
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pelajari bagaimana planet berputar pada sumbu porosnya dan bagaimana kemiringan poros menentukan karakter suatu planet.
                  </p>
                </div>
                <button
                  onClick={() => {
                    confetti({ particleCount: 70, spread: 60 });
                    if (onProgressUpdate) onProgressUpdate();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visualizer (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center relative min-h-[300px]">
                  {/* Axis line */}
                  <div
                    className="absolute w-1 h-64 bg-rose-500/80 rounded transition-transform duration-300 shadow-lg shadow-rose-500/30"
                    style={{
                      transform: `rotate(${
                        exp1PlanetId === 'uranus' ? 98 : exp1PlanetId === 'venus' ? 177 : exp1PlanetId === 'jupiter' ? 3 : 23.5
                      }deg)`,
                    }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-rose-400 font-bold whitespace-nowrap">
                      Kutub Utara (N)
                    </span>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-rose-400 font-bold whitespace-nowrap">
                      Kutub Selatan (S)
                    </span>
                  </div>

                  {/* Rotating Planet Sphere */}
                  <div
                    className="w-36 h-36 rounded-full relative z-10 flex items-center justify-center text-6xl shadow-2xl transition-transform duration-75 border-4"
                    style={{
                      transform: `rotate(${exp1Angle}deg)`,
                      backgroundColor:
                        exp1PlanetId === 'bumi'
                          ? '#0284c7'
                          : exp1PlanetId === 'jupiter'
                          ? '#ea580c'
                          : exp1PlanetId === 'venus'
                          ? '#f59e0b'
                          : '#06b6d4',
                      borderColor: '#ffffff55',
                    }}
                  >
                    {exp1PlanetId === 'bumi' ? '🌍' : exp1PlanetId === 'jupiter' ? '🌀' : exp1PlanetId === 'venus' ? '⭐' : '❄️'}
                  </div>

                  {/* Rotation indicators */}
                  <div className="mt-8 text-center space-y-1 z-10">
                    <p className="text-xs font-bold text-slate-200">
                      Arah Putaran Poros:{' '}
                      <span className="text-tealbrand-400">
                        {exp1PlanetId === 'venus' ? 'Dari Timur ke Barat (Terbalik!)' : 'Dari Barat ke Timur'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Kemiringan Poros:{' '}
                      <strong className="text-amber-400 font-mono">
                        {exp1PlanetId === 'uranus' ? '98° (Rebah)' : exp1PlanetId === 'venus' ? '177°' : exp1PlanetId === 'jupiter' ? '3°' : '23,5°'}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Controls & Explanation (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Pilih Planet Pengujian:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'bumi', name: 'Bumi (24 Jam)', tilt: '23,5°' },
                        { id: 'jupiter', name: 'Jupiter (9,9 Jam)', tilt: '3°' },
                        { id: 'uranus', name: 'Uranus (Miring 98°)', tilt: '98°' },
                        { id: 'venus', name: 'Venus (Terbalik)', tilt: '177°' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setExp1PlanetId(p.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            exp1PlanetId === p.id
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <p>{p.name}</p>
                          <span className="text-[10px] opacity-80">Poros: {p.tilt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Laju Putaran:</span>
                      <span className="font-mono text-amber-400 font-bold">{exp1Speed}x Kecepatan</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.5"
                      value={exp1Speed}
                      onChange={(e) => setExp1Speed(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <button
                      onClick={() => setExp1Spinning(!exp1Spinning)}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-slate-200"
                    >
                      {exp1Spinning ? '⏸️ Jeda Rotasi' : '▶️ Lanjutkan Putaran'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-800/80 text-xs text-indigo-200 leading-relaxed">
                    💡 <strong>Konsep Sains IPAS:</strong> Rotasi adalah perputaran planet pada sumbu porosnya sendiri. Perputaran inilah yang menyebabkan terjadinya siang dan malam di Bumi!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 2: REVOLUSI DAN ORBIT                             */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 2 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-400" />
                    Eksperimen 2: Revolusi Mengitari Matahari &amp; Garis Orbit
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Buktikan bahwa semakin dekat planet ke Matahari, semakin cepat planet tersebut berputar menyelesaikan 1 tahun orbitnya!
                  </p>
                </div>
                <button
                  onClick={() => {
                    confetti({ particleCount: 70, spread: 60 });
                    if (onProgressUpdate) onProgressUpdate();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Orbit Race Track (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center relative min-h-[320px] overflow-hidden">
                  <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-2xl shadow-2xl shadow-amber-400 z-10 animate-pulse">
                    ☀️
                  </div>

                  {/* 3 Orbit Rings */}
                  <div className="absolute w-44 h-44 rounded-full border border-slate-700/80 pointer-events-none flex items-center justify-center">
                    <div
                      className="absolute w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-xs shadow-md"
                      style={{
                        transform: `rotate(${exp2Laps.merkurius * 360}deg) translate(88px) rotate(-${exp2Laps.merkurius * 360}deg)`,
                      }}
                    >
                      🪨
                    </div>
                  </div>

                  <div className="absolute w-64 h-64 rounded-full border border-tealbrand-700/60 pointer-events-none flex items-center justify-center">
                    <div
                      className="absolute w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs shadow-md"
                      style={{
                        transform: `rotate(${exp2Laps.bumi * 360}deg) translate(128px) rotate(-${exp2Laps.bumi * 360}deg)`,
                      }}
                    >
                      🌍
                    </div>
                  </div>

                  <div className="absolute w-88 h-88 rounded-full border border-amber-700/50 pointer-events-none flex items-center justify-center">
                    <div
                      className="absolute w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs shadow-md"
                      style={{
                        transform: `rotate(${exp2Laps.jupiter * 360}deg) translate(168px) rotate(-${exp2Laps.jupiter * 360}deg)`,
                      }}
                    >
                      🌀
                    </div>
                  </div>
                </div>

                {/* Lap Counter Scoreboard (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-xs text-amber-300 uppercase">
                      Papan Skor Putaran Orbit (Lap Tracker)
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-semibold text-slate-300">🪨 Merkurius (Terdekat):</span>
                        <span className="font-mono font-bold text-amber-400">
                          {exp2Laps.merkurius.toFixed(1)} Putaran (Tahun)
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-semibold text-sky-400">🌍 Bumi (Tengah):</span>
                        <span className="font-mono font-bold text-sky-400">
                          {exp2Laps.bumi.toFixed(1)} Putaran (Tahun)
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-semibold text-orange-400">🌀 Jupiter (Jauh):</span>
                        <span className="font-mono font-bold text-orange-400">
                          {exp2Laps.jupiter.toFixed(2)} Putaran (Tahun)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => setExp2Racing(!exp2Racing)}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs text-white transition-all shadow-md ${
                          exp2Racing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-600 hover:bg-brand-500'
                        }`}
                      >
                        {exp2Racing ? '⏸️ Jeda Balapan' : '🏁 Mulai Balapan Orbit'}
                      </button>

                      <button
                        onClick={() => setExp2Laps({ merkurius: 0, bumi: 0, jupiter: 0 })}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        title="Reset Putaran"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-950/50 border border-teal-800/80 text-xs text-teal-200 leading-relaxed">
                    💡 <strong>Hukum Gerak Planet:</strong> Semakin dekat suatu planet ke Matahari, lintasan orbitnya semakin pendek dan tarikan gravitasi semakin kuat, sehingga planet berputar jauh lebih cepat!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 3: SKALA UKURAN                                   */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 3 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-amber-400" />
                    Eksperimen 3: Perbandingan Skala Ukuran Nyata
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bandingkan bola planet berdampingan dalam skala ukuran yang nyata dan lihat berapa banyak Bumi yang muat di dalamnya!
                  </p>
                </div>
                <button
                  onClick={() => {
                    confetti({ particleCount: 70, spread: 60 });
                    if (onProgressUpdate) onProgressUpdate();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              {/* Horizontal Line-Up Visualizer */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
                <p className="text-xs text-slate-400 text-center">
                  Planet Ditampilkan Berjejer Sesuai Skala Proporsi Ukuran Fisik Aslinya:
                </p>

                <div className="flex items-end justify-center gap-4 sm:gap-6 py-6 overflow-x-auto min-h-[220px]">
                  {/* Sun fragment */}
                  <div className="flex flex-col items-center group cursor-pointer" onClick={() => setExp3SelectedComp('matahari')}>
                    <div className="w-24 h-48 rounded-r-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-2xl flex items-center justify-center font-bold text-slate-950 text-xs">
                      Matahari (Sepenggal)
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold mt-2">Matahari</span>
                  </div>

                  {PLANETS_SD.map((p) => {
                    const isSelected = exp3SelectedComp === p.id;
                    const pixelHeight = Math.max(16, p.sizeRatio * 18);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setExp3SelectedComp(p.id)}
                        className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-110"
                      >
                        <div
                          className={`rounded-full flex items-center justify-center text-xs shadow-lg transition-all ${
                            isSelected ? 'ring-2 ring-amber-400 scale-105' : ''
                          }`}
                          style={{
                            width: `${pixelHeight}px`,
                            height: `${pixelHeight}px`,
                            backgroundColor: p.colorHex,
                          }}
                        >
                          {p.emoji}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 mt-2 whitespace-nowrap">
                          {p.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {p.realDiameterKm.toLocaleString('id-ID')} km
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Planet Capacity Fact Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl font-bold">
                    🌍
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      Berapa Banyak Planet Bumi yang Muat di Sini?
                    </h4>
                    <p className="text-amber-300 font-bold mt-0.5">
                      {exp3SelectedComp === 'matahari'
                        ? '☀️ Matahari dapat memuat 1.300.000 (1,3 Juta) planet Bumi di dalamnya!'
                        : exp3SelectedComp === 'jupiter'
                        ? '🌀 Jupiter dapat memuat 1.300 planet Bumi di dalamnya!'
                        : exp3SelectedComp === 'saturnus'
                        ? '🪐 Saturnus dapat memuat 760 planet Bumi di dalamnya!'
                        : exp3SelectedComp === 'uranus'
                        ? '❄️ Uranus dapat memuat 63 planet Bumi di dalamnya!'
                        : exp3SelectedComp === 'neptunus'
                        ? '💨 Neptunus dapat memuat 57 planet Bumi di dalamnya!'
                        : '🪨 Planet batuan ini ukurannya lebih kecil atau seukuran dengan Bumi.'}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  Klik objek planet di atas untuk mengubah perbandingan
                </span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 4: SIANG DAN MALAM                                */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 4 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-400" />
                    Eksperimen 4: Mengapa Terjadi Siang dan Malam?
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Putar bola Bumi dan amati bagaimana cahaya Matahari menyinari sebagian Bumi menjadi Siang dan bagian belakangnya menjadi Malam.
                  </p>
                </div>
                <button
                  onClick={() => {
                    confetti({ particleCount: 70, spread: 60 });
                    if (onProgressUpdate) onProgressUpdate();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visualizer (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 border border-slate-800 flex items-center justify-between relative min-h-[300px] overflow-hidden">
                  {/* Sun on the left */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center text-4xl shadow-2xl shadow-amber-400 animate-pulse">
                      ☀️
                    </div>
                    <span className="text-xs font-bold text-amber-400 mt-2">Matahari</span>
                    <span className="text-[10px] text-amber-200/80">Sumber Cahaya</span>
                  </div>

                  {/* Light beams animation */}
                  <div className="flex-1 h-32 flex items-center justify-center opacity-60">
                    <div className="w-full h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-sky-300 animate-pulse"></div>
                  </div>

                  {/* Earth Sphere split Day / Night */}
                  <div className="relative w-36 h-36 rounded-full overflow-hidden flex shadow-2xl border-2 border-white/20 z-10">
                    {/* Day side (left) */}
                    <div className="w-1/2 h-full bg-sky-500 flex flex-col items-center justify-center p-1 text-center">
                      <Sun className="w-5 h-5 text-amber-200 animate-bounce" />
                      <span className="text-[10px] font-black text-white mt-1">SIANG</span>
                    </div>

                    {/* Night side (right) */}
                    <div className="w-1/2 h-full bg-slate-950 flex flex-col items-center justify-center p-1 text-center">
                      <Moon className="w-5 h-5 text-indigo-300" />
                      <span className="text-[10px] font-black text-slate-300 mt-1">MALAM</span>
                    </div>

                    {/* Indonesian Flag pin rotating based on hour */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        transform: `rotate(${((exp4Hour - 6) / 24) * 360}deg)`,
                      }}
                    >
                      <div className="translate-y-14 flex flex-col items-center">
                        <span className="text-base">🇮🇩</span>
                        <span className="text-[9px] font-bold text-amber-300 bg-black/80 px-1 rounded">
                          Indonesia
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hour Controller & Explanations (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Jam Waktu Indonesia:</span>
                      <span className="font-mono text-base font-extrabold text-amber-400">
                        Pukul {exp4Hour.toString().padStart(2, '0')}:00 WIB
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={exp4Hour}
                      onChange={(e) => setExp4Hour(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pt-1">
                      <span>
                        Status di Indonesia:{' '}
                        <strong className={exp4Hour >= 6 && exp4Hour <= 18 ? 'text-amber-400' : 'text-indigo-400'}>
                          {exp4Hour >= 6 && exp4Hour <= 18 ? '☀️ Waktu SIANG HARI' : '🌙 Waktu MALAM HARI'}
                        </strong>
                      </span>
                      <button
                        onClick={() => setExp4AutoPlay(!exp4AutoPlay)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-tealbrand-400 font-bold"
                      >
                        {exp4AutoPlay ? 'Jeda 24 Jam' : 'Putar 24 Jam'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200 leading-relaxed">
                    💡 <strong>Kunci Pemahaman IPAS:</strong> Matahari tidak pernah berjalan mengitari kita. Bumi kitalah yang berputar terus-menerus! Separuh yang menghadap matahari menjadi siang, dan separuh yang membelakangi menjadi malam.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 5: WAKTU DAN JARAK                                */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 5 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-amber-400" />
                    Eksperimen 5: Petualangan Menghitung Jarak dan Waktu Tempuh
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hitung berapa lama waktu yang dibutuhkan berkas cahaya matahari atau roket antariksa untuk sampai ke planet tujuan!
                  </p>
                </div>
                <button
                  onClick={() => {
                    confetti({ particleCount: 70, spread: 60 });
                    if (onProgressUpdate) onProgressUpdate();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              {/* Selector Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Pilih Kendaraan */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="font-bold text-slate-300 uppercase">1. Pilih Wahana / Kendaraan:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cahaya', name: '⚡ Berkas Cahaya', speed: '300.000 km/detik' },
                      { id: 'roket', name: '🚀 Roket Apollo', speed: '40.000 km/jam' },
                      { id: 'pesawat', name: '✈️ Pesawat Jet', speed: '900 km/jam' },
                      { id: 'mobil', name: '🚗 Mobil Cepat', speed: '100 km/jam' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setExp5Vehicle(v.id as any)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          exp5Vehicle === v.id
                            ? 'bg-brand-600 text-white border-brand-400 font-bold'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <p>{v.name}</p>
                        <span className="text-[10px] opacity-75">{v.speed}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Pilih Planet Tujuan */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="font-bold text-slate-300 uppercase">2. Pilih Planet Tujuan:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PLANETS_SD.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setExp5TargetPlanetId(p.id)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          exp5TargetPlanetId === p.id
                            ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm block">{p.emoji}</span>
                        <span className="text-[10px] line-clamp-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Action & Result Card */}
              {(() => {
                const target = PLANETS_SD.find((p) => p.id === exp5TargetPlanetId) || PLANETS_SD[3];
                const distKm = target.distMillionKm * 1000000;

                // Travel times
                const lightSeconds = distKm / 300000;
                const lightMinutes = (lightSeconds / 60).toFixed(1);

                const rocketHours = distKm / 40000;
                const rocketDays = (rocketHours / 24).toFixed(0);
                const rocketMonths = (rocketHours / (24 * 30)).toFixed(1);

                const planeYears = (distKm / 900 / 24 / 365).toFixed(1);
                const carYears = (distKm / 100 / 24 / 365).toFixed(0);

                return (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">
                          Hasil Hitungan Jarak ke {target.name}
                        </h4>
                        <p className="text-xs font-mono text-amber-400">
                          Jarak Rata-rata: {distKm.toLocaleString('id-ID')} Kilometer ({target.distMillionKm} Juta km)
                        </p>
                      </div>

                      <button
                        onClick={startExp5Simulation}
                        disabled={exp5Simulating}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>{exp5Simulating ? 'Sedang Meluncur...' : 'Luncurkan Wahana!'}</span>
                      </button>
                    </div>

                    {/* Progress flight bar */}
                    {exp5Simulating && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Matahari / Bumi</span>
                          <span>Menuju {target.name}...</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-tealbrand-400 transition-all duration-75"
                            style={{ width: `${exp5Progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Travel Time Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">⚡ Berkas Cahaya</span>
                        <p className="font-mono text-base font-extrabold text-amber-400 mt-0.5">{lightMinutes} Menit</p>
                        <span className="text-[10px] text-slate-500">Super cepat kilat!</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">🚀 Roket Apollo</span>
                        <p className="font-mono text-base font-extrabold text-tealbrand-400 mt-0.5">
                          {parseFloat(rocketMonths) > 12 ? `${(parseFloat(rocketMonths) / 12).toFixed(1)} Tahun` : `${rocketMonths} Bulan`}
                        </p>
                        <span className="text-[10px] text-slate-500">({rocketDays} Hari penerbangan)</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">✈️ Pesawat Jet</span>
                        <p className="font-mono text-base font-extrabold text-indigo-400 mt-0.5">{planeYears} Tahun</p>
                        <span className="text-[10px] text-slate-500">Terbang tanpa henti</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">🚗 Naik Mobil</span>
                        <p className="font-mono text-base font-extrabold text-rose-400 mt-0.5">{carYears} Tahun</p>
                        <span className="text-[10px] text-slate-500">Butuh berabad-abad!</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 6: GERHANA BULAN & MATAHARI                        */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 6 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-amber-400" />
                    Eksperimen 6: Menyelidiki Proses Gerhana Bulan dan Gerhana Matahari
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pelajari bagaimana kesejajaran garis lurus Matahari, Bumi, dan Bulan membentuk bayangan Umbra dan Penumbra.
                  </p>
                </div>
                <button
                  onClick={() => {
                    confetti({ particleCount: 70, spread: 60 });
                    if (onProgressUpdate) onProgressUpdate();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              {/* Quick Experiment Workspace */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Panel 1: Konsep & Uji Coba Cepat */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">1. Pilih Fenomena yang Ingin Diselidiki:</span>
                    <span className="text-[10px] text-amber-400 font-mono">IPAS SD</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setEclipseType('matahari');
                        setEclipseProgress(50);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        eclipseType === 'matahari'
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-sm">☀️ Gerhana Matahari</p>
                      <span className="text-[10px] opacity-80 font-normal">Matahari - Bulan - Bumi</span>
                    </button>

                    <button
                      onClick={() => {
                        setEclipseType('bulan');
                        setEclipseProgress(50);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        eclipseType === 'bulan'
                          ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-sm">🌕 Gerhana Bulan</p>
                      <span className="text-[10px] opacity-80 font-normal">Matahari - Bumi - Bulan</span>
                    </button>
                  </div>

                  {/* Slider Gerakan Bulan */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                      <span>Geser Posisi Orbit Bulan:</span>
                      <span className="text-amber-400 font-mono">{Math.round(eclipseProgress)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={eclipseProgress}
                      onChange={(e) => setEclipseProgress(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Sebelum Gerhana</span>
                      <span className="text-amber-400 font-bold">Puncak (Totalitas)</span>
                      <span>Gerhana Selesai</span>
                    </div>
                  </div>

                  {/* Shortcut to full Gerhana Mode */}
                  <div className="pt-2">
                    <button
                      onClick={() => setMode('GERHANA')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-all"
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Buka Simulasi Lengkap &amp; Sudut Pandang Langit Bumi ➔</span>
                    </button>
                  </div>
                </div>

                {/* Panel 2: Lembar Verifikasi Penyelidikan Sains */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200">2. Hasil Penyelidikan &amp; Kesimpulan IPAS:</h4>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                      <span className="text-amber-400 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-200">Gerhana Matahari:</strong> Terjadi pada <strong>siang hari</strong> ketika Bulan berada di antara Matahari dan Bumi (fase Bulan Baru).
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                      <span className="text-rose-400 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-200">Gerhana Bulan:</strong> Terjadi pada <strong>malam hari</strong> ketika Bumi berada di antara Matahari dan Bulan (fase Bulan Purnama), menghasilkan fenomena <em>Blood Moon</em>.
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-200">Umbra vs Penumbra:</strong> <em>Umbra</em> adalah bayangan inti gelap total, sedangkan <em>Penumbra</em> adalah bayangan kabur sebagian.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-[11px] text-amber-200 leading-relaxed">
                    💡 <strong>Tips Keselamatan:</strong> Jangan pernah melihat Gerhana Matahari langsung dengan mata telanjang! Selalu gunakan kacamata gerhana berfilter standar ISO 12312-2.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE 2D: EDUKASI INTERAKTIF & MINI GAME                     */}
      {/* ============================================================== */}
      {mode === '2D' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Banner Gerhana Promo */}
          <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-600/20 p-4 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                🌓
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  Materi IPAS: Proses Terjadinya Gerhana Bulan &amp; Gerhana Matahari!
                </h4>
                <p className="text-xs text-slate-300">
                  Ketahui mengapa terjadi gerhana, perbedaan Umbra &amp; Penumbra, serta fenomena spektakuler Blood Moon dan Korona Matahari.
                </p>
              </div>
            </div>
            <button
              onClick={() => setMode('GERHANA')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md hover:opacity-95 transition-all shrink-0"
            >
              Buka Simulasi Gerhana ➔
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
                  <span className="font-bold text-sm text-slate-200">
                    Pilih Planet untuk Membuka Rahasianya:
                  </span>
                </div>
                <button
                  onClick={() => speakPlanetFact(selectedPlanet)}
                  disabled={isPlayingAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'Sedang Membaca...' : '🔊 Suara Narasi'}</span>
                </button>
              </div>

              {/* 8 Planets Selector Ribbon */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PLANETS_SD.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanet(p);
                      speakPlanetFact(p);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center ${
                      selectedPlanet.id === p.id
                        ? 'bg-brand-600 text-white border-brand-400 scale-105 shadow-lg shadow-brand-500/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{p.emoji}</span>
                    <span className="text-[11px] font-bold mt-1 line-clamp-1">{p.name}</span>
                    <span className="text-[9px] font-mono opacity-80">#{p.order}</span>
                  </button>
                ))}
              </div>

              {/* Planet Spotlight Box */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl sm:text-5xl border-4 shadow-xl shrink-0 animate-bounce"
                  style={{
                    backgroundColor: selectedPlanet.colorHex + '33',
                    borderColor: selectedPlanet.colorHex,
                  }}
                >
                  {selectedPlanet.emoji}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-amber-400">
                      {selectedPlanet.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-tealbrand-300 border border-slate-700">
                      Urutan Ke-{selectedPlanet.order} dari Matahari
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-tealbrand-200">
                    &ldquo;{selectedPlanet.nickname}&rdquo;
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    {selectedPlanet.kidStory}
                  </p>

                  <div className="pt-1 flex items-start gap-2 text-[11px] text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>Fakta Sains:</strong> {selectedPlanet.fact}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Mini-Game */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-sm text-slate-100">
                    Tantangan: Susun Urutan Planet
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setUserOrder([]);
                    setGameFeedback(null);
                    setHasWonGame(false);
                  }}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((slotIdx) => {
                  const planetIdInSlot = userOrder[slotIdx - 1];
                  const planetObj = PLANETS_SD.find((p) => p.id === planetIdInSlot);

                  return (
                    <div
                      key={slotIdx}
                      className={`h-16 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${
                        planetObj
                          ? 'bg-slate-950 border-tealbrand-500 shadow-md shadow-tealbrand-500/20'
                          : 'bg-slate-950/40 border-dashed border-slate-700 text-slate-600'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-slate-500">#{slotIdx}</span>
                      {planetObj ? (
                        <>
                          <span className="text-sm">{planetObj.emoji}</span>
                          <span className="text-[10px] font-bold text-slate-200 truncate w-full text-center">
                            {planetObj.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-600">Kosong</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-2">Pilihan Planet:</p>
                <div className="flex flex-wrap gap-1.5">
                  {PLANETS_SD.map((p) => {
                    const alreadyPicked = userOrder.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        disabled={alreadyPicked}
                        onClick={() => handleAddPlanetToOrder(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          alreadyPicked
                            ? 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                            : 'bg-slate-800 text-slate-200 hover:bg-brand-600 hover:text-white border border-slate-700 active:scale-95'
                        }`}
                      >
                        <span>{p.emoji}</span>
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {gameFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                    hasWonGame
                      ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/80 border border-rose-500 text-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{gameFeedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE AR: AUGMENTED REALITY KAMERA NYATA                     */}
      {/* ============================================================== */}
      {mode === 'AR' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                Mode Augmented Reality (Proyeksi Tata Surya di Meja Belajarmu!)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              AR Live Projection
            </span>
          </div>

          <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/50 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {!cameraActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Simulasi Ruangan Belajar Virtual AR</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    {cameraError
                      ? 'Izin kamera belum aktif. Menampilkan simulator ruangan AR agar Anda tetap dapat meletakkan planet virtual di meja belajar!'
                      : 'Mengaktifkan sensor kamera perangkat Anda...'}
                  </p>
                </div>
              </div>
            )}

            {/* AR Hologram Orbit Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className="relative rounded-full border-2 border-emerald-400/50 animate-pulse transition-all duration-300"
                style={{
                  width: `${250 * arScale}px`,
                  height: `${250 * arScale}px`,
                  transform: 'perspective(600px) rotateX(65deg)',
                }}
              >
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-2xl shadow-amber-400 flex items-center justify-center text-lg animate-spin" style={{ animationDuration: '10s' }}>
                  ☀️
                </div>

                {PLANETS_SD.map((p, idx) => {
                  const angle = (idx * (Math.PI * 2)) / 8;
                  const rad = 115 * arScale;
                  const x = Math.cos(angle) * rad;
                  const y = Math.sin(angle) * rad;

                  return (
                    <div
                      key={p.id}
                      style={{
                        position: 'absolute',
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="flex flex-col items-center pointer-events-auto cursor-pointer group"
                      onClick={() => {
                        setSelectedPlanet(p);
                        speakPlanetFact(p);
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg transition-transform group-hover:scale-125 border border-white/60"
                        style={{ backgroundColor: p.colorHex }}
                      >
                        {p.emoji}
                      </div>
                      <span className="text-[9px] font-bold text-white bg-slate-950/80 px-1 rounded shadow mt-0.5">
                        {p.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AR Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Skala Ukuran AR:</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.1"
                  value={arScale}
                  onChange={(e) => setArScale(parseFloat(e.target.value))}
                  className="w-24 accent-emerald-500"
                />
                <span className="font-mono text-emerald-400 font-bold">{arScale}x</span>
              </div>

              <button
                onClick={() => {
                  setArPlaced(true);
                  confetti({ particleCount: 60, spread: 50 });
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kunci Posisi di Meja</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODE VR: KOKPIT 360° & CARDBOARD STEREOSKOPIK              */}
      {/* ============================================================== */}
      {mode === 'VR' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Glasses className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-200">
                Mode Kokpit Pesawat Antariksa &amp; Kacamata VR (Virtual Reality)
              </span>
            </div>

            <button
              onClick={() => setVrSplit(!vrSplit)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                vrSplit
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {vrSplit ? '🥽 Mode Layar Penuh Biasa' : '🥽 Aktifkan VR Cardboard (Dual-Eye)'}
            </button>
          </div>

          <div
            className={`relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden bg-black border border-purple-900/60 shadow-2xl ${
              vrSplit ? 'grid grid-cols-2 divide-x-2 divide-slate-800' : 'flex'
            }`}
          >
            {/* Viewport 1 */}
            <div className="relative flex-1 h-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-950/40 via-black to-slate-950">
              <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900/90 rounded-2xl shadow-inner flex flex-col justify-between p-4">
                <div className="flex justify-between text-[10px] font-mono text-purple-400">
                  <span>🚀 GARUDA ANTARIKSA I</span>
                  <span>SPEED: {(28000 * vrWarpSpeed).toLocaleString('id-ID')} KM/H</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-tealbrand-400">
                  <span>TARGET: {selectedPlanet.name.toUpperCase()}</span>
                  <span>HUD STATUS: STABLE</span>
                </div>
              </div>

              <div className="text-center space-y-3 z-10">
                <div
                  className="w-32 h-32 rounded-full mx-auto shadow-2xl shadow-purple-500/30 flex items-center justify-center text-6xl animate-pulse"
                  style={{ backgroundColor: selectedPlanet.colorHex + '44', border: `3px solid ${selectedPlanet.colorHex}` }}
                >
                  {selectedPlanet.emoji}
                </div>
                <h3 className="text-lg font-black text-amber-300 tracking-wider">
                  Mendekati {selectedPlanet.name}
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">{selectedPlanet.kidStory}</p>
              </div>
            </div>

            {/* Viewport 2 (Dual Eye) */}
            {vrSplit && (
              <div className="relative flex-1 h-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-950/40 via-black to-slate-950">
                <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900/90 rounded-2xl shadow-inner flex flex-col justify-between p-4">
                  <div className="flex justify-between text-[10px] font-mono text-purple-400">
                    <span>🚀 GARUDA ANTARIKSA I (RIGHT EYE)</span>
                    <span>SPEED: {(28000 * vrWarpSpeed).toLocaleString('id-ID')} KM/H</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-tealbrand-400">
                    <span>STEREO SYNC: 100%</span>
                  </div>
                </div>

                <div className="text-center space-y-3 z-10">
                  <div
                    className="w-32 h-32 rounded-full mx-auto shadow-2xl shadow-purple-500/30 flex items-center justify-center text-6xl animate-pulse"
                    style={{ backgroundColor: selectedPlanet.colorHex + '44', border: `3px solid ${selectedPlanet.colorHex}` }}
                  >
                    {selectedPlanet.emoji}
                  </div>
                  <h3 className="text-lg font-black text-amber-300 tracking-wider">
                    Mendekati {selectedPlanet.name}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">{selectedPlanet.kidStory}</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 z-20">
              <div className="flex items-center gap-2 text-xs">
                <Rocket className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 font-bold">Warp Speed:</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={vrWarpSpeed}
                  onChange={(e) => setVrWarpSpeed(parseFloat(e.target.value))}
                  className="w-24 accent-purple-500"
                />
                <span className="font-mono text-purple-400 font-bold">{vrWarpSpeed}x</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {PLANETS_SD.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanet(p);
                      speakPlanetFact(p);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedPlanet.id === p.id ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
