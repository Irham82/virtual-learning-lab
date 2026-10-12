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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SDSolarLabProps {
  onProgressUpdate?: () => void;
}

interface PlanetSD {
  id: string;
  name: string;
  order: number;
  nickname: string;
  emoji: string;
  colorHex: string;
  colorThree: number;
  sizeRatio: number;
  distRatio: number;
  speed: number;
  fact: string;
  kidStory: string;
  hasRing?: boolean;
}

const PLANETS_SD: PlanetSD[] = [
  {
    id: 'merkurius',
    name: 'Merkurius',
    order: 1,
    nickname: 'Planet Terkecil & Tercepat',
    emoji: '🪨',
    colorHex: '#94a3b8',
    colorThree: 0x94a3b8,
    sizeRatio: 0.9,
    distRatio: 12,
    speed: 0.045,
    fact: 'Planet paling dekat dengan Matahari! Mengitari Matahari hanya dalam 88 hari.',
    kidStory: 'Merkurius tidak punya udara, sehingga waktu siang sangat panas dan waktu malam sangat dingin!',
  },
  {
    id: 'venus',
    name: 'Venus',
    order: 2,
    nickname: 'Bintang Kejora yang Cantik',
    emoji: '⭐',
    colorHex: '#f59e0b',
    colorThree: 0xf59e0b,
    sizeRatio: 1.3,
    distRatio: 19,
    speed: 0.03,
    fact: 'Planet paling panas di tata surya karena diselimuti awan tebal gas rumah kaca!',
    kidStory: 'Venus sering terlihat berkilau terang di langit saat fajar atau senja, makanya disebut Bintang Kejora.',
  },
  {
    id: 'bumi',
    name: 'Bumi',
    order: 3,
    nickname: 'Rumah Kita Tercinta',
    emoji: '🌍',
    colorHex: '#3b82f6',
    colorThree: 0x3b82f6,
    sizeRatio: 1.4,
    distRatio: 27,
    speed: 0.02,
    fact: 'Satu-satunya planet yang memiliki air cair, oksigen, dan jutaan makhluk hidup!',
    kidStory: 'Bumi dilindungi atmosfer ajaib yang melindungi kita dari meteor dan sinar matahari yang berbahaya.',
  },
  {
    id: 'mars',
    name: 'Mars',
    order: 4,
    nickname: 'Planet Merah Berkarat',
    emoji: '🔴',
    colorHex: '#ef4444',
    colorThree: 0xef4444,
    sizeRatio: 1.1,
    distRatio: 36,
    speed: 0.015,
    fact: 'Tanahnya mengandung zat besi sehingga terlihat berwarna merah menyala.',
    kidStory: 'Mars punya gunung berapi tertinggi bernama Olympus Mons yang tiga kali lebih tinggi dari Gunung Everest!',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    order: 5,
    nickname: 'Raja Planet Raksasa',
    emoji: '🌀',
    colorHex: '#d97706',
    colorThree: 0xd97706,
    sizeRatio: 3.2,
    distRatio: 50,
    speed: 0.009,
    fact: 'Planet terbesar! Semua planet lain bisa dimasukkan ke dalam tubuh Jupiter.',
    kidStory: 'Jupiter punya badai raksasa berbentuk bintik merah besar yang sudah berputar ratusan tahun!',
  },
  {
    id: 'saturnus',
    name: 'Saturnus',
    order: 6,
    nickname: 'Planet Cincin Berkilau',
    emoji: '🪐',
    colorHex: '#fcd34d',
    colorThree: 0xfcd34d,
    sizeRatio: 2.7,
    distRatio: 64,
    speed: 0.007,
    hasRing: true,
    fact: 'Memiliki cincin megah yang terbuat dari jutaan butiran es dan batu angkasa.',
    kidStory: 'Meski sangat besar, Saturnus terbuat dari gas ringan! Kalau ada kolam raksasa, Saturnus bisa mengapung!',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    order: 7,
    nickname: 'Planet Es Menggelinding',
    emoji: '❄️',
    colorHex: '#06b6d4',
    colorThree: 0x06b6d4,
    sizeRatio: 2.0,
    distRatio: 78,
    speed: 0.005,
    fact: 'Planet es berwarna biru kehijauan yang menggelinding miring saat berputar.',
    kidStory: 'Uranus sangat dingin dan berputar miring seperti bola yang sedang menggelinding di lantai!',
  },
  {
    id: 'neptunus',
    name: 'Neptunus',
    order: 8,
    nickname: 'Raksasa Biru yang Anginnya Super Kencang',
    emoji: '💨',
    colorHex: '#2563eb',
    colorThree: 0x2563eb,
    sizeRatio: 1.9,
    distRatio: 92,
    speed: 0.003,
    fact: 'Planet paling jauh dari Matahari dengan badai angin tercepat di tata surya!',
    kidStory: 'Neptunus berwarna biru samudra pekat dan membutuhkan 165 tahun di Bumi untuk satu kali mengitari Matahari!',
  },
];

