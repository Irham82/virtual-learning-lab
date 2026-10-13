'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Eye,
  Compass,
  Camera,
  Glasses,
  FlaskConical,
  Volume2,
  Trophy,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  X,
  Award,
  Plus,
  Minus,
  Scale,
  Layers,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Clock,
  Heart,
  Droplets,
  Car,
  Gauge,
  DollarSign,
  Calculator,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SDMathRatioLabProps {
  onProgressUpdate?: () => void;
}

// Item themes for 2D visual ratio
interface RatioTheme {
  id: string;
  name: string;
  labelA: string;
  labelB: string;
  emojiA: string;
  emojiB: string;
  colorA: string;
  colorB: string;
  bgA: string;
  bgB: string;
}

const RATIO_THEMES: RatioTheme[] = [
  {
    id: 'buah',
    name: '🍎 Apel Merah & 🍊 Jeruk Manis',
    labelA: 'Apel Merah',
    labelB: 'Jeruk Manis',
    emojiA: '🍎',
    emojiB: '🍊',
    colorA: 'text-rose-400',
    colorB: 'text-amber-400',
    bgA: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    bgB: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  },
  {
    id: 'kue',
    name: '🧁 Cupcake & 🍩 Donat Cokelat',
    labelA: 'Cupcake Vanila',
    labelB: 'Donat Cokelat',
    emojiA: '🧁',
    emojiB: '🍩',
    colorA: 'text-pink-400',
    colorB: 'text-amber-600',
    bgA: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
    bgB: 'bg-amber-800/20 border-amber-700/40 text-amber-300',
  },
  {
    id: 'kendaraan',
    name: '🚗 Mobil Biru & 🚀 Roket Mini',
    labelA: 'Mobil Biru',
    labelB: 'Roket Mini',
    emojiA: '🚗',
    emojiB: '🚀',
    colorA: 'text-sky-400',
    colorB: 'text-indigo-400',
    bgA: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
    bgB: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  },
  {
    id: 'permata',
    name: '⭐ Bintang Emas & 💎 Berlian Biru',
    labelA: 'Bintang Emas',
    labelB: 'Berlian Biru',
    emojiA: '⭐',
    emojiB: '💎',
    colorA: 'text-yellow-400',
    colorB: 'text-cyan-400',
    bgA: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    bgB: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  },
];

// Helper: Calculate greatest common divisor (FPB)
function calculateGCD(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function SDMathRatioMultiverseLab({ onProgressUpdate }: SDMathRatioLabProps) {
  // Current active mode: '2D' | '3D' | 'AR' | 'VR' | 'EKSPERIMEN'
  const [mode, setMode] = useState<'2D' | '3D' | 'AR' | 'VR' | 'EKSPERIMEN'>('2D');

  // Core Ratio Values (A : B)
  const [countA, setCountA] = useState<number>(4);
  const [countB, setCountB] = useState<number>(6);
  const [selectedTheme, setSelectedTheme] = useState<RatioTheme>(RATIO_THEMES[0]);

  // Derived ratio values
  const gcd = calculateGCD(countA, countB);
  const simpleA = countA / gcd;
  const simpleB = countB / gcd;
  const totalItems = countA + countB;
  const percentA = totalItems > 0 ? Math.round((countA / totalItems) * 100) : 0;
  const percentB = totalItems > 0 ? 100 - percentA : 0;

  // Mini-Game 2D State
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameTargetRatio, setGameTargetRatio] = useState<{ a: number; b: number }>({ a: 2, b: 3 });
  const [gameOptions, setGameOptions] = useState<{ a: number; b: number; isCorrect: boolean }[]>([]);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);

  // 3D Three.js State & Refs
  const canvas3DRef = useRef<HTMLDivElement>(null);
  const [threeTowerMode, setThreeTowerMode] = useState<'tower' | 'volume'>('tower');
  const [threeAutoRotate, setThreeAutoRotate] = useState<boolean>(true);
  const [threeSelectedBlock, setThreeSelectedBlock] = useState<{ type: 'A' | 'B'; index: number } | null>(null);

  // AR State & Video Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [arPlaced, setArPlaced] = useState<boolean>(false);
  const [arScale, setArScale] = useState<number>(1.2);
  const [arPhotoTaken, setArPhotoTaken] = useState<boolean>(false);

  // VR State
  const [vrSplit, setVrSplit] = useState<boolean>(false);
  const [vrStation, setVrStation] = useState<'tower' | 'scale' | 'color'>('tower');
  const [vrLookX, setVrLookX] = useState<number>(0);

  // Modul Eksperimen (1 to 5)
  const [activeExp, setActiveExp] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedExp, setCompletedExp] = useState<Record<number, boolean>>({});

  // Eksperimen 1: Resep Sirup Manis
  const [exp1Sirup, setExp1Sirup] = useState<number>(2); // sendok sirup
  const [exp1Air, setExp1Air] = useState<number>(6); // gelas air
  const [exp1Mixing, setExp1Mixing] = useState<boolean>(false);

  // Eksperimen 2: Miniatur Mainan & Skala Denah
  const [exp2ScaleDenominator, setExp2ScaleDenominator] = useState<number>(40); // 1:40
  const [exp2ModelSizeCm, setExp2ModelSizeCm] = useState<number>(10); // 10 cm

  // Eksperimen 3: Timbangan Proporsi Ajaib
  const [exp3LeftA, setExp3LeftA] = useState<number>(3);
  const [exp3LeftB, setExp3LeftB] = useState<number>(4);
  const [exp3RightA, setExp3RightA] = useState<number>(6);
  const [exp3RightB, setExp3RightB] = useState<number>(8);

  // Eksperimen 4: Model Diagram Pita (Tape Diagram Kurikulum Merdeka)
  const [exp4RatioA, setExp4RatioA] = useState<number>(3); // Uang Budi
  const [exp4RatioB, setExp4RatioB] = useState<number>(5); // Uang Ani
  const [exp4TotalMoney, setExp4TotalMoney] = useState<number>(40000); // Rp 40.000

  // Eksperimen 5: Lomba Balap Kecepatan (Rasio Jarak terhadap Waktu)
  const [exp5Racing, setExp5Racing] = useState<boolean>(false);
  const [exp5ProgressA, setExp5ProgressA] = useState<number>(0);
  const [exp5ProgressB, setExp5ProgressB] = useState<number>(0);
  const [exp5Winner, setExp5Winner] = useState<string | null>(null);

  // Web Speech API Narrator
  const speakExplanation = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Generate mini-game options for 2D
  const initMiniGame = () => {
    const basePairs = [
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
      { a: 1, b: 3 },
      { a: 2, b: 5 },
      { a: 3, b: 5 },
    ];
    const target = basePairs[Math.floor(Math.random() * basePairs.length)];
    setGameTargetRatio(target);

    const multCorrect = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    const correctOpt = { a: target.a * multCorrect, b: target.b * multCorrect, isCorrect: true };

    const wrong1 = { a: target.a * 2 + 1, b: target.b * 2, isCorrect: false };
    const wrong2 = { a: target.a * 3, b: target.b * 3 + 2, isCorrect: false };
    const wrong3 = { a: target.a + 2, b: target.b + 1, isCorrect: false };

    const opts = [correctOpt, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
    setGameOptions(opts);
    setGameFeedback(null);
  };

  useEffect(() => {
    initMiniGame();
  }, []);

  const handlePickGameOption = (opt: { a: number; b: number; isCorrect: boolean }) => {
    if (opt.isCorrect) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setGameScore((s) => s + 10);
      setGameFeedback(`🎉 HEBAT! Rasio ${opt.a} : ${opt.b} senilai dengan ${gameTargetRatio.a} : ${gameTargetRatio.b} karena dikalikan faktor yang sama!`);
      speakExplanation(`Hebat sekali! Jawabanmu benar, kedua rasio tersebut senilai!`);
      setTimeout(() => {
        initMiniGame();
      }, 2500);
    } else {
      setGameFeedback(`❌ Belum tepat. Ayo coba bagi ${opt.a} dan ${opt.b} dengan faktor yang sama!`);
    }
  };

  // Mark an experiment as complete
  const markExperimentDone = (expNum: 1 | 2 | 3 | 4 | 5) => {
    confetti({ particleCount: 75, spread: 60 });
    setCompletedExp((prev) => ({ ...prev, [expNum]: true }));
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  };

  // =========================================================================
  // THREE.JS 3D SCENE: TOWERS & SPATIAL BLOCKS
  // =========================================================================
  useEffect(() => {
    if (mode !== '3D' || !canvas3DRef.current) return;

    const container = canvas3DRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    // Fog for cinematic depth
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLightA = new THREE.PointLight(0x38bdf8, 2, 50);
    pointLightA.position.set(-6, 12, 6);
    scene.add(pointLightA);

    const pointLightB = new THREE.PointLight(0xf59e0b, 2, 50);
    pointLightB.position.set(6, 12, 6);
    scene.add(pointLightB);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Floor surface
    const floorGeo = new THREE.PlaneGeometry(32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Group for towers that can rotate
    const towersGroup = new THREE.Group();
    scene.add(towersGroup);

    const interactiveBlocks: THREE.Mesh[] = [];

    // Build Tower A (Color Cyan/Blue)
    const blockGeo = new THREE.BoxGeometry(2.2, 1.5, 2.2);
    const edgesGeo = new THREE.EdgesGeometry(blockGeo);

    const matA = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.2,
    });

    const matB = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.2,
    });

    const edgeLineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

    // Tower A position X = -4.5
    for (let i = 0; i < countA; i++) {
      const block = new THREE.Mesh(blockGeo, matA.clone());
      block.position.set(-4.5, 0.75 + i * 1.6, 0);
      block.castShadow = true;
      block.receiveShadow = true;
      block.userData = { type: 'A', index: i + 1, total: countA };

      const edgeLine = new THREE.LineSegments(edgesGeo, edgeLineMat);
      block.add(edgeLine);

      towersGroup.add(block);
      interactiveBlocks.push(block);
    }

    // Tower B position X = +4.5
    for (let j = 0; j < countB; j++) {
      const block = new THREE.Mesh(blockGeo, matB.clone());
      block.position.set(4.5, 0.75 + j * 1.6, 0);
      block.castShadow = true;
      block.receiveShadow = true;
      block.userData = { type: 'B', index: j + 1, total: countB };

      const edgeLine = new THREE.LineSegments(edgesGeo, edgeLineMat);
      block.add(edgeLine);

      towersGroup.add(block);
      interactiveBlocks.push(block);
    }

    // Pedestals
    const baseGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.4, 32);
    const baseMatA = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.5 });
    const baseMeshA = new THREE.Mesh(baseGeo, baseMatA);
    baseMeshA.position.set(-4.5, 0.2, 0);
    baseMeshA.receiveShadow = true;
    towersGroup.add(baseMeshA);

    const baseMatB = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
    const baseMeshB = new THREE.Mesh(baseGeo, baseMatB);
    baseMeshB.position.set(4.5, 0.2, 0);
    baseMeshB.receiveShadow = true;
    towersGroup.add(baseMeshB);

    // Raycaster for clicking blocks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveBlocks);

      if (intersects.length > 0) {
        const target = intersects[0].object as THREE.Mesh;
        const uData = target.userData;
        if (uData && uData.type) {
          setThreeSelectedBlock({ type: uData.type, index: uData.index });
          speakExplanation(
            `Ini adalah balok ${uData.type === 'A' ? selectedTheme.labelA : selectedTheme.labelB} tingkat ke-${uData.index} dari total ${uData.total} balok!`
          );
        }
      }
    };

    // Mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      towersGroup.rotation.y += deltaX * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('click', onPointerClick);
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (threeAutoRotate && !isDragging) {
        towersGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('click', onPointerClick);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [mode, countA, countB, threeAutoRotate, selectedTheme]);

  // =========================================================================
  // AR CAMERA HANDLER
  // =========================================================================
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      setCameraError(null);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setCameraActive(true);
        } else {
          setCameraError('Kamera tidak didukung oleh browser ini. Menggunakan simulasi meja virtual.');
        }
      } catch (err) {
        setCameraError('Izin akses kamera belum diberikan. Menggunakan simulasi latar meja virtual.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // =========================================================================
  // EKSPERIMEN 5: LOMBA BALAP KECEPATAN (Rasio s / t)
  // =========================================================================
  const startExp5Race = () => {
    if (exp5Racing) return;
    setExp5Racing(true);
    setExp5ProgressA(0);
    setExp5ProgressB(0);
    setExp5Winner(null);

    // Kancil Cerdas: v = 12m / 2s = 6 m/s
    // Kelinci Cepat: v = 15m / 3s = 5 m/s
    const interval = setInterval(() => {
      setExp5ProgressA((prev) => {
        const next = prev + 6;
        if (next >= 100) {
          clearInterval(interval);
          setExp5Racing(false);
          setExp5Winner('Kancil Cerdas 🦊');
          confetti({ particleCount: 70, spread: 60 });
          return 100;
        }
        return next;
      });

      setExp5ProgressB((prev) => {
        const next = prev + 5;
        return next >= 100 ? 100 : next;
      });
    }, 120);
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* ============================================================== */}
      {/* HEADER WITH 5 MODE SELECTOR TABS                               */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              Matematika SD • Kelas 5-6 (Fase C)
            </span>
            <span className="text-xs text-tealbrand-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Kurikulum Merdeka Interaktif
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Petualangan Rasio &amp; Proporsi Ajaib (2D, 3D, AR, VR &amp; Eksperimen)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pahami perbandingan rasio senilai secara visual: Diagram Pita 2D, Balok 3D Three.js, Kamera AR Meja Nyata, Ruang Kelas VR 360°, dan 5 Eksperimen Sains Matematika!
          </p>
        </div>

        {/* 5 Main Mode Navigation Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setMode('2D')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === '2D'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🎨 Mode 2D Visual</span>
          </button>

          <button
            onClick={() => setMode('3D')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              mode === '3D'
                ? 'bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 text-white shadow-lg shadow-tealbrand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>🧱 Mode 3D Balok</span>
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
            <span>🧪 5 Modul Eksperimen</span>
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
      {/* 1. MODE 2D: DIAGRAM PITA, BENDA INTERAKTIF & TANTANGAN TEBAK   */}
      {/* ============================================================== */}
      {mode === '2D' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Theme Selector Ribbon */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Pilih Tema Benda:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {RATIO_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTheme.id === theme.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                speakExplanation(
                  `Rasio saat ini adalah ${countA} berbanding ${countB}. Jika disederhanakan dengan FPB ${gcd}, hasilnya menjadi ${simpleA} berbanding ${simpleB}.`
                )
              }
              className="px-3 py-1.5 rounded-xl bg-tealbrand-600/30 hover:bg-tealbrand-600/50 text-tealbrand-300 border border-tealbrand-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>🔊 Dengarkan Penjelasan</span>
            </button>
          </div>

          {/* Core Visualizer: Dual Object Grids + Tape Diagrams */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Controls & Visual Displays */}
            <div className="lg:col-span-7 space-y-4">
              {/* Sliders and Quantity Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Object A */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${selectedTheme.colorA}`}>
                      <span className="text-lg">{selectedTheme.emojiA}</span>
                      <span>{selectedTheme.labelA} (A)</span>
                    </span>
                    <span className="text-lg font-black font-mono text-white">{countA}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCountA(Math.max(1, countA - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={countA}
                      onChange={(e) => setCountA(parseInt(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <button
                      onClick={() => setCountA(Math.min(16, countA + 1))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Visual Grid for A */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 min-h-[58px] flex flex-wrap gap-1.5 items-center">
                    {Array.from({ length: countA }).map((_, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-sm shadow animate-in zoom-in-75 duration-150"
                      >
                        {selectedTheme.emojiA}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Object B */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${selectedTheme.colorB}`}>
                      <span className="text-lg">{selectedTheme.emojiB}</span>
                      <span>{selectedTheme.labelB} (B)</span>
                    </span>
                    <span className="text-lg font-black font-mono text-white">{countB}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCountB(Math.max(1, countB - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={countB}
                      onChange={(e) => setCountB(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <button
                      onClick={() => setCountB(Math.min(16, countB + 1))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Visual Grid for B */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 min-h-[58px] flex flex-wrap gap-1.5 items-center">
                    {Array.from({ length: countB }).map((_, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm shadow animate-in zoom-in-75 duration-150"
                      >
                        {selectedTheme.emojiB}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kurikulum Merdeka SD: Diagram Pita (Tape Diagram / Bar Model) */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-tealbrand-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Model Diagram Pita (Kurikulum Merdeka)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    FPB (Faktor Pembagi) = <strong className="text-tealbrand-300 font-bold">{gcd}</strong>
                  </span>
                </div>

                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {/* Bar Pita A */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className={selectedTheme.colorA}>Pita {selectedTheme.labelA}:</span>
                      <span className="font-mono text-slate-300">
                        {simpleA} Bagian Kotak Satuan (x {gcd} = {countA})
                      </span>
                    </div>
                    <div className="flex gap-1 h-8">
                      {Array.from({ length: simpleA }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center text-xs font-black text-white shadow"
                        >
                          {gcd}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bar Pita B */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className={selectedTheme.colorB}>Pita {selectedTheme.labelB}:</span>
                      <span className="font-mono text-slate-300">
                        {simpleB} Bagian Kotak Satuan (x {gcd} = {countB})
                      </span>
                    </div>
                    <div className="flex gap-1 h-8">
                      {Array.from({ length: simpleB }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-xs font-black text-white shadow"
                        >
                          {gcd}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>Pemahaman Konsep:</strong> Setiap satu kotak satuan bernilai <strong>{gcd}</strong> buah.{' '}
                  Maka perbandingan paling sederhananya adalah <strong>{simpleA} : {simpleB}</strong>.
                </p>
              </div>
            </div>

            {/* Right 5 cols: Ratio Summary Cards & Mini-Game */}
            <div className="lg:col-span-5 space-y-4">
              {/* Ratio Formula Cards */}
              <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 p-5 rounded-2xl border border-indigo-800/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-900/50">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                    Hasil Analisis Rasio
                  </span>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                    A : B
                  </span>
                </div>

                {/* Big Ratio Display */}
                <div className="text-center py-2 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-3">
                    <span className="text-rose-400">{countA}</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-amber-400">{countB}</span>
                  </div>
                  <p className="text-xs text-slate-400">Rasio Asli Jumlah Objek</p>
                </div>

                {/* Simplified Ratio Box */}
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Bentuk Paling Sederhana:</p>
                    <p className="text-lg font-black text-tealbrand-300">
                      {simpleA} : {simpleB}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Dibagi FPB:</p>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800">
                      ÷ {gcd}
                    </span>
                  </div>
                </div>

                {/* Percentage & Fraction Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Bagian A dari Total:</span>
                    <p className="font-bold text-rose-300 font-mono mt-0.5">
                      {countA}/{totalItems} ({percentA}%)
                    </p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Bagian B dari Total:</span>
                    <p className="font-bold text-amber-300 font-mono mt-0.5">
                      {countB}/{totalItems} ({percentB}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini-Game: Tebak Rasio Senilai */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-xs text-slate-100">Tantangan: Cari Rasio Senilai!</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                    Skor: {gameScore} ⭐
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">Manakah perbandingan yang <strong>senilai</strong> dengan:</p>
                  <p className="text-2xl font-black text-amber-300 my-1 font-mono">
                    {gameTargetRatio.a} : {gameTargetRatio.b}
                  </p>
                  <p className="text-[10px] text-slate-500">Pilih salah satu kartu di bawah ini:</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {gameOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePickGameOption(opt)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-brand-500 text-sm font-mono font-bold text-slate-200 transition-all active:scale-95 text-center shadow"
                    >
                      {opt.a} : {opt.b}
                    </button>
                  ))}
                </div>

                {gameFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold animate-in fade-in leading-relaxed ${
                      gameFeedback.startsWith('🎉')
                        ? 'bg-emerald-950/80 border border-emerald-500/80 text-emerald-200'
                        : 'bg-rose-950/80 border border-rose-500/80 text-rose-200'
                    }`}
                  >
                    {gameFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODE 3D: MENARA BALOK SPASIAL THREE.JS                     */}
      {/* ============================================================== */}
      {mode === '3D' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="flex items-center gap-2 text-tealbrand-400 font-bold">
              <Eye className="w-4 h-4" />
              <span>Simulasi 3D Balok Cuisenaire Berpijar di Ruang WebGL</span>
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-amber-300">
                👆 <strong>Klik balok mana saja</strong> untuk melihat tingkat balok!
              </span>
              <span>🖱️ Drag: Putar Sudut 360°</span>
            </div>
          </div>

          {/* 3D WebGL Canvas */}
          <div
            ref={canvas3DRef}
            className="w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950"
          >
            {/* Overlay HUD Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-sky-500/50 text-xs font-mono font-bold text-sky-300 flex items-center gap-1.5 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span>Menara {selectedTheme.labelA}: {countA} Balok</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-amber-500/50 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Menara {selectedTheme.labelB}: {countB} Balok</span>
              </div>
            </div>

            {/* Quick 3D Adjusters & Controls */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-sky-300 font-bold">Tinggi A:</span>
                  <button
                    onClick={() => setCountA(Math.max(1, countA - 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white px-1">{countA}</span>
                  <button
                    onClick={() => setCountA(Math.min(12, countA + 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-700"></div>

                <div className="flex items-center gap-1">
                  <span className="text-amber-300 font-bold">Tinggi B:</span>
                  <button
                    onClick={() => setCountB(Math.max(1, countB - 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white px-1">{countB}</span>
                  <button
                    onClick={() => setCountB(Math.min(12, countB + 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setThreeAutoRotate(!threeAutoRotate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    threeAutoRotate
                      ? 'bg-tealbrand-600/40 text-tealbrand-200 border-tealbrand-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {threeAutoRotate ? '🔄 Putar Otomatis: On' : '⏸️ Putar Otomatis: Off'}
                </button>
              </div>
            </div>
          </div>

          {/* Selected Block Info Card */}
          {threeSelectedBlock && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-tealbrand-500/50 shadow-xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow ${
                    threeSelectedBlock.type === 'A' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {threeSelectedBlock.type === 'A' ? selectedTheme.emojiA : selectedTheme.emojiB}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Balok {threeSelectedBlock.type === 'A' ? selectedTheme.labelA : selectedTheme.labelB} Tingkat #{threeSelectedBlock.index}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Tinggi tingkat ini menyumbang 1 bagian dari rasio {countA} : {countB}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setThreeSelectedBlock(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODE EKSPERIMEN: 5 MODUL SAINS MATEMATIKA KURIKULUM MERDEKA */}
      {/* ============================================================== */}
      {mode === 'EKSPERIMEN' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sub-Tabs for 5 Experiments */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-2 border-b border-slate-800">
            {[
              { id: 1, label: 'Eksperimen 1', title: 'Resep Sirup Manis', icon: Droplets },
              { id: 2, label: 'Eksperimen 2', title: 'Miniatur & Skala Peta', icon: Car },
              { id: 3, label: 'Eksperimen 3', title: 'Timbangan Ajaib', icon: Scale },
              { id: 4, label: 'Eksperimen 4', title: 'Model Diagram Pita', icon: Layers },
              { id: 5, label: 'Eksperimen 5', title: 'Lomba Kecepatan', icon: Gauge },
            ].map((exp) => {
              const Icon = exp.icon;
              const isActive = activeExp === exp.id;
              const isDone = completedExp[exp.id];

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
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{exp.label}</span>
                    </span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm mt-0.5 line-clamp-1">{exp.title}</h4>
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 1: RESEP SIRUP MANIS (Rasio Takaran Air : Sirup)   */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 1 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-amber-400" />
                    Eksperimen 1: Resep Sirup Manis (Rasio Takaran Air &amp; Sirup)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pahami bagaimana rasa sirup ditentukan oleh <strong>rasio</strong>, bukan banyaknya air saja! 1 sirup : 3 air sama manisnya dengan 2 sirup : 6 air.
                  </p>
                </div>
                <button
                  onClick={() => markExperimentDone(1)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visual Glass & Syrup Pitcher */}
                <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px] relative">
                  {/* Glass Container */}
                  <div className="w-36 h-56 rounded-b-3xl border-4 border-slate-500/60 bg-slate-900/50 relative overflow-hidden flex flex-col justify-end shadow-2xl">
                    {/* Liquid layer */}
                    <div
                      className={`w-full transition-all duration-500 rounded-b-2xl ${
                        exp1Sirup / exp1Air > 0.4
                          ? 'bg-rose-600/90' // Too sweet / concentrated
                          : exp1Sirup / exp1Air >= 0.25
                          ? 'bg-rose-500/70' // Ideal sweet (1:3 or 1:4)
                          : 'bg-rose-400/40' // Too bland
                      }`}
                      style={{
                        height: `${Math.min(95, ((exp1Sirup + exp1Air) / 12) * 100)}%`,
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Taste Indicator Badge */}
                  <div className="mt-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        Math.abs(exp1Sirup / exp1Air - 0.33) < 0.05
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                          : exp1Sirup / exp1Air > 0.45
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500'
                      }`}
                    >
                      {Math.abs(exp1Sirup / exp1Air - 0.33) < 0.05
                        ? '😋 Rasa Pas & Segar! (Rasio Ideal 1 : 3)'
                        : exp1Sirup / exp1Air > 0.45
                        ? '😖 Terlalu Manis / Pekat! (Sirup Kebanyakan)'
                        : '😐 Terlalu Hambar! (Air Kebanyakan)'}
                    </span>
                  </div>
                </div>

                {/* Controls & Math Concept */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-rose-400 font-bold">🍓 Sendok Sirup:</span>
                        <span className="font-mono text-white font-bold">{exp1Sirup} Sendok</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={exp1Sirup}
                        onChange={(e) => setExp1Sirup(parseInt(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-sky-400 font-bold">💧 Gelas Air:</span>
                        <span className="font-mono text-white font-bold">{exp1Air} Gelas</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={exp1Air}
                        onChange={(e) => setExp1Air(parseInt(e.target.value))}
                        className="w-full accent-sky-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <p className="font-bold text-slate-200">
                      Rasio Takaran: <span className="text-amber-400 font-mono">{exp1Sirup} Sirup : {exp1Air} Air</span>
                    </p>
                    <p className="text-slate-400">
                      Bentuk Sederhana: <strong className="text-tealbrand-300">{exp1Sirup / calculateGCD(exp1Sirup, exp1Air)} : {exp1Air / calculateGCD(exp1Sirup, exp1Air)}</strong>
                    </p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      💡 <strong>Pelajaran Sains:</strong> Rasa manis sirup ditentukan oleh <em>konsentrasi</em> (perbandingan sirup terhadap air). Selama rasionya sama (misalnya 1:3 dengan 2:6), rasa manisnya akan persis sama!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 2: MINIATUR MAINAN & SKALA PETA (1 : n)           */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 2 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-400" />
                    Eksperimen 2: Miniatur Mainan &amp; Skala Ukuran (1 : n)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Skala adalah rasio antara ukuran pada gambar/model terhadap ukuran sesungguhnya di dunia nyata.
                  </p>
                </div>
                <button
                  onClick={() => markExperimentDone(2)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visual Model vs Real Size */}
                <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                  {/* Toy Car */}
                  <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <div className="text-4xl">🏎️</div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">Ukuran Miniatur Mainan:</p>
                      <p className="text-lg font-black text-amber-400 font-mono">{exp2ModelSizeCm} cm</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                      Skala 1 : {exp2ScaleDenominator}
                    </span>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex justify-center text-slate-500">
                    <ArrowRight className="w-6 h-6 rotate-90 sm:rotate-0" />
                  </div>

                  {/* Real Car */}
                  <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <div className="text-5xl">🚗</div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">Ukuran Mobil Sesungguhnya:</p>
                      <p className="text-2xl font-black text-emerald-400 font-mono">
                        {(exp2ModelSizeCm * exp2ScaleDenominator) / 100} Meter ({exp2ModelSizeCm * exp2ScaleDenominator} cm)
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      Ukuran Asli
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-bold">Panjang Miniatur (cm):</span>
                        <span className="font-mono text-amber-400 font-bold">{exp2ModelSizeCm} cm</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        value={exp2ModelSizeCm}
                        onChange={(e) => setExp2ModelSizeCm(parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-bold">Faktor Skala (1 : n):</span>
                        <span className="font-mono text-tealbrand-400 font-bold">1 : {exp2ScaleDenominator}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[20, 40, 50].map((s) => (
                          <button
                            key={s}
                            onClick={() => setExp2ScaleDenominator(s)}
                            className={`py-1.5 rounded-lg border font-mono font-bold transition-all ${
                              exp2ScaleDenominator === s
                                ? 'bg-tealbrand-600 text-white border-tealbrand-500'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            1 : {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 leading-relaxed">
                    💡 <strong>Rumus Skala:</strong> Ukuran Nyata = Ukuran Gambar × Nilai Skala.{' '}
                    Jika skala 1 : 40, artinya setiap 1 cm pada mainan mewakili 40 cm pada mobil asli!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 3: TIMBANGAN PROPORSI AJAIB (Keseimbangan Rasio)   */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 3 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-400" />
                    Eksperimen 3: Timbangan Proporsi Ajaib (Uji Rasio Senilai)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dua rasio A:B dan C:D dikatakan senilai jika perkalian silangnya sama: (A × D) = (B × C).
                  </p>
                </div>
                <button
                  onClick={() => markExperimentDone(3)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              {/* Balance Scale Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visual Scale (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
                  {/* Lever / Beam that tilts */}
                  {(() => {
                    const crossLeft = exp3LeftA * exp3RightB;
                    const crossRight = exp3LeftB * exp3RightA;
                    const tiltDeg = Math.max(-15, Math.min(15, (crossRight - crossLeft) * 0.8));
                    const isBalanced = crossLeft === crossRight;

                    return (
                      <div className="w-full flex flex-col items-center">
                        <div
                          className="w-72 sm:w-96 h-4 bg-amber-500 rounded-full relative transition-transform duration-500 shadow-lg flex items-center justify-between px-2"
                          style={{ transform: `rotate(${tiltDeg}deg)` }}
                        >
                          {/* Left Pan */}
                          <div className="w-24 bg-slate-900 border-2 border-sky-400 rounded-2xl p-2.5 text-center shadow-xl -mt-16">
                            <span className="text-[10px] text-sky-300 font-bold block">Piring Kiri</span>
                            <span className="text-base font-black text-white font-mono">
                              {exp3LeftA} : {exp3LeftB}
                            </span>
                          </div>

                          {/* Center Fulcrum Indicator */}
                          <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white"></div>

                          {/* Right Pan */}
                          <div className="w-24 bg-slate-900 border-2 border-amber-400 rounded-2xl p-2.5 text-center shadow-xl -mt-16">
                            <span className="text-[10px] text-amber-300 font-bold block">Piring Kanan</span>
                            <span className="text-base font-black text-white font-mono">
                              {exp3RightA} : {exp3RightB}
                            </span>
                          </div>
                        </div>

                        {/* Stand Base */}
                        <div className="w-8 h-24 bg-slate-700 rounded-b mt-0"></div>
                        <div className="w-32 h-4 bg-slate-600 rounded-full"></div>

                        {/* Status Alert */}
                        <div className="mt-6 text-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                              isBalanced
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                                : 'bg-rose-950 text-rose-300 border-rose-500'
                            }`}
                          >
                            {isBalanced
                              ? '⚖️ SEIMBANG! Rasio Kiri dan Kanan Senilai!'
                              : '⚠️ BELUM SEIMBANG! Nilai Perbandingan Berbeda'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Adjusters (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-sky-400 uppercase">Rasio Kiri (A : B):</p>
                    <div className="flex gap-2 items-center text-xs">
                      <span className="text-slate-400">A:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={exp3LeftA}
                        onChange={(e) => setExp3LeftA(parseInt(e.target.value) || 1)}
                        className="w-16 p-1.5 rounded bg-slate-900 border border-slate-700 text-center font-mono font-bold"
                      />
                      <span className="text-slate-400">:</span>
                      <span className="text-slate-400">B:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={exp3LeftB}
                        onChange={(e) => setExp3LeftB(parseInt(e.target.value) || 1)}
                        className="w-16 p-1.5 rounded bg-slate-900 border border-slate-700 text-center font-mono font-bold"
                      />
                    </div>

                    <div className="h-px bg-slate-800 my-2"></div>

                    <p className="text-xs font-bold text-amber-400 uppercase">Rasio Kanan (C : D):</p>
                    <div className="flex gap-2 items-center text-xs">
                      <span className="text-slate-400">C:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={exp3RightA}
                        onChange={(e) => setExp3RightA(parseInt(e.target.value) || 1)}
                        className="w-16 p-1.5 rounded bg-slate-900 border border-slate-700 text-center font-mono font-bold"
                      />
                      <span className="text-slate-400">:</span>
                      <span className="text-slate-400">D:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={exp3RightB}
                        onChange={(e) => setExp3RightB(parseInt(e.target.value) || 1)}
                        className="w-16 p-1.5 rounded bg-slate-900 border border-slate-700 text-center font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <p className="font-bold text-slate-200">Uji Perkalian Silang:</p>
                    <p className="text-slate-400 font-mono">
                      (A × D) = {exp3LeftA} × {exp3RightB} = <strong className="text-sky-300">{exp3LeftA * exp3RightB}</strong>
                    </p>
                    <p className="text-slate-400 font-mono">
                      (B × C) = {exp3LeftB} × {exp3RightA} = <strong className="text-amber-300">{exp3LeftB * exp3RightA}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 4: MODEL DIAGRAM PITA (Tape Diagram Soal Cerita)  */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 4 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    Eksperimen 4: Model Diagram Pita (Soal Cerita Kurikulum Merdeka)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gunakan diagram pita untuk membagi nilai total menjadi bagian-bagian kotak satuan sama besar.
                  </p>
                </div>
                <button
                  onClick={() => markExperimentDone(4)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              {(() => {
                const totalParts = exp4RatioA + exp4RatioB;
                const valuePerPart = Math.floor(exp4TotalMoney / totalParts);
                const moneyA = valuePerPart * exp4RatioA;
                const moneyB = valuePerPart * exp4RatioB;

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Visual Tape Diagram (7 cols) */}
                    <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-400">Total Uang Bersama:</p>
                        <p className="text-2xl font-black text-emerald-400 font-mono">
                          Rp {exp4TotalMoney.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Dibagi menjadi ({exp4RatioA} + {exp4RatioB}) = <strong>{totalParts} Bagian Kotak Satuan</strong>
                        </p>
                        <p className="text-xs text-amber-300 font-bold mt-0.5">
                          Nilai 1 Kotak = Rp {valuePerPart.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Bar Budi */}
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="text-sky-400">Uang Budi ({exp4RatioA} Kotak):</span>
                          <span className="text-sky-300 font-mono font-bold">Rp {moneyA.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: exp4RatioA }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-[10px] font-bold text-white shadow"
                            >
                              Rp {valuePerPart / 1000}k
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bar Ani */}
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="text-pink-400">Uang Ani ({exp4RatioB} Kotak):</span>
                          <span className="text-pink-300 font-mono font-bold">Rp {moneyB.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: exp4RatioB }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 h-9 rounded-lg bg-pink-600 flex items-center justify-center text-[10px] font-bold text-white shadow"
                            >
                              Rp {valuePerPart / 1000}k
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Adjusters (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300 font-bold">Rasio Bagian Budi:</span>
                            <span className="font-mono text-sky-400 font-bold">{exp4RatioA} Bagian</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            value={exp4RatioA}
                            onChange={(e) => setExp4RatioA(parseInt(e.target.value))}
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300 font-bold">Rasio Bagian Ani:</span>
                            <span className="font-mono text-pink-400 font-bold">{exp4RatioB} Bagian</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            value={exp4RatioB}
                            onChange={(e) => setExp4RatioB(parseInt(e.target.value))}
                            className="w-full accent-pink-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300 font-bold">Total Uang Saku:</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              Rp {exp4TotalMoney.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {[24000, 40000, 60000].map((val) => (
                              <button
                                key={val}
                                onClick={() => setExp4TotalMoney(val)}
                                className={`py-1.5 rounded-lg border font-mono font-bold transition-all ${
                                  exp4TotalMoney === val
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                                }`}
                              >
                                {val / 1000}k
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <p className="font-bold text-tealbrand-300">Cara Menyelesaikan Soal:</p>
                        <p>1. Jumlahkan perbandingan: {exp4RatioA} + {exp4RatioB} = {totalParts}</p>
                        <p>2. Cari 1 bagian: Total uang ÷ {totalParts} = Rp {valuePerPart.toLocaleString('id-ID')}</p>
                        <p>3. Kalikan ke masing-masing orang sesuai bagian kotaknya.</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* EKSPERIMEN 5: LOMBA BALAP KECEPATAN (Rasio Jarak / Waktu)     */}
          {/* ------------------------------------------------------------ */}
          {activeExp === 5 && (
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-amber-400" />
                    Eksperimen 5: Lomba Kecepatan (Rasio Jarak terhadap Waktu)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kecepatan adalah rasio perbandingan antara jarak yang ditempuh dengan waktu yang dihabiskan (v = s : t).
                  </p>
                </div>
                <button
                  onClick={() => markExperimentDone(5)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Selesai</span>
                </button>
              </div>

              {/* Race Track */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                {/* Lane 1: Kancil */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-amber-400 flex items-center gap-1">
                      <span>🦊 Kancil Cerdas:</span>
                      <span className="text-slate-400 font-normal">12 Meter / 2 Detik = </span>
                      <span className="text-emerald-400 font-mono">6 m/detik</span>
                    </span>
                    <span className="font-mono text-slate-400">{exp5ProgressA}%</span>
                  </div>
                  <div className="h-10 bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800 flex items-center px-2">
                    <div
                      className="absolute top-1 bottom-1 left-1 bg-amber-500/20 border-r-2 border-amber-400 rounded transition-all duration-75 flex items-center justify-end pr-2"
                      style={{ width: `${exp5ProgressA}%` }}
                    >
                      <span className="text-2xl">🦊</span>
                    </div>
                    <span className="absolute right-3 text-xs font-mono text-slate-500 font-bold">🏁 FINISH</span>
                  </div>
                </div>

                {/* Lane 2: Kelinci */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-sky-400 flex items-center gap-1">
                      <span>🐰 Kelinci Cepat:</span>
                      <span className="text-slate-400 font-normal">15 Meter / 3 Detik = </span>
                      <span className="text-emerald-400 font-mono">5 m/detik</span>
                    </span>
                    <span className="font-mono text-slate-400">{exp5ProgressB}%</span>
                  </div>
                  <div className="h-10 bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800 flex items-center px-2">
                    <div
                      className="absolute top-1 bottom-1 left-1 bg-sky-500/20 border-r-2 border-sky-400 rounded transition-all duration-75 flex items-center justify-end pr-2"
                      style={{ width: `${exp5ProgressB}%` }}
                    >
                      <span className="text-2xl">🐰</span>
                    </div>
                    <span className="absolute right-3 text-xs font-mono text-slate-500 font-bold">🏁 FINISH</span>
                  </div>
                </div>

                {/* Race Action & Winner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <button
                    onClick={startExp5Race}
                    disabled={exp5Racing}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>Mulai Lomba Balap!</span>
                  </button>

                  {exp5Winner && (
                    <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-75">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Juara 1: {exp5Winner} karena memiliki rasio kecepatan paling tinggi!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE AR: AUGMENTED REALITY KAMERA MEJA NYATA                */}
      {/* ============================================================== */}
      {mode === 'AR' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                Mode Augmented Reality (Proyeksikan Menara Rasio di Meja Belajarmu!)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800 font-mono">
              AR Tabletop Tracker
            </span>
          </div>

          <div className="relative w-full h-[440px] sm:h-[480px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/50 shadow-2xl flex items-center justify-center">
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
                  <h4 className="text-base font-bold text-slate-100">Buka Kamera Perangkat</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Aktifkan webcam laptop atau kamera smartphone untuk memproyeksikan tumpukan balok perbandingan rasio melayang di atas meja belajarmu!
                  </p>
                </div>
                <button
                  onClick={toggleCamera}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Nyalakan Kamera Meja</span>
                </button>
                {cameraError && <p className="text-[11px] text-amber-400">{cameraError}</p>}
              </div>
            )}

            {/* AR HUD Overlay */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>SURFACE DETECTED • SCALE: {arScale}x</span>
                  </div>
                  <button
                    onClick={toggleCamera}
                    className="pointer-events-auto px-3 py-1 rounded-lg bg-slate-900/80 text-rose-400 text-xs font-bold border border-rose-500/30"
                  >
                    Matikan Kamera
                  </button>
                </div>

                {/* 3D Tower Floating in AR */}
                <div className="self-center flex flex-col items-center animate-bounce duration-1000">
                  <div
                    className="flex items-end justify-center gap-4 bg-slate-950/70 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-400 shadow-2xl"
                    style={{ transform: `scale(${arScale})` }}
                  >
                    {/* Tower A in AR */}
                    <div className="flex flex-col-reverse items-center gap-1">
                      {Array.from({ length: countA }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-6 bg-sky-500 rounded-md border border-white/60 shadow flex items-center justify-center text-xs text-white font-bold"
                        >
                          {selectedTheme.emojiA}
                        </div>
                      ))}
                      <span className="text-[10px] text-sky-300 font-bold font-mono">A: {countA}</span>
                    </div>

                    {/* Tower B in AR */}
                    <div className="flex flex-col-reverse items-center gap-1">
                      {Array.from({ length: countB }).map((_, j) => (
                        <div
                          key={j}
                          className="w-8 h-6 bg-amber-500 rounded-md border border-white/60 shadow flex items-center justify-center text-xs text-white font-bold"
                        >
                          {selectedTheme.emojiB}
                        </div>
                      ))}
                      <span className="text-[10px] text-amber-300 font-bold font-mono">B: {countB}</span>
                    </div>
                  </div>

                  <span className="mt-2 text-[10px] font-mono text-emerald-300 bg-slate-950/90 px-3 py-0.5 rounded-full border border-emerald-500/50">
                    Rasio Sederhana: {simpleA} : {simpleB}
                  </span>
                </div>

                {/* Bottom Photo Capture */}
                <div className="pointer-events-auto flex items-center justify-between gap-3 bg-slate-950/80 backdrop-blur p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-300">Ukuran Balok AR:</span>
                    <input
                      type="range"
                      min="0.8"
                      max="2.0"
                      step="0.2"
                      value={arScale}
                      onChange={(e) => setArScale(parseFloat(e.target.value))}
                      className="w-24 accent-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setArPhotoTaken(true);
                      confetti({ particleCount: 50, spread: 50 });
                      setTimeout(() => setArPhotoTaken(false), 2000);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{arPhotoTaken ? '📸 Foto Tersimpan!' : 'Ambil Foto AR'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODE VR: RUANG KELAS 360° & KACAMATA DUAL-EYE CARDBOARD     */}
      {/* ============================================================== */}
      {mode === 'VR' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Glasses className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-200">
                Mode Laboratorium Matematika Futuristik (Virtual Reality 360°)
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
            {/* Viewport 1 (Left Eye / Single View) */}
            <div className="relative flex-1 h-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-950/40 via-black to-slate-950">
              {/* HUD Boundary */}
              <div className="absolute inset-0 pointer-events-none border-[10px] border-slate-900/90 rounded-2xl flex flex-col justify-between p-4">
                <div className="flex justify-between text-[10px] font-mono text-purple-400">
                  <span>VR MATH LAB • SEKTOR {vrStation.toUpperCase()}</span>
                  <span>GYRO HEAD TRACKING: ACTIVE</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-tealbrand-400">
                  <span>RASIO TARGET: {countA} : {countB}</span>
                  <span>FPB: ÷{gcd}</span>
                </div>
              </div>

              {/* Floating Hologram in VR */}
              <div className="text-center space-y-4 z-10">
                <div className="flex items-end justify-center gap-6">
                  {/* Floating Tower A */}
                  <div className="flex flex-col-reverse items-center gap-1">
                    {Array.from({ length: Math.min(8, countA) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-7 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/40 border border-white/50 flex items-center justify-center text-sm"
                      >
                        {selectedTheme.emojiA}
                      </div>
                    ))}
                    <span className="text-xs font-mono font-bold text-sky-300">Menara {countA}</span>
                  </div>

                  {/* Floating Tower B */}
                  <div className="flex flex-col-reverse items-center gap-1">
                    {Array.from({ length: Math.min(8, countB) }).map((_, j) => (
                      <div
                        key={j}
                        className="w-10 h-7 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/40 border border-white/50 flex items-center justify-center text-sm"
                      >
                        {selectedTheme.emojiB}
                      </div>
                    ))}
                    <span className="text-xs font-mono font-bold text-amber-300">Menara {countB}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-xl border border-purple-500/40 inline-block">
                  <p className="text-xs font-black text-amber-300">
                    Bentuk Senilai Sederhana: {simpleA} : {simpleB}
                  </p>
                </div>
              </div>
            </div>

            {/* Viewport 2 (Right Eye in Cardboard Mode) */}
            {vrSplit && (
              <div className="relative flex-1 h-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-950/40 via-black to-slate-950">
                <div className="absolute inset-0 pointer-events-none border-[10px] border-slate-900/90 rounded-2xl flex flex-col justify-between p-4">
                  <div className="flex justify-between text-[10px] font-mono text-purple-400">
                    <span>VR MATH LAB (RIGHT EYE)</span>
                    <span>STEREO SYNC: 100%</span>
                  </div>
                </div>

                <div className="text-center space-y-4 z-10">
                  <div className="flex items-end justify-center gap-6">
                    <div className="flex flex-col-reverse items-center gap-1">
                      {Array.from({ length: Math.min(8, countA) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-10 h-7 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/40 border border-white/50 flex items-center justify-center text-sm"
                        >
                          {selectedTheme.emojiA}
                        </div>
                      ))}
                      <span className="text-xs font-mono font-bold text-sky-300">Menara {countA}</span>
                    </div>

                    <div className="flex flex-col-reverse items-center gap-1">
                      {Array.from({ length: Math.min(8, countB) }).map((_, j) => (
                        <div
                          key={j}
                          className="w-10 h-7 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/40 border border-white/50 flex items-center justify-center text-sm"
                        >
                          {selectedTheme.emojiB}
                        </div>
                      ))}
                      <span className="text-xs font-mono font-bold text-amber-300">Menara {countB}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-xl border border-purple-500/40 inline-block">
                    <p className="text-xs font-black text-amber-300">
                      Bentuk Senilai Sederhana: {simpleA} : {simpleB}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