type SimulationMode = '2D' | '3D' | 'AR' | 'VR';

export function SDSolarMultiverseLab({ onProgressUpdate }: SDSolarLabProps) {
  const [mode, setMode] = useState<SimulationMode>('2D');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetSD>(PLANETS_SD[2]); // Default Bumi
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Mini-Game 2D state: Urutan planet
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [hasWonGame, setHasWonGame] = useState(false);

  // 3D Canvas ref
  const canvas3DRef = useRef<HTMLDivElement>(null);

  // AR state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [arScale, setArScale] = useState(1);
  const [arPlaced, setArPlaced] = useState(false);

  // VR state
  const [vrSplit, setVrSplit] = useState(false);
  const [vrWarpSpeed, setVrWarpSpeed] = useState(1);

  // Web Speech narration
  const speakPlanetFact = (planet: PlanetSD) => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `Halo sahabat antariksa! Ini adalah ${planet.name}, ${planet.nickname}. ${planet.kidStory} ${planet.fact}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // Slightly slower, friendly tone for kids
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

    // Check when all 8 selected
    if (newOrder.length === PLANETS_SD.length) {
      const isCorrect = newOrder.every((id, idx) => id === PLANETS_SD[idx].id);
      if (isCorrect) {
        setHasWonGame(true);
        setGameFeedback('Hebat Sekali! Kamu berhasil mengurutkan 8 Planet dari yang terdekat ke Matahari! 🌟🎖️');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        if (onProgressUpdate) onProgressUpdate();
      } else {
        setHasWonGame(false);
        setGameFeedback('Urutan masih belum pas. Ayo periksa kembali urutan planet terdekat ke terjauh!');
      }
    }
  };

  const handleResetGame = () => {
    setUserOrder([]);
    setGameFeedback(null);
    setHasWonGame(false);
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
    } catch (err) {
      console.warn('Camera access denied or unavailable, using simulated AR room background.');
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
    return () => {
      stopCamera();
    };
  }, [mode]);

  // 3D Three.js implementation for Mode 3D
  useEffect(() => {
    if (mode !== '3D' || !canvas3DRef.current) return;

    const container = canvas3DRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060919);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 65, 120);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Stars
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 500;
      starPos[i + 1] = (Math.random() - 0.5) * 500;
      starPos[i + 2] = (Math.random() - 0.5) * 500;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starsGeom, starMat);
    scene.add(stars);

    // Sun with golden glow
    const sunGeom = new THREE.SphereGeometry(6.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xffffff, 2.2, 300);
    scene.add(sunLight);
    const ambientLight = new THREE.AmbientLight(0x475569, 0.9);
    scene.add(ambientLight);

    // Planet Meshes
    const planetItems: { mesh: THREE.Mesh; data: PlanetSD; angle: number }[] = [];

    PLANETS_SD.forEach((p, idx) => {
      // Orbit circle
      const curve = new THREE.EllipseCurve(0, 0, p.distRatio, p.distRatio, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(90);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(
        points.map((pt) => new THREE.Vector3(pt.x, 0, pt.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      scene.add(orbitLine);

      // Planet sphere
      const pGeom = new THREE.SphereGeometry(p.sizeRatio, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: p.colorThree,
        roughness: 0.5,
        metalness: 0.1,
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);

      if (p.hasRing) {
        const ringGeom = new THREE.RingGeometry(p.sizeRatio * 1.5, p.sizeRatio * 2.4, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2.5;
        pMesh.add(ringMesh);
      }

      const initAngle = (idx * (Math.PI * 2)) / PLANETS_SD.length;
      pMesh.position.set(Math.cos(initAngle) * p.distRatio, 0, Math.sin(initAngle) * p.distRatio);
      scene.add(pMesh);

      planetItems.push({ mesh: pMesh, data: p, angle: initAngle });
    });

    // Animation
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      sun.rotation.y += 0.005;

      planetItems.forEach((item) => {
        item.angle += item.data.speed * 0.4;
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
      const h = canvas3DRef.current.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mode]);

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              Mata Pelajaran IPAS • Kelas 4-6 SD
            </span>
            <span className="text-xs text-tealbrand-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Multi-Experience Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Petualangan Mengenal Tata Surya (2D, 3D, AR &amp; VR)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih mode pengalaman belajar sesuai perangkat: Kartun 2D, Model 3D, Kamera Nyata AR, atau Kacamata VR!
          </p>
        </div>

        {/* 4 Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setMode('2D')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === '2D'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🎨 Mode 2D Edukasi</span>
          </button>

          <button
            onClick={() => setMode('3D')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === '3D'
                ? 'bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>🚀 Mode 3D Orbit</span>
          </button>

          <button
            onClick={() => setMode('AR')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === 'AR'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
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
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>🥽 Mode VR 360°</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MODE 2D: EDUKASI INTERAKTIF & MINI GAME SUSUN URUTAN        */}
      {/* ============================================================== */}
      {mode === '2D' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Interactive Planet Showcase */}
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

            {/* Right 5 cols: Mini-Game Susun Urutan Planet */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-sm text-slate-100">
                    Tantangan: Susun Urutan Planet
                  </h4>
                </div>
                <button
                  onClick={handleResetGame}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                  title="Ulangi Tantangan"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Klik planet di bawah sesuai urutannya dari yang paling dekat dengan Matahari:
              </p>

              {/* Order slots (1 to 8) */}
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

              {/* Planet click buttons */}
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

              {/* Feedback and badge */}
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
      {/* 2. MODE 3D: SIMULASI 3D ORBIT TATA SURYA                       */}
      {/* ============================================================== */}
      {mode === '3D' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-tealbrand-400 font-bold">
              <Eye className="w-4 h-4" />
              Eksplorasi 3D Realistis • Orbit &amp; Revolusi Planet
            </span>
            <span>💡 Gerakkan mouse untuk memutar sudut pandang 360°</span>
          </div>

          <div
            ref={canvas3DRef}
            className="w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative cursor-grab active:cursor-grabbing"
          >
            {/* Quick Planet Pills Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto pb-1 z-10">
              {PLANETS_SD.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlanet(p);
                    speakPlanetFact(p);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-md ${
                    selectedPlanet.id === p.id
                      ? 'bg-amber-400 text-slate-950 scale-105'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODE AR: AUGMENTED REALITY KAMERA NYATA                     */}
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

          {/* AR Viewport */}
          <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/50 shadow-2xl flex items-center justify-center">
            {/* Camera Video Stream */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Fallback Simulated Classroom / Room Background if camera is blocked/denied */}
            {!cameraActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">
                    Simulasi Ruangan Belajar Virtual AR
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    {cameraError
                      ? 'Izin kamera belum aktif atau perangkat tidak memiliki webcam. Menampilkan simulator ruangan AR agar Anda tetap dapat meletakkan planet virtual!'
                      : 'Mengaktifkan sensor kamera perangkat Anda...'}
                  </p>
                </div>
              </div>
            )}

            {/* AR Virtual Overlay: Holographic Grid & Orbit Plane */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className="relative rounded-full border-2 border-emerald-400/40 animate-pulse transition-all duration-300"
                style={{
                  width: `${240 * arScale}px`,
                  height: `${240 * arScale}px`,
                  transform: 'perspective(600px) rotateX(65deg)',
                }}
              >
                {/* Sun in center */}
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-2xl shadow-amber-400 flex items-center justify-center text-lg animate-spin" style={{ animationDuration: '10s' }}>
                  ☀️
                </div>

                {/* Orbiting Planets Hologram */}
                {PLANETS_SD.map((p, idx) => {
                  const angle = (idx * (Math.PI * 2)) / 8;
                  const rad = 110 * arScale;
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
                        className="w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg transition-transform group-hover:scale-125 border border-white/50"
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

            {/* AR Controls Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Ukuran Proyeksi AR:</span>
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

              <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE VR: KOKPIT 360° & STEREOSKOPIK VR BOX CARDBOARD        */}
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

          {/* VR Cockpit Container */}
          <div
            className={`relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden bg-black border border-purple-900/60 shadow-2xl ${
              vrSplit ? 'grid grid-cols-2 divide-x-2 divide-slate-800' : 'flex'
            }`}
          >
            {/* Viewport 1 (or Left Eye) */}
            <div className="relative flex-1 h-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-950/40 via-black to-slate-950">
              {/* Cockpit HUD Wireframe */}
              <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900/90 rounded-2xl shadow-inner flex flex-col justify-between p-4">
                <div className="flex justify-between text-[10px] font-mono text-purple-400">
                  <span>🚀 GARUDA ANTARIKSA I</span>
                  <span>VELOCITY: {(28000 * vrWarpSpeed).toLocaleString('id-ID')} KM/H</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-tealbrand-400">
                  <span>TARGET: {selectedPlanet.name.toUpperCase()}</span>
                  <span>STATUS: COCKPIT HUD STABLE</span>
                </div>
              </div>

              {/* Moving stars and target planet */}
              <div className="text-center space-y-3 z-10">
                <div className="w-32 h-32 rounded-full mx-auto shadow-2xl shadow-purple-500/30 flex items-center justify-center text-6xl animate-pulse" style={{ backgroundColor: selectedPlanet.colorHex + '44', border: `3px solid ${selectedPlanet.colorHex}` }}>
                  {selectedPlanet.emoji}
                </div>
                <h3 className="text-lg font-black text-amber-300 tracking-wider">
                  Mendekati {selectedPlanet.name}
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  {selectedPlanet.kidStory}
                </p>
              </div>
            </div>

            {/* Viewport 2 (Right Eye - only when VR Dual Mode is ON) */}
            {vrSplit && (
              <div className="relative flex-1 h-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-950/40 via-black to-slate-950">
                <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900/90 rounded-2xl shadow-inner flex flex-col justify-between p-4">
                  <div className="flex justify-between text-[10px] font-mono text-purple-400">
                    <span>🚀 GARUDA ANTARIKSA I (RIGHT EYE)</span>
                    <span>VELOCITY: {(28000 * vrWarpSpeed).toLocaleString('id-ID')} KM/H</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-tealbrand-400">
                    <span>TARGET: {selectedPlanet.name.toUpperCase()}</span>
                    <span>STEREO SYNC: 100%</span>
                  </div>
                </div>

                <div className="text-center space-y-3 z-10">
                  <div className="w-32 h-32 rounded-full mx-auto shadow-2xl shadow-purple-500/30 flex items-center justify-center text-6xl animate-pulse" style={{ backgroundColor: selectedPlanet.colorHex + '44', border: `3px solid ${selectedPlanet.colorHex}` }}>
                    {selectedPlanet.emoji}
                  </div>
                  <h3 className="text-lg font-black text-amber-300 tracking-wider">
                    Mendekati {selectedPlanet.name}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    {selectedPlanet.kidStory}
                  </p>
                </div>
              </div>
            )}

            {/* VR Control Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 z-20">
              <div className="flex items-center gap-2 text-xs">
                <Rocket className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 font-bold">Laju Pesawat:</span>
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
                      selectedPlanet.id === p.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
