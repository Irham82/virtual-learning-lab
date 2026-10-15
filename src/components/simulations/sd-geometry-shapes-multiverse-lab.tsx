'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Box,
  Layers,
  Sparkles,
  Eye,
  Camera,
  Glasses,
  FlaskConical,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Maximize2,
  Minimize2,
  Info,
  Sliders,
  Play,
  Pause,
  Award,
  HelpCircle,
  Shapes,
  Grid,
  Search,
  Check,
  X,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SDGeometryShapesLabProps {
  onProgressUpdate?: () => void;
}

export type ViewMode = '2d' | '3d' | 'experiments' | 'ar' | 'vr';

export interface FaceComponent {
  name: string;
  count: number;
  shapeType: string; // e.g. "Persegi", "Persegi Panjang", "Lingkaran", "Segitiga"
  color: string;
  bgClass: string;
  icon: string;
  description: string;
}

export interface RealObjectExample {
  name: string;
  emoji: string;
  description: string;
}

export interface Shape3DInfo {
  id: string;
  name: string;
  shortName: string;
  category: 'Prisma & Kubus' | 'Limas' | 'Bangun Ruang Lengkung';
  badge: string;
  themeColor: string;
  accentHex: number;
  facesCount: number; // Sisi
  edgesCount: number; // Rusuk
  verticesCount: number; // Titik Sudut
  curvedFacesCount: number;
  components: FaceComponent[];
  realObjects: RealObjectExample[];
  unfoldingExplanation: string;
  narrationText: string;
  formulaSurface: string;
  formulaVolume: string;
  eulerFormulaApplies: boolean;
}

const SHAPES_DATA: Shape3DInfo[] = [
  {
    id: 'kubus',
    name: 'Kubus (Cube)',
    shortName: 'Kubus',
    category: 'Prisma & Kubus',
    badge: '6 Sisi Sama Besar',
    themeColor: 'from-amber-500 to-orange-500',
    accentHex: 0xf59e0b,
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    curvedFacesCount: 0,
    components: [
      {
        name: 'Sisi Persegi (Bujursangkar)',
        count: 6,
        shapeType: 'Persegi',
        color: 'text-amber-400',
        bgClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        icon: '⏹️',
        description: '6 buah bangun datar persegi kongruen (berukuran dan bersudut 90° sama persis).',
      },
    ],
    realObjects: [
      { name: 'Dadu Permainan', emoji: '🎲', description: 'Semua mata dadu memiliki 6 sisi kotak yang sama besar.' },
      { name: 'Rubik 3x3', emoji: '🧩', description: 'Teka-teki kubus warna-warni berputar.' },
      { name: 'Kotak Kado Persegi', emoji: '🎁', description: 'Bungkus kado dengan alas dan tutup persegi.' },
      { name: 'Es Batu Kubus', emoji: '🧊', description: 'Cetakan es batu berbentuk kubus padat.' },
    ],
    unfoldingExplanation:
      'Ketika jaring-jaring kubus dibuka, kamu akan melihat 6 persegi yang terbentang rata seperti pola salib. Saat dirangkai kembali, keenam persegi akan melipat 90° membentuk kubus 3 dimensi!',
    narrationText:
      'Halo teman-teman! Ini adalah Kubus. Kubus adalah bangun ruang yang sangat istimewa karena seluruh 6 sisinya terbuat dari bangun datar Persegi yang sama besar. Kubus memiliki 12 rusuk sama panjang dan 8 titik sudut!',
    formulaSurface: 'L = 6 × (s × s)',
    formulaVolume: 'V = s × s × s',
    eulerFormulaApplies: true,
  },
  {
    id: 'balok',
    name: 'Balok (Cuboid / Rectangular Prism)',
    shortName: 'Balok',
    category: 'Prisma & Kubus',
    badge: '3 Pasang Persegi Panjang',
    themeColor: 'from-teal-500 to-emerald-500',
    accentHex: 0x14b8a6,
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    curvedFacesCount: 0,
    components: [
      {
        name: 'Pasangan Alas & Tutup',
        count: 2,
        shapeType: 'Persegi Panjang',
        color: 'text-teal-400',
        bgClass: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
        icon: '▬',
        description: '2 persegi panjang kongruen di bagian bawah (alas) dan atas (tutup).',
      },
      {
        name: 'Pasangan Sisi Depan & Belakang',
        count: 2,
        shapeType: 'Persegi Panjang',
        color: 'text-emerald-400',
        bgClass: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        icon: '▭',
        description: '2 persegi panjang vertikal berhadapan di depan dan belakang.',
      },
      {
        name: 'Pasangan Sisi Kiri & Kanan',
        count: 2,
        shapeType: 'Persegi Panjang / Persegi',
        color: 'text-cyan-400',
        bgClass: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
        icon: '▮',
        description: '2 persegi panjang samping sebagai dinding penutup kiri dan kanan.',
      },
    ],
    realObjects: [
      { name: 'Kotak Sepatu', emoji: '👟', description: 'Kotak kardus dengan panjang, lebar, dan tinggi berbeda.' },
      { name: 'Kotak Susu UHT', emoji: '🧃', description: 'Kemasan minuman karton balok higienis.' },
      { name: 'Batu Bata Bangunan', emoji: '🧱', description: 'Batu bata merah pembuat dinding rumah.' },
      { name: 'Buku Pelajaran Tebal', emoji: '📚', description: 'Buku berjilid rapi berbentuk balok tipis.' },
    ],
    unfoldingExplanation:
      'Ketika balok dibuka, jaring-jaringnya terdiri dari 6 buah bangun datar persegi panjang yang terbagi menjadi 3 pasang sisi yang sama besar dan saling berhadapan!',
    narrationText:
      'Ini adalah Balok! Berbeda dengan kubus, balok memiliki rusuk panjang, lebar, dan tinggi yang berbeda. Balok tersusun dari 6 bangun datar persegi panjang yang terdiri dari 3 pasang sisi kembar yang saling berhadapan.',
    formulaSurface: 'L = 2 × (p×l + p×t + l×t)',
    formulaVolume: 'V = p × l × t',
    eulerFormulaApplies: true,
  },
  {
    id: 'tabung',
    name: 'Tabung (Silinder / Cylinder)',
    shortName: 'Tabung',
    category: 'Bangun Ruang Lengkung',
    badge: '2 Lingkaran + 1 Persegi Panjang',
    themeColor: 'from-sky-500 to-indigo-500',
    accentHex: 0x0284c7,
    facesCount: 3,
    edgesCount: 2,
    verticesCount: 0,
    curvedFacesCount: 1,
    components: [
      {
        name: 'Alas & Tutup Tabung',
        count: 2,
        shapeType: 'Lingkaran',
        color: 'text-sky-400',
        bgClass: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
        icon: '⚪',
        description: '2 buah lingkaran datar yang berukuran sama persis (jari-jari r identik).',
      },
      {
        name: 'Selimut Tabung',
        count: 1,
        shapeType: 'Persegi Panjang',
        color: 'text-indigo-400',
        bgClass: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
        icon: '📜',
        description: 'Sisi lengkung yang ketika dibuka membentang menjadi 1 persegi panjang utuh (Panjang = Keliling Lingkaran 2πr).',
      },
    ],
    realObjects: [
      { name: 'Kaleng Minuman Bersoda', emoji: '🥤', description: 'Kaleng aluminium berbentuk tabung bundar.' },
      { name: 'Celengan Koin', emoji: '🪙', description: 'Celengan tabung untuk menabung uang saku.' },
      { name: 'Drum Minyak', emoji: '🛢️', description: 'Drum silinder penyimpan cairan volume besar.' },
      { name: 'Baterai Jam Dinding', emoji: '🔋', description: 'Baterai AA silinder dengan kutub positif dan negatif.' },
    ],
    unfoldingExplanation:
      'Ajaib sekali! Sisi lengkung selimut tabung jika digunting dan dibentangkan ternyata membentuk 1 buah persegi panjang yang rata! Ditambah 2 buah lingkaran sebagai penutup atas dan bawahnya.',
    narrationText:
      'Tahukah kamu rahasia Tabung? Tabung hanya memiliki 3 sisi: 2 lingkaran sebagai alas dan tutup, serta 1 sisi lengkung yang disebut selimut. Jika selimut tabung dibuka, ia akan berubah menjadi persegi panjang yang sangat rapi!',
    formulaSurface: 'L = 2πr × (r + t)',
    formulaVolume: 'V = π × r² × t',
    eulerFormulaApplies: false,
  },
  {
    id: 'kerucut',
    name: 'Kerucut (Cone)',
    shortName: 'Kerucut',
    category: 'Bangun Ruang Lengkung',
    badge: '1 Lingkaran + 1 Juring Lingkaran',
    themeColor: 'from-pink-500 to-rose-500',
    accentHex: 0xf43f5e,
    facesCount: 2,
    edgesCount: 1,
    verticesCount: 1,
    curvedFacesCount: 1,
    components: [
      {
        name: 'Alas Kerucut',
        count: 1,
        shapeType: 'Lingkaran',
        color: 'text-pink-400',
        bgClass: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
        icon: '⚪',
        description: '1 buah bangun datar lingkaran datar sebagai tumpuan bawah kerucut.',
      },
      {
        name: 'Selimut Kerucut',
        count: 1,
        shapeType: 'Juring Lingkaran (Sektor)',
        color: 'text-rose-400',
        bgClass: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
        icon: '🍕',
        description: '1 juring lingkaran (berbentuk seperti sepotong pizza) yang melingkar meruncing ke titik puncak.',
      },
    ],
    realObjects: [
      { name: 'Topi Ulang Tahun', emoji: '🎉', description: 'Topi pesta kerucut lancip berhias pita.' },
      { name: 'Cone Es Krim Renyah', emoji: '🍦', description: 'Wafel kerucut pemegang es krim manis.' },
      { name: 'Tumpeng Nasi Kuning', emoji: '🍚', description: 'Nasi tumpeng tradisi syukuran Nusantara.' },
      { name: 'Traffic Cone Lalu Lintas', emoji: '🚧', description: 'Kerucut oranye pembatas jalur jalan raya.' },
    ],
    unfoldingExplanation:
      'Saat kerucut dibuka, alas bundarnya terlepas menjadi 1 lingkaran, dan selimut lancipnya terbentang membentuk 1 juring lingkaran (sektor melengkung seperti potongan pizza)!',
    narrationText:
      'Lihatlah Kerucut yang meruncing ke atas! Kerucut tersusun dari 2 bangun datar: alasnya berupa Lingkaran, dan selimutnya yang melingkar jika dibuka akan menjadi Juring Lingkaran seperti sepotong kue pizza lezat.',
    formulaSurface: 'L = πr × (r + s)',
    formulaVolume: 'V = ⅓ × π × r² × t',
    eulerFormulaApplies: false,
  },
  {
    id: 'prisma-segitiga',
    name: 'Prisma Segitiga (Triangular Prism)',
    shortName: 'Prisma 3',
    category: 'Prisma & Kubus',
    badge: '2 Segitiga + 3 Persegi Panjang',
    themeColor: 'from-purple-500 to-indigo-500',
    accentHex: 0x8b5cf6,
    facesCount: 5,
    edgesCount: 9,
    verticesCount: 6,
    curvedFacesCount: 0,
    components: [
      {
        name: 'Alas & Tutup Segitiga',
        count: 2,
        shapeType: 'Segitiga',
        color: 'text-purple-400',
        bgClass: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        icon: '▲',
        description: '2 bangun datar segitiga kembar kongruen di kedua ujung prisma.',
      },
      {
        name: 'Sisi Tegak Persegi Panjang',
        count: 3,
        shapeType: 'Persegi Panjang',
        color: 'text-indigo-400',
        bgClass: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
        icon: '▭',
        description: '3 persegi panjang yang menghubungkan sisi-sisi segitiga alas dan tutup.',
      },
    ],
    realObjects: [
      { name: 'Tenda Kemah Pramuka', emoji: '⛺', description: 'Tenda segitiga tempat berkemah di alam terbuka.' },
      { name: 'Cokelat Toblerone', emoji: '🍫', description: 'Batang cokelat Swiss dengan kemasan prisma segitiga khas.' },
      { name: 'Atap Rumah Tradisional', emoji: '🏠', description: 'Struktur atap genteng pelana prisma segitiga.' },
      { name: 'Tempat Pensil Segitiga', emoji: '✏️', description: 'Wadah alat tulis dengan profil segitiga kokoh.' },
    ],
    unfoldingExplanation:
      'Jaring-jaring prisma segitiga terdiri dari 3 persegi panjang berjejer di tengah, dan 2 segitiga kembar menempel di sisi atas dan bawahnya yang siap dilipat menutup kedua ujungnya!',
    narrationText:
      'Ini adalah Prisma Segitiga! Mirip seperti tenda perkemahan, prisma segitiga memiliki 5 sisi: 2 segitiga identik di ujung depan dan belakang, serta 3 persegi panjang sebagai dinding-dinding penegaknya.',
    formulaSurface: 'L = (2 × Luas Alas) + (Keliling Alas × t)',
    formulaVolume: 'V = Luas Alas × t',
    eulerFormulaApplies: true,
  },
  {
    id: 'limas-segiempat',
    name: 'Limas Segiempat (Square Pyramid)',
    shortName: 'Limas 4',
    category: 'Limas',
    badge: '1 Persegi + 4 Segitiga',
    themeColor: 'from-yellow-500 to-amber-600',
    accentHex: 0xeab308,
    facesCount: 5,
    edgesCount: 8,
    verticesCount: 5,
    curvedFacesCount: 0,
    components: [
      {
        name: 'Alas Persegi',
        count: 1,
        shapeType: 'Persegi',
        color: 'text-yellow-400',
        bgClass: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
        icon: '⏹️',
        description: '1 buah persegi datar di bagian dasar sebagai tumpuan limas.',
      },
      {
        name: 'Dinding Sisi Tegak Segitiga',
        count: 4,
        shapeType: 'Segitiga Sama Kaki',
        color: 'text-amber-400',
        bgClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        icon: '▲',
        description: '4 buah segitiga sama kaki yang berdiri miring dan bertemu di satu titik puncak.',
      },
    ],
    realObjects: [
      { name: 'Piramida Agung Mesir', emoji: '🏛️', description: 'Keajaiban dunia kuno monumen piramida Giza.' },
      { name: 'Tenda Piramida Indian (Tepee)', emoji: '🏕️', description: 'Tenda kerucut segiempat pelindung cuaca.' },
      { name: 'Puncak Monumen Tugu', emoji: '🗼', description: 'Ujung tugu peringatan berbentuk limas meruncing.' },
      { name: 'Kue Bacang Tradisional', emoji: '🍙', description: 'Bungkusan daun bambu berbentuk limas segitiga/segiempat.' },
    ],
    unfoldingExplanation:
      'Ketika limas segiempat dibuka, keempat dinding segitiganya akan merekah mekar ke luar seperti kelopak bunga matahari mekar dengan persegi alas tetap di tengahnya!',
    narrationText:
      'Perhatikan Limas Segiempat yang megah seperti Piramida Mesir! Limas ini terbentuk dari 1 alas Persegi dan 4 dinding Segitiga yang menanjak naik ke satu titik puncak yang sama. Total ada 5 sisi, 8 rusuk, dan 5 titik sudut!',
    formulaSurface: 'L = Luas Alas + (4 × Luas Segitiga)',
    formulaVolume: 'V = ⅓ × Luas Alas × t',
    eulerFormulaApplies: true,
  },
  {
    id: 'limas-segitiga',
    name: 'Limas Segitiga (Tetrahedron)',
    shortName: 'Limas 3',
    category: 'Limas',
    badge: '4 Segitiga Sama Sisi',
    themeColor: 'from-emerald-500 to-teal-600',
    accentHex: 0x10b981,
    facesCount: 4,
    edgesCount: 6,
    verticesCount: 4,
    curvedFacesCount: 0,
    components: [
      {
        name: 'Seluruh Sisi Segitiga',
        count: 4,
        shapeType: 'Segitiga',
        color: 'text-emerald-400',
        bgClass: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        icon: '▲',
        description: '4 buah segitiga (1 sebagai alas dan 3 sebagai dinding tegak).',
      },
    ],
    realObjects: [
      { name: 'Kemasan Teh Celup Piramida', emoji: '🍵', description: 'Kantung teh celup modern tetrahedron berpori halus.' },
      { name: 'Kristal Kuarsa Segitiga', emoji: '💎', description: 'Struktur kristal mineral 4 permukaan segitiga.' },
      { name: 'Dadu Permainan D4', emoji: '🎲', description: 'Dadu bersisi empat untuk permainan strategi papan.' },
    ],
    unfoldingExplanation:
      'Limas segitiga adalah polihedron paling sederhana di alam semesta! Seluruh permukaannya tersusun dari 4 segitiga yang saling bertautan.',
    narrationText:
      'Limas Segitiga sangat unik karena semua permukaannya terbuat dari bentuk Segitiga! Ada 1 segitiga alas dan 3 segitiga dinding. Jika dibuka, ia membentuk segitiga besar yang tersusun dari 4 segitiga kecil.',
    formulaSurface: 'L = Luas Alas + (3 × Luas Segitiga Tegak)',
    formulaVolume: 'V = ⅓ × Luas Alas × t',
    eulerFormulaApplies: true,
  },
];

export function SDGeometryShapesMultiverseLab({ onProgressUpdate }: SDGeometryShapesLabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [activeShapeId, setActiveShapeId] = useState<string>('kubus');
  const [unfoldPercent, setUnfoldPercent] = useState<number>(0); // 0 (closed solid) to 100 (flat net)
  const [isAutoUnfolding, setIsAutoUnfolding] = useState<boolean>(false);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Inspector highlighter in 2D
  const [highlightedElement, setHighlightedElement] = useState<'faces' | 'edges' | 'vertices' | null>(null);

  // 3D Canvas Refs
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const unfoldFactorRef = useRef<number>(0);
  const currentMeshGroupRef = useRef<THREE.Group | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera & AR Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // VR Refs
  const [vrOrientation, setVrOrientation] = useState<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [isVrSplitScreen, setIsVrSplitScreen] = useState<boolean>(false);

  // Experiments State
  const [activeExperiment, setActiveExperiment] = useState<number>(1);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  // Active shape data object
  const activeShape = SHAPES_DATA.find((s) => s.id === activeShapeId) || SHAPES_DATA[0];

  // Sync unfold factor ref
  useEffect(() => {
    unfoldFactorRef.current = unfoldPercent / 100;
  }, [unfoldPercent]);

  // Voice narration helper
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Fitur suara tidak didukung di peramban ini.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeShape.narrationText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Auto unfold toggle loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoUnfolding) {
      interval = setInterval(() => {
        setUnfoldPercent((prev) => {
          if (prev >= 100) return 0;
          return Math.min(100, prev + 2);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAutoUnfolding]);

  // Cleanup speech synthesis on unmount or shape change
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [activeShapeId]);

  // =========================================================================
  // 3D THREE.JS WEBGL RENDERER & INTERACTIVE UNFOLDING MESHES
  // =========================================================================
  useEffect(() => {
    if ((viewMode !== '3d' && viewMode !== 'vr') || !canvas3DRef.current) return;

    const canvas = canvas3DRef.current;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewMode === 'vr' ? 0x050816 : 0x0a0f1d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(activeShape.accentHex, 1.5, 30);
    pointLight.position.set(-6, 6, -4);
    scene.add(pointLight);

    // 5. Grid Floor
    const gridHelper = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // 6. Build Unfolding Shape Group
    const shapeGroup = createUnfoldingShapeMesh(activeShape.id, activeShape.accentHex, isWireframe);
    currentMeshGroupRef.current = shapeGroup;
    scene.add(shapeGroup);

    // Orbit Drag Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let rotationSpeed = 0.005;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !shapeGroup) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      shapeGroup.rotation.y += deltaX * rotationSpeed;
      shapeGroup.rotation.x += deltaY * rotationSpeed;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile/tablet
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !shapeGroup || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      shapeGroup.rotation.y += deltaX * rotationSpeed;
      shapeGroup.rotation.x += deltaY * rotationSpeed;

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Auto gentle idle rotate if not unfolding and not dragging
      if (!isDragging && shapeGroup && unfoldFactorRef.current === 0) {
        shapeGroup.rotation.y += 0.003;
      }

      // Update unfolding hinges dynamically based on unfoldFactorRef
      updateHingesRotation(shapeGroup, activeShape.id, unfoldFactorRef.current);

      renderer.render(scene, camera);
    };

    animate();

    // Window resize handler
    const handleResize = () => {
      if (!canvas.parentElement) return;
      const newW = canvas.parentElement.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current || 0);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, [viewMode, activeShapeId, isWireframe]);

  // Build the 3D Unfolding Mesh Groups for each shape
  const createUnfoldingShapeMesh = (shapeId: string, colorHex: number, wireframe: boolean): THREE.Group => {
    const root = new THREE.Group();
    root.position.y = 0;

    const createFaceMaterial = (color: number, opacity = 0.9) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide,
        wireframe,
        transparent: opacity < 1,
        opacity,
      });

    const s = 1.6; // Scale of base

    if (shapeId === 'kubus') {
      // Cube: 6 square faces unfolding into a cross pattern
      // Face 0: Bottom (Base grounded on floor)
      const baseMat = createFaceMaterial(0xf59e0b);
      const baseGeo = new THREE.PlaneGeometry(s, s);
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.rotation.x = -Math.PI / 2;
      root.add(baseMesh);

      // Face 1: North Face (hinged along North edge: z = -s/2)
      const northHinge = new THREE.Group();
      northHinge.name = 'hinge_north';
      northHinge.position.set(0, 0, -s / 2);

      const northMat = createFaceMaterial(0xfbbf24);
      const northMesh = new THREE.Mesh(baseGeo, northMat);
      northMesh.position.set(0, 0, -s / 2);
      northMesh.rotation.x = -Math.PI / 2;
      northHinge.add(northMesh);

      // Face 5: Top Face (hinged on the outer edge of North face: z = -s)
      const topHinge = new THREE.Group();
      topHinge.name = 'hinge_top';
      topHinge.position.set(0, 0, -s);

      const topMat = createFaceMaterial(0xfde047);
      const topMesh = new THREE.Mesh(baseGeo, topMat);
      topMesh.position.set(0, 0, -s / 2);
      topMesh.rotation.x = -Math.PI / 2;
      topHinge.add(topMesh);
      northHinge.add(topHinge);
      root.add(northHinge);

      // Face 2: South Face (hinged along South edge: z = +s/2)
      const southHinge = new THREE.Group();
      southHinge.name = 'hinge_south';
      southHinge.position.set(0, 0, s / 2);

      const southMat = createFaceMaterial(0xd97706);
      const southMesh = new THREE.Mesh(baseGeo, southMat);
      southMesh.position.set(0, 0, s / 2);
      southMesh.rotation.x = -Math.PI / 2;
      southHinge.add(southMesh);
      root.add(southHinge);

      // Face 3: East Face (hinged along East edge: x = +s/2)
      const eastHinge = new THREE.Group();
      eastHinge.name = 'hinge_east';
      eastHinge.position.set(s / 2, 0, 0);

      const eastMat = createFaceMaterial(0xb45309);
      const eastMesh = new THREE.Mesh(baseGeo, eastMat);
      eastMesh.position.set(s / 2, 0, 0);
      eastMesh.rotation.x = -Math.PI / 2;
      eastHinge.add(eastMesh);
      root.add(eastHinge);

      // Face 4: West Face (hinged along West edge: x = -s/2)
      const westHinge = new THREE.Group();
      westHinge.name = 'hinge_west';
      westHinge.position.set(-s / 2, 0, 0);

      const westMat = createFaceMaterial(0x92400e);
      const westMesh = new THREE.Mesh(baseGeo, westMat);
      westMesh.position.set(-s / 2, 0, 0);
      westMesh.rotation.x = -Math.PI / 2;
      westHinge.add(westMesh);
      root.add(westHinge);
    } else if (shapeId === 'balok') {
      // Cuboid: length = 2.2, width = 1.4, height = 1.4
      const p = 2.2;
      const l = 1.4;
      const t = 1.4;

      // Base: p x l
      const baseMat = createFaceMaterial(0x14b8a6);
      const baseMesh = new THREE.Mesh(new THREE.PlaneGeometry(p, l), baseMat);
      baseMesh.rotation.x = -Math.PI / 2;
      root.add(baseMesh);

      // North Face: p x t
      const northHinge = new THREE.Group();
      northHinge.name = 'hinge_north';
      northHinge.position.set(0, 0, -l / 2);
      const northMesh = new THREE.Mesh(new THREE.PlaneGeometry(p, t), createFaceMaterial(0x0d9488));
      northMesh.position.set(0, 0, -t / 2);
      northMesh.rotation.x = -Math.PI / 2;
      northHinge.add(northMesh);

      // Top Face attached to North: p x l
      const topHinge = new THREE.Group();
      topHinge.name = 'hinge_top';
      topHinge.position.set(0, 0, -t);
      const topMesh = new THREE.Mesh(new THREE.PlaneGeometry(p, l), createFaceMaterial(0x2dd4bf));
      topMesh.position.set(0, 0, -l / 2);
      topMesh.rotation.x = -Math.PI / 2;
      topHinge.add(topMesh);
      northHinge.add(topHinge);
      root.add(northHinge);

      // South Face: p x t
      const southHinge = new THREE.Group();
      southHinge.name = 'hinge_south';
      southHinge.position.set(0, 0, l / 2);
      const southMesh = new THREE.Mesh(new THREE.PlaneGeometry(p, t), createFaceMaterial(0x0f766e));
      southMesh.position.set(0, 0, t / 2);
      southMesh.rotation.x = -Math.PI / 2;
      southHinge.add(southMesh);
      root.add(southHinge);

      // East Face: l x t
      const eastHinge = new THREE.Group();
      eastHinge.name = 'hinge_east';
      eastHinge.position.set(p / 2, 0, 0);
      const eastMesh = new THREE.Mesh(new THREE.PlaneGeometry(t, l), createFaceMaterial(0x115e59));
      eastMesh.position.set(t / 2, 0, 0);
      eastMesh.rotation.x = -Math.PI / 2;
      eastHinge.add(eastMesh);
      root.add(eastHinge);

      // West Face: l x t
      const westHinge = new THREE.Group();
      westHinge.name = 'hinge_west';
      westHinge.position.set(-p / 2, 0, 0);
      const westMesh = new THREE.Mesh(new THREE.PlaneGeometry(t, l), createFaceMaterial(0x134e4a));
      westMesh.position.set(-t / 2, 0, 0);
      westMesh.rotation.x = -Math.PI / 2;
      westHinge.add(westMesh);
      root.add(westHinge);
    } else if (shapeId === 'limas-segiempat') {
      // Pyramid: Square base, 4 Triangles
      const baseMat = createFaceMaterial(0xeab308);
      const baseMesh = new THREE.Mesh(new THREE.PlaneGeometry(s, s), baseMat);
      baseMesh.rotation.x = -Math.PI / 2;
      root.add(baseMesh);

      // Triangle Geometry
      const hTri = 1.8;
      const triGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([-s / 2, 0, 0, s / 2, 0, 0, 0, 0, -hTri]);
      triGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      triGeo.computeVertexNormals();

      // North Triangle
      const northHinge = new THREE.Group();
      northHinge.name = 'hinge_north_tri';
      northHinge.position.set(0, 0, -s / 2);
      const northMesh = new THREE.Mesh(triGeo, createFaceMaterial(0xf59e0b));
      northHinge.add(northMesh);
      root.add(northHinge);

      // South Triangle
      const southHinge = new THREE.Group();
      southHinge.name = 'hinge_south_tri';
      southHinge.position.set(0, 0, s / 2);
      const southMesh = new THREE.Mesh(triGeo, createFaceMaterial(0xd97706));
      southMesh.rotation.y = Math.PI;
      southHinge.add(southMesh);
      root.add(southHinge);

      // East Triangle
      const eastHinge = new THREE.Group();
      eastHinge.name = 'hinge_east_tri';
      eastHinge.position.set(s / 2, 0, 0);
      const eastMesh = new THREE.Mesh(triGeo, createFaceMaterial(0xb45309));
      eastMesh.rotation.y = -Math.PI / 2;
      eastHinge.add(eastMesh);
      root.add(eastHinge);

      // West Triangle
      const westHinge = new THREE.Group();
      westHinge.name = 'hinge_west_tri';
      westHinge.position.set(-s / 2, 0, 0);
      const westMesh = new THREE.Mesh(triGeo, createFaceMaterial(0x78350f));
      westMesh.rotation.y = Math.PI / 2;
      westHinge.add(westMesh);
      root.add(westHinge);
    } else if (shapeId === 'tabung') {
      // Cylinder: 2 circles and unrolling sleeve
      const r = 0.9;
      const h = 2.0;
      const circGeo = new THREE.CircleGeometry(r, 32);

      // Bottom Circle
      const botMesh = new THREE.Mesh(circGeo, createFaceMaterial(0x0284c7));
      botMesh.rotation.x = -Math.PI / 2;
      botMesh.position.y = -h / 2;
      root.add(botMesh);

      // Top Circle Hinge
      const topHinge = new THREE.Group();
      topHinge.name = 'hinge_cylinder_top';
      topHinge.position.set(0, h / 2, 0);
      const topMesh = new THREE.Mesh(circGeo, createFaceMaterial(0x38bdf8));
      topMesh.rotation.x = -Math.PI / 2;
      topHinge.add(topMesh);
      root.add(topHinge);

      // Unfolding Curved Sleeve (Segmented strips that unroll flat)
      const sleeveGroup = new THREE.Group();
      sleeveGroup.name = 'cylinder_sleeve';
      const numSegments = 24;
      const segWidth = (2 * Math.PI * r) / numSegments;

      for (let i = 0; i < numSegments; i++) {
        const segGeo = new THREE.PlaneGeometry(segWidth, h);
        const segMat = createFaceMaterial(0x0369a1);
        const segMesh = new THREE.Mesh(segGeo, segMat);
        segMesh.name = `cyl_seg_${i}`;
        sleeveGroup.add(segMesh);
      }
      root.add(sleeveGroup);
    } else {
      // Generic prism/pyramid fallback mesh
      const defaultGeo = new THREE.BoxGeometry(s, s, s);
      const defaultMesh = new THREE.Mesh(defaultGeo, createFaceMaterial(colorHex));
      root.add(defaultMesh);
    }

    return root;
  };

  // Update hinge angles based on unfolding percentage
  const updateHingesRotation = (group: THREE.Group, shapeId: string, unfoldT: number) => {
    // unfoldT goes from 0 (closed solid) to 1 (flat net)

    if (shapeId === 'kubus') {
      const northHinge = group.getObjectByName('hinge_north');
      const topHinge = group.getObjectByName('hinge_top');
      const southHinge = group.getObjectByName('hinge_south');
      const eastHinge = group.getObjectByName('hinge_east');
      const westHinge = group.getObjectByName('hinge_west');

      // When unfoldT = 0, sides are vertical (90 deg / π/2).
      // When unfoldT = 1, sides lie flat (0 deg).
      const angle = (1 - unfoldT) * (Math.PI / 2);

      if (northHinge) northHinge.rotation.x = angle;
      if (topHinge) topHinge.rotation.x = angle; // Top rotates relative to north
      if (southHinge) southHinge.rotation.x = -angle;
      if (eastHinge) eastHinge.rotation.z = -angle;
      if (westHinge) westHinge.rotation.z = angle;
    } else if (shapeId === 'balok') {
      const northHinge = group.getObjectByName('hinge_north');
      const topHinge = group.getObjectByName('hinge_top');
      const southHinge = group.getObjectByName('hinge_south');
      const eastHinge = group.getObjectByName('hinge_east');
      const westHinge = group.getObjectByName('hinge_west');

      const angle = (1 - unfoldT) * (Math.PI / 2);

      if (northHinge) northHinge.rotation.x = angle;
      if (topHinge) topHinge.rotation.x = angle;
      if (southHinge) southHinge.rotation.x = -angle;
      if (eastHinge) eastHinge.rotation.z = -angle;
      if (westHinge) westHinge.rotation.z = angle;
    } else if (shapeId === 'limas-segiempat') {
      const northHinge = group.getObjectByName('hinge_north_tri');
      const southHinge = group.getObjectByName('hinge_south_tri');
      const eastHinge = group.getObjectByName('hinge_east_tri');
      const westHinge = group.getObjectByName('hinge_west_tri');

      // Slant angle of pyramid is approx 68 degrees (1.18 rad)
      const closedAngle = 1.15;
      const angle = (1 - unfoldT) * closedAngle;

      if (northHinge) northHinge.rotation.x = angle;
      if (southHinge) southHinge.rotation.x = -angle;
      if (eastHinge) eastHinge.rotation.z = -angle;
      if (westHinge) westHinge.rotation.z = angle;
    } else if (shapeId === 'tabung') {
      const topHinge = group.getObjectByName('hinge_cylinder_top');
      const sleeveGroup = group.getObjectByName('cylinder_sleeve');

      if (topHinge) {
        // Top circle flips open to z = r + unfoldT * 2
        topHinge.rotation.x = (1 - unfoldT) * 0 + unfoldT * (Math.PI / 2);
        topHinge.position.z = -unfoldT * 1.8;
      }

      if (sleeveGroup) {
        const r = 0.9;
        const totalW = 2 * Math.PI * r;
        const count = 24;

        sleeveGroup.children.forEach((child, i) => {
          // In closed state (unfoldT = 0): cylindrical arc positions
          const angle = (i / count) * Math.PI * 2;
          const closedX = Math.sin(angle) * r;
          const closedZ = Math.cos(angle) * r;
          const closedRotY = angle;

          // In open state (unfoldT = 1): flat line along X axis
          const flatX = (i / count - 0.5) * totalW;
          const flatZ = 0;
          const flatRotY = 0;

          child.position.x = THREE.MathUtils.lerp(closedX, flatX, unfoldT);
          child.position.z = THREE.MathUtils.lerp(closedZ, flatZ, unfoldT);
          child.rotation.y = THREE.MathUtils.lerp(closedRotY, flatRotY, unfoldT);
        });
      }
    }
  };

  // Start webcam for AR
  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera AR error:', err);
      setCameraError('Izin akses kamera diperlukan untuk menampilkan mode AR di meja belajarmu.');
      setIsCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // VR orientation sensor
  useEffect(() => {
    if (viewMode !== 'vr') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      setVrOrientation({
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0,
      });
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [viewMode]);

  // Quiz submission evaluation
  const handleQuizSubmit = () => {
    const correctAnswers = [1, 2, 0, 1, 3]; // Answers for 5 questions
    let score = 0;
    correctAnswers.forEach((ans, idx) => {
      if (userAnswers[idx] === ans) {
        score += 20;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score >= 60) {
      confetti({ particleCount: 100, spread: 80 });
      if (onProgressUpdate) onProgressUpdate();
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* ============================================================== */}
      {/* 1. HEADER & MULTIVERSE MODE SWITCHER TABS                       */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              Matematika SD Kurikulum Merdeka
            </span>
            <span className="text-xs text-tealbrand-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Laboratorium Bangun Ruang &amp; Jaring-Jaring
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Petualangan Membedah Bangun Ruang (2D, 3D, AR &amp; VR)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buka gambar bangun ruang untuk melihat jaring-jaring dan bentuk bangun datar penyusunnya melalui 4 media imersif!
          </p>
        </div>

        {/* 5 Multiverse Modes */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setViewMode('2d');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === '2d'
                ? 'bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 text-white shadow-lg shadow-tealbrand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shapes className="w-3.5 h-3.5" />
            <span>🎨 2D Edukasi</span>
          </button>

          <button
            onClick={() => {
              setViewMode('3d');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>🧊 3D WebGL</span>
          </button>

          <button
            onClick={() => {
              setViewMode('experiments');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'experiments'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>🧪 5 Eksperimen</span>
          </button>

          <button
            onClick={() => {
              setViewMode('ar');
              handleStartCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'ar'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📷 AR Meja</span>
          </button>

          <button
            onClick={() => {
              setViewMode('vr');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'vr'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>🥽 VR 360°</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SHAPE SELECTION STRIP (7 BANGUN RUANG SD)                    */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {SHAPES_DATA.map((shape) => {
          const isSelected = activeShapeId === shape.id;
          return (
            <button
              key={shape.id}
              onClick={() => {
                setActiveShapeId(shape.id);
                setUnfoldPercent(0);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-tealbrand-400 text-white shadow-lg shadow-tealbrand-500/20 ring-2 ring-tealbrand-400/30'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-gradient-to-tr ${shape.themeColor} shadow-sm`}
              ></div>
              <span>{shape.shortName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 font-mono text-slate-400 font-normal">
                {shape.facesCount} sisi
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 3. MODE VIEW 1: 2D EDUKASI INTERAKTIF (KARTUN JARING-JARING)    */}
      {/* ============================================================== */}
      {viewMode === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Left: 2D Unfolding Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${activeShape.themeColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                  >
                    {activeShape.shortName[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      {activeShape.name}
                    </h3>
                    <p className="text-[11px] text-tealbrand-300 font-mono">{activeShape.badge}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleVoice}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        <span>Hentikan</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>🔊 Suara Narasi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2D Interactive Canvas: Dynamic Net Unfolding View */}
              <div className="relative h-[340px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center p-4">
                {/* SVG Visual Net representation */}
                <svg className="w-full h-full max-w-[340px] max-h-[280px]" viewBox="0 0 300 240">
                  {/* Background grid */}
                  <defs>
                    <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="300" height="240" fill="url(#smallGrid)" />

                  {/* Render 2D Net based on shape */}
                  {activeShape.id === 'kubus' && (
                    <g
                      transform="translate(150, 120)"
                      className="transition-transform duration-300"
                    >
                      {/* Center Base Square */}
                      <rect
                        x="-30"
                        y="-30"
                        width="60"
                        height="60"
                        fill="#f59e0b"
                        stroke="#fef08a"
                        strokeWidth="2"
                        rx="4"
                      />
                      <text
                        x="0"
                        y="5"
                        fill="#000000"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Alas
                      </text>

                      {/* Top Face (Flaps upward) */}
                      <g transform={`translate(0, -${30 + (unfoldPercent / 100) * 60})`}>
                        <rect
                          x="-30"
                          y="-30"
                          width="60"
                          height="60"
                          fill="#fde047"
                          stroke="#ffffff"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="5"
                          fill="#000000"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Depan
                        </text>
                      </g>

                      {/* Far Top Face (Roof of cube) */}
                      <g
                        transform={`translate(0, -${
                          30 + (unfoldPercent / 100) * 120
                        }) opacity: ${unfoldPercent > 10 ? 1 : 0.4}`}
                      >
                        <rect
                          x="-30"
                          y="-30"
                          width="60"
                          height="60"
                          fill="#fef08a"
                          stroke="#ffffff"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="5"
                          fill="#000000"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Atap
                        </text>
                      </g>

                      {/* Bottom Face (Flaps downward) */}
                      <g transform={`translate(0, ${30 + (unfoldPercent / 100) * 60})`}>
                        <rect
                          x="-30"
                          y="-30"
                          width="60"
                          height="60"
                          fill="#d97706"
                          stroke="#fef08a"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="5"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Belakang
                        </text>
                      </g>

                      {/* Left Face */}
                      <g transform={`translate(-${30 + (unfoldPercent / 100) * 60}, 0)`}>
                        <rect
                          x="-30"
                          y="-30"
                          width="60"
                          height="60"
                          fill="#b45309"
                          stroke="#fde047"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="5"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Kiri
                        </text>
                      </g>

                      {/* Right Face */}
                      <g transform={`translate(${30 + (unfoldPercent / 100) * 60}, 0)`}>
                        <rect
                          x="-30"
                          y="-30"
                          width="60"
                          height="60"
                          fill="#92400e"
                          stroke="#fde047"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="5"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Kanan
                        </text>
                      </g>
                    </g>
                  )}

                  {activeShape.id === 'balok' && (
                    <g transform="translate(150, 120)">
                      {/* Center Base Rectangle */}
                      <rect
                        x="-45"
                        y="-25"
                        width="90"
                        height="50"
                        fill="#14b8a6"
                        stroke="#5eead4"
                        strokeWidth="2"
                        rx="4"
                      />
                      <text
                        x="0"
                        y="5"
                        fill="#000000"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Alas
                      </text>

                      {/* Top Face */}
                      <g transform={`translate(0, -${25 + (unfoldPercent / 100) * 50})`}>
                        <rect
                          x="-45"
                          y="-25"
                          width="90"
                          height="50"
                          fill="#0d9488"
                          stroke="#ffffff"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="4"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Depan
                        </text>
                      </g>

                      {/* Roof Face */}
                      <g transform={`translate(0, -${25 + (unfoldPercent / 100) * 100})`}>
                        <rect
                          x="-45"
                          y="-25"
                          width="90"
                          height="50"
                          fill="#2dd4bf"
                          stroke="#ffffff"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="4"
                          fill="#000000"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Atap
                        </text>
                      </g>

                      {/* Bottom Face */}
                      <g transform={`translate(0, ${25 + (unfoldPercent / 100) * 50})`}>
                        <rect
                          x="-45"
                          y="-25"
                          width="90"
                          height="50"
                          fill="#0f766e"
                          stroke="#ffffff"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="4"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Belakang
                        </text>
                      </g>

                      {/* Left Face */}
                      <g transform={`translate(-${45 + (unfoldPercent / 100) * 40}, 0)`}>
                        <rect
                          x="-20"
                          y="-25"
                          width="40"
                          height="50"
                          fill="#115e59"
                          stroke="#5eead4"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="4"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Kiri
                        </text>
                      </g>

                      {/* Right Face */}
                      <g transform={`translate(${45 + (unfoldPercent / 100) * 40}, 0)`}>
                        <rect
                          x="-20"
                          y="-25"
                          width="40"
                          height="50"
                          fill="#134e4a"
                          stroke="#5eead4"
                          strokeWidth="2"
                          rx="4"
                        />
                        <text
                          x="0"
                          y="4"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Kanan
                        </text>
                      </g>
                    </g>
                  )}

                  {activeShape.id === 'tabung' && (
                    <g transform="translate(150, 120)">
                      {/* Unrolled Sleeve Rectangle */}
                      <rect
                        x="-70"
                        y="-40"
                        width="140"
                        height="80"
                        fill="#0284c7"
                        stroke="#7dd3fc"
                        strokeWidth="2"
                        rx="4"
                      />
                      <text
                        x="0"
                        y="-5"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Selimut Tabung
                      </text>
                      <text
                        x="0"
                        y="12"
                        fill="#bae6fd"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        (1 Persegi Panjang: 2πr × t)
                      </text>

                      {/* Top Circle */}
                      <g transform={`translate(0, -${40 + (unfoldPercent / 100) * 45})`}>
                        <circle cx="0" cy="0" r="28" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                        <text
                          x="0"
                          y="4"
                          fill="#000000"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Tutup (○)
                        </text>
                      </g>

                      {/* Bottom Circle */}
                      <g transform={`translate(0, ${40 + (unfoldPercent / 100) * 45})`}>
                        <circle cx="0" cy="0" r="28" fill="#0369a1" stroke="#ffffff" strokeWidth="2" />
                        <text
                          x="0"
                          y="4"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Alas (○)
                        </text>
                      </g>
                    </g>
                  )}

                  {activeShape.id === 'kerucut' && (
                    <g transform="translate(150, 115)">
                      {/* Unrolled Cone Sector (Juring Lingkaran) */}
                      <path
                        d={`M 0 -40 L -70 50 A 90 90 0 0 0 70 50 Z`}
                        fill="#f43f5e"
                        stroke="#fecdd3"
                        strokeWidth="2"
                      />
                      <text
                        x="0"
                        y="20"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Selimut Kerucut
                      </text>
                      <text
                        x="0"
                        y="35"
                        fill="#ffe4e6"
                        fontSize="8.5"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        (1 Juring Lingkaran 🍕)
                      </text>

                      {/* Bottom Circle */}
                      <g transform={`translate(0, ${55 + (unfoldPercent / 100) * 35})`}>
                        <circle cx="0" cy="0" r="26" fill="#fb7185" stroke="#ffffff" strokeWidth="2" />
                        <text
                          x="0"
                          y="4"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Alas (○)
                        </text>
                      </g>
                    </g>
                  )}

                  {activeShape.id === 'limas-segiempat' && (
                    <g transform="translate(150, 120)">
                      {/* Center Base Square */}
                      <rect
                        x="-30"
                        y="-30"
                        width="60"
                        height="60"
                        fill="#eab308"
                        stroke="#fef08a"
                        strokeWidth="2"
                        rx="3"
                      />
                      <text
                        x="0"
                        y="4"
                        fill="#000000"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Alas Persegi
                      </text>

                      {/* North Triangle */}
                      <g transform={`translate(0, -${30 + (unfoldPercent / 100) * 45})`}>
                        <polygon
                          points="-30,0 30,0 0,-50"
                          fill="#f59e0b"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="0"
                          y="-15"
                          fill="#000000"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ▲ 1
                        </text>
                      </g>

                      {/* South Triangle */}
                      <g transform={`translate(0, ${30 + (unfoldPercent / 100) * 45})`}>
                        <polygon
                          points="-30,0 30,0 0,50"
                          fill="#d97706"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="0"
                          y="20"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ▼ 2
                        </text>
                      </g>

                      {/* East Triangle */}
                      <g transform={`translate(${30 + (unfoldPercent / 100) * 45}, 0)`}>
                        <polygon
                          points="0,-30 0,30 50,0"
                          fill="#b45309"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="20"
                          y="4"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ► 3
                        </text>
                      </g>

                      {/* West Triangle */}
                      <g transform={`translate(-${30 + (unfoldPercent / 100) * 45}, 0)`}>
                        <polygon
                          points="0,-30 0,30 -50,0"
                          fill="#78350f"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="-20"
                          y="4"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ◄ 4
                        </text>
                      </g>
                    </g>
                  )}

                  {activeShape.id === 'prisma-segitiga' && (
                    <g transform="translate(150, 120)">
                      {/* Center Rectangle */}
                      <rect
                        x="-30"
                        y="-45"
                        width="60"
                        height="90"
                        fill="#8b5cf6"
                        stroke="#ddd6fe"
                        strokeWidth="2"
                        rx="3"
                      />
                      <text
                        x="0"
                        y="5"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Sisi Tengah
                      </text>

                      {/* Left Rectangle */}
                      <g transform={`translate(-${30 + (unfoldPercent / 100) * 55}, 0)`}>
                        <rect
                          x="-25"
                          y="-45"
                          width="50"
                          height="90"
                          fill="#7c3aed"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          rx="3"
                        />
                        <text
                          x="0"
                          y="5"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Sisi Kiri
                        </text>
                      </g>

                      {/* Right Rectangle */}
                      <g transform={`translate(${30 + (unfoldPercent / 100) * 55}, 0)`}>
                        <rect
                          x="-25"
                          y="-45"
                          width="50"
                          height="90"
                          fill="#6d28d9"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          rx="3"
                        />
                        <text
                          x="0"
                          y="5"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Sisi Kanan
                        </text>
                      </g>

                      {/* Top Triangle Cap */}
                      <g transform={`translate(0, -${45 + (unfoldPercent / 100) * 40})`}>
                        <polygon
                          points="-30,0 30,0 0,-40"
                          fill="#a78bfa"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="0"
                          y="-10"
                          fill="#000000"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ▲ Tutup
                        </text>
                      </g>

                      {/* Bottom Triangle Cap */}
                      <g transform={`translate(0, ${45 + (unfoldPercent / 100) * 40})`}>
                        <polygon
                          points="-30,0 30,0 0,40"
                          fill="#5b21b6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="0"
                          y="20"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ▼ Alas
                        </text>
                      </g>
                    </g>
                  )}

                  {activeShape.id === 'limas-segitiga' && (
                    <g transform="translate(150, 120)">
                      {/* Center Triangle */}
                      <polygon
                        points="0,-35 -40,30 40,30"
                        fill="#10b981"
                        stroke="#a7f3d0"
                        strokeWidth="2"
                      />
                      <text
                        x="0"
                        y="10"
                        fill="#000000"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Alas
                      </text>

                      {/* Flap 1 (Top) */}
                      <g transform={`translate(0, -${35 + (unfoldPercent / 100) * 40})`}>
                        <polygon
                          points="0,0 -40,-60 40,-60"
                          fill="#34d399"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="0"
                          y="-30"
                          fill="#000000"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ▲ 1
                        </text>
                      </g>

                      {/* Flap 2 (Bottom Left) */}
                      <g
                        transform={`translate(-${40 + (unfoldPercent / 100) * 35}, ${
                          30 + (unfoldPercent / 100) * 35
                        })`}
                      >
                        <polygon
                          points="0,0 -50,20 -10,60"
                          fill="#059669"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="-20"
                          y="30"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ▲ 2
                        </text>
                      </g>

                      {/* Flap 3 (Bottom Right) */}
                      <g
                        transform={`translate(${40 + (unfoldPercent / 100) * 35}, ${
                          30 + (unfoldPercent / 100) * 35
                        })`}
                      >
                        <polygon
                          points="0,0 50,20 10,60"
                          fill="#047857"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x="20"
                          y="30"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ▲ 3
                        </text>
                      </g>
                    </g>
                  )}
                </svg>

                {/* Floating Status Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl text-[11px] font-mono flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-tealbrand-400 animate-pulse"></span>
                  <span>Status Jaring-Jaring: {unfoldPercent}% Terbuka</span>
                </div>
              </div>

              {/* Unfold Slider Controls */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-tealbrand-400" />
                    Buka / Tutup Jaring-Jaring:
                  </span>
                  <span className="font-mono text-tealbrand-300 font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    {unfoldPercent === 0
                      ? 'Tertutup (Bangun Ruang 3D)'
                      : unfoldPercent === 100
                      ? 'Terbuka Penuh (Jaring-Jaring 2D)'
                      : `Mekar ${unfoldPercent}%`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setUnfoldPercent(0)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                  >
                    Tutup (0%)
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={unfoldPercent}
                    onChange={(e) => {
                      setUnfoldPercent(parseInt(e.target.value));
                      setIsAutoUnfolding(false);
                    }}
                    className="flex-1 accent-tealbrand-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />

                  <button
                    onClick={() => setUnfoldPercent(100)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                  >
                    Buka (100%)
                  </button>

                  <button
                    onClick={() => setIsAutoUnfolding(!isAutoUnfolding)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      isAutoUnfolding
                        ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                        : 'bg-tealbrand-600 hover:bg-tealbrand-500 text-white'
                    }`}
                  >
                    {isAutoUnfolding ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isAutoUnfolding ? 'Jeda' : 'Otomatis'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Structural Breakdown & Real Objects (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Bentuk Bangun Datar Penyusun */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Shapes className="w-4 h-4 text-amber-400" />
                <h4 className="font-extrabold text-sm text-white">
                  Bentuk Bangun Datar Pembentuk:
                </h4>
              </div>

              <div className="space-y-2.5">
                {activeShape.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${comp.bgClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <span className="text-base">{comp.icon}</span>
                        <span>{comp.name}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900/80 border border-current">
                        {comp.count} buah {comp.shapeType}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 mt-1 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pedagogical Explanation Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-tealbrand-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Mengapa Disebut Jaring-Jaring?
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {activeShape.unfoldingExplanation}
                </p>
              </div>
            </div>

            {/* 2. Unsur Bangun Ruang (Sisi, Rusuk, Titik Sudut) */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-tealbrand-400" />
                Unsur Karakteristik Geometri
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Jumlah Sisi (F)</p>
                  <p className="text-xl font-black text-amber-400 font-mono mt-0.5">
                    {activeShape.facesCount}
                  </p>
                  <p className="text-[9px] text-slate-500">Permukaan</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Rusuk (E)</p>
                  <p className="text-xl font-black text-tealbrand-400 font-mono mt-0.5">
                    {activeShape.edgesCount}
                  </p>
                  <p className="text-[9px] text-slate-500">Garis Sudut</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Titik Sudut (V)</p>
                  <p className="text-xl font-black text-pink-400 font-mono mt-0.5">
                    {activeShape.verticesCount}
                  </p>
                  <p className="text-[9px] text-slate-500">Pojok Pertemuan</p>
                </div>
              </div>

              {/* Rumus Euler verification badge */}
              {activeShape.eulerFormulaApplies && (
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] font-mono text-indigo-300 flex items-center justify-between">
                  <span>Rumus Euler (F + V = E + 2):</span>
                  <span className="font-bold text-emerald-400">
                    {activeShape.facesCount} + {activeShape.verticesCount} = {activeShape.edgesCount} + 2 (Terbukti ✓)
                  </span>
                </div>
              )}
            </div>

            {/* 3. Benda di Sekitar Kita */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-pink-400" />
                Contoh Benda Nyata di Sekitar Kita:
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {activeShape.realObjects.map((obj, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 hover:border-slate-700 transition-colors"
                  >
                    <span className="text-2xl">{obj.emoji}</span>
                    <div>
                      <p className="font-bold text-xs text-white leading-tight">{obj.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {obj.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE VIEW 2: 3D WEBGL INTERAKTIF                            */}
      {/* ============================================================== */}
      {viewMode === '3d' && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <span>Simulasi Mekar 3D: {activeShape.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  Three.js WebGL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Putar kamera 360° dengan mouse/layar sentuh dan geser slider untuk membuka sisi-sisi bangun ruang hingga rebah menjadi jaring-jaring datar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWireframe(!isWireframe)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isWireframe
                    ? 'bg-tealbrand-600 text-white border-tealbrand-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isWireframe ? 'Padat (Solid)' : 'Kerangka (Wireframe)'}
              </button>

              <button
                onClick={() => setUnfoldPercent(unfoldPercent === 0 ? 100 : 0)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{unfoldPercent === 0 ? 'Buka Jaring-Jaring' : 'Tutup Jadi Bangun Ruang'}</span>
              </button>
            </div>
          </div>

          {/* 3D Canvas Container */}
          <div className="relative w-full h-[480px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing">
            <canvas ref={canvas3DRef} className="w-full h-full block outline-none" />

            {/* Instruction Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <Compass className="w-4 h-4 text-tealbrand-400 animate-spin" />
              <span>Klik &amp; Geser kursor untuk memutar sudut pandang 360°</span>
            </div>

            {/* Unfold Slider Overlay at bottom */}
            <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Slider Buka Jaring-Jaring 3D:</span>
                <span className="text-tealbrand-400 font-bold">{unfoldPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={unfoldPercent}
                onChange={(e) => {
                  setUnfoldPercent(parseInt(e.target.value));
                  setIsAutoUnfolding(false);
                }}
                className="w-full accent-tealbrand-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Tertutup (Padat 3D)</span>
                <span>50% Mekar Terbuka</span>
                <span>100% Rebah Rata (Jaring-Jaring 2D)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODE VIEW 3: 5 MODUL EKSPERIMEN SAINS MATEMATIKA            */}
      {/* ============================================================== */}
      {viewMode === 'experiments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Experiment Navigation Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { id: 1, title: 'Eksperimen 1', desc: 'Buka-Tutup Jaring-Jaring', icon: '📦' },
              { id: 2, title: 'Eksperimen 2', desc: 'Sisi, Rusuk & Euler', icon: '📐' },
              { id: 3, title: 'Eksperimen 3', desc: 'Luas Permukaan Datar', icon: '📏' },
              { id: 4, title: 'Eksperimen 4', desc: 'Kubus Satuan Volume', icon: '🧊' },
              { id: 5, title: 'Eksperimen 5', desc: 'Kuis Evaluasi Juara', icon: '🏆' },
            ].map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
                  activeExperiment === exp.id
                    ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-500/20 ring-2 ring-brand-400/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{exp.icon}</span>
                <div>
                  <p className="font-bold text-xs">{exp.title}</p>
                  <p className="text-[10px] opacity-80 leading-tight">{exp.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Eksperimen 1: Buka-Tutup & Tebak Bentuk */}
          {activeExperiment === 1 && (
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>📦 Eksperimen 1: Tebak Bentuk Bangun Datar Penyusun</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pilih salah satu bangun ruang di atas, lalu geser slider di bawah untuk melihat bangun datar apa saja yang tersembunyi di dalamnya!
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-tealbrand-400 uppercase">
                    Hasil Analisis Bedah {activeShape.name}:
                  </p>
                  <ul className="space-y-2 text-xs">
                    {activeShape.components.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Terdiri dari <strong>{c.count} buah {c.shapeType}</strong> ({c.name})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-400 italic">
                    &quot;{activeShape.unfoldingExplanation}&quot;
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-2">
                  <span className="text-4xl">{activeShape.realObjects[0]?.emoji || '📦'}</span>
                  <p className="text-xs font-bold text-white">Contoh di Kehidupan Sehari-hari:</p>
                  <p className="text-xs text-amber-300 font-semibold">
                    {activeShape.realObjects.map((o) => o.name).join(' • ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 2: Karakteristik & Euler */}
          {activeExperiment === 2 && (
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>📐 Eksperimen 2: Menguji Rumus Euler (F + V = E + 2)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seorang ahli matematika terkenal bernama <strong>Leonhard Euler</strong> menemukan bahwa pada setiap bangun ruang polihedron (berbidang datar), jumlah Sisi (F) ditambah Titik Sudut (V) selalu sama dengan Rusuk (E) ditambah 2!
              </p>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">F (Faces / Sisi)</p>
                    <p className="text-2xl font-black text-amber-400 font-mono">
                      {activeShape.facesCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">V (Vertices / Titik Sudut)</p>
                    <p className="text-2xl font-black text-pink-400 font-mono">
                      {activeShape.verticesCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">E (Edges / Rusuk)</p>
                    <p className="text-2xl font-black text-tealbrand-400 font-mono">
                      {activeShape.edgesCount}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-700/60 text-center font-mono text-xs sm:text-sm text-indigo-200">
                  {activeShape.eulerFormulaApplies ? (
                    <p>
                      Pembuktian: {activeShape.facesCount} + {activeShape.verticesCount} ={' '}
                      {activeShape.edgesCount} + 2 ➔{' '}
                      <span className="font-bold text-emerald-400">
                        {activeShape.facesCount + activeShape.verticesCount} ={' '}
                        {activeShape.edgesCount + 2} (PERSAMAAN EULER TERBUKTI BENAR! ✓)
                      </span>
                    </p>
                  ) : (
                    <p className="text-amber-300">
                      Catatan: Tabung &amp; Kerucut adalah bangun ruang lengkung, sehingga rumus Euler polihedron tidak berlaku langsung karena memiliki sisi lengkung.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 3: Luas Permukaan */}
          {activeExperiment === 3 && (
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>📏 Eksperimen 3: Konsep Luas Permukaan dari Jaring-Jaring</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Luas Permukaan suatu bangun ruang sesungguhnya adalah <strong>penjumlahan dari luas seluruh bangun datar pembentuk jaring-jaringnya</strong>!
              </p>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Rumus Luas Permukaan:</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {activeShape.formulaSurface}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Rumus Volume Isi:</span>
                  <span className="font-bold text-tealbrand-400 text-sm">
                    {activeShape.formulaVolume}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 4: Volume Kubus Satuan */}
          {activeExperiment === 4 && (
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>🧊 Eksperimen 4: Mengisi Ruang dengan Kubus Satuan</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Volume bangun ruang dapat dihitung dengan menghitung berapa banyak <strong>kubus satuan 1×1×1</strong> yang dapat ditata rapi di dalamnya!
              </p>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Panjang</p>
                  <p className="text-lg font-black text-tealbrand-300 font-mono">4 kubus</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Lebar</p>
                  <p className="text-lg font-black text-amber-300 font-mono">3 kubus</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Tinggi</p>
                  <p className="text-lg font-black text-indigo-300 font-mono">2 kubus</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Volume</p>
                  <p className="text-lg font-black text-emerald-400 font-mono">
                    4×3×2 = 24 kubus
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 5: Kuis Evaluasi Juara Geometri */}
          {activeExperiment === 5 && (
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Kuis Juara: Rahasia Jaring-Jaring Bangun Ruang</span>
                </h3>
                {quizSubmitted && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Skor: {quizScore} / 100
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: '1. Bangun datar apa yang menyusun seluruh 6 sisi pada Kubus?',
                    options: ['Persegi Panjang', 'Persegi (Bujursangkar)', 'Segitiga', 'Lingkaran'],
                  },
                  {
                    q: '2. Sisi selimut pada Tabung jika dibuka dan dibentangkan akan berbentuk...',
                    options: ['Segitiga', 'Lingkaran', 'Persegi Panjang', 'Trapesium'],
                  },
                  {
                    q: '3. Berapakah jumlah titik sudut pada bangun ruang Tabung?',
                    options: ['0 titik sudut', '2 titik sudut', '4 titik sudut', '8 titik sudut'],
                  },
                  {
                    q: '4. Bangun ruang yang memiliki 1 alas persegi dan 4 dinding segitiga adalah...',
                    options: ['Prisma Segitiga', 'Limas Segiempat', 'Kerucut', 'Kubus'],
                  },
                  {
                    q: '5. Selimut kerucut yang melengkung ketika dibuka akan membentuk bangun datar...',
                    options: ['Persegi', 'Segitiga', 'Jajar Genjang', 'Juring Lingkaran (Sektor)'],
                  },
                ].map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                  >
                    <p className="font-bold text-xs sm:text-sm text-slate-100">{item.q}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = userAnswers[qIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setUserAnswers({ ...userAnswers, [qIdx]: optIdx })}
                            className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                              isChosen
                                ? 'bg-tealbrand-600/30 border-tealbrand-400 text-tealbrand-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="font-mono text-slate-400 mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(userAnswers).length < 5}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                    Object.keys(userAnswers).length === 5
                      ? 'bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 hover:from-tealbrand-500 hover:to-tealbrand-400 text-white cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Kirim Jawaban &amp; Cek Skor
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-center space-y-2">
                  <p className="text-emerald-300 font-bold text-sm">
                    {quizScore >= 80
                      ? '🎉 Hebat Sekali! Kamu adalah Juara Ahli Geometri!'
                      : 'Bagus! Pelajari kembali jaring-jaring di mode 2D & 3D lalu coba lagi.'}
                  </p>
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setUserAnswers({});
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold"
                  >
                    Ulangi Kuis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODE VIEW 4: AR (AUGMENTED REALITY) KAMERA MEJA BELAJAR      */}
      {/* ============================================================== */}
      {viewMode === 'ar' && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-400" />
                <span>Augmented Reality: Proyeksikan Bangun Ruang di Meja Nyata</span>
              </h3>
              <p className="text-xs text-slate-400">
                Arahkan kamera ke meja belajarmu untuk melihat {activeShape.name} melayang dan membentangkan jaring-jaringnya di dunia nyata!
              </p>
            </div>
            {isCameraActive && (
              <button
                onClick={handleStopCamera}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition-all"
              >
                Matikan Kamera
              </button>
            )}
          </div>

          <div className="relative w-full h-[440px] bg-black rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
            {/* Real Webcam Stream */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/90">
                <Camera className="w-12 h-12 text-pink-400 animate-bounce" />
                <h4 className="font-bold text-base text-white">Mode Kamera AR Belum Aktif</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Aktifkan kamera untuk memproyeksikan kubus dan bangun ruang 3D melayang di atas buku dan meja belajar aslimu!
                </p>
                {cameraError && (
                  <p className="text-xs text-rose-400 font-semibold">{cameraError}</p>
                )}
                <button
                  onClick={handleStartCamera}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all hover:scale-105"
                >
                  Izinkan &amp; Buka Kamera AR
                </button>
              </div>
            )}

            {/* AR Overlay Hologram */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="relative p-6 rounded-3xl border-2 border-pink-400/60 bg-pink-500/10 backdrop-blur-[1px] animate-pulse text-center space-y-2 shadow-2xl">
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
                    {activeShape.realObjects[0]?.emoji || '🧊'}
                  </div>
                  <p className="font-black text-sm text-white drop-shadow">
                    {activeShape.name} Melayang di Meja
                  </p>
                  <p className="text-[11px] text-pink-200">
                    Jaring-jaring: {unfoldPercent}% Mekar
                  </p>
                </div>
              </div>
            )}

            {/* AR Floating Slider */}
            {isCameraActive && (
              <div className="absolute bottom-4 inset-x-4 max-w-md mx-auto bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-pink-500/40 shadow-2xl space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-bold">Slider Buka di Meja AR:</span>
                  <span className="text-pink-400 font-bold">{unfoldPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={unfoldPercent}
                  onChange={(e) => setUnfoldPercent(parseInt(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODE VIEW 5: VR 360° RUANG KELAS / MUSEUM FUTURISTIK        */}
      {/* ============================================================== */}
      {viewMode === 'vr' && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Glasses className="w-4 h-4 text-purple-400" />
                <span>Virtual Reality 360°: Museum Geometri Antariksa</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rasakan pengalaman berada di dalam Museum Geometri 3D. Gunakan kacamata VR Cardboard untuk pengalaman imersif 3D nyata!
              </p>
            </div>

            <button
              onClick={() => setIsVrSplitScreen(!isVrSplitScreen)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isVrSplitScreen
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Glasses className="w-3.5 h-3.5" />
              <span>{isVrSplitScreen ? 'Mode Standar (1 Layar)' : 'Mode VR Cardboard (2 Layar)'}</span>
            </button>
          </div>

          <div
            className={`grid gap-2 ${
              isVrSplitScreen ? 'grid-cols-2' : 'grid-cols-1'
            } h-[440px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 p-2`}
          >
            {/* Left Eye / Main Eye */}
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-purple-500/30 flex items-center justify-center">
              <canvas ref={canvas3DRef} className="w-full h-full block" />
              <div className="absolute top-3 left-3 bg-purple-950/80 border border-purple-700 text-purple-200 px-2 py-0.5 rounded text-[10px] font-mono">
                {isVrSplitScreen ? 'Mata Kiri (L)' : 'VR 360° Headset'}
              </div>
            </div>

            {/* Right Eye (if Cardboard split enabled) */}
            {isVrSplitScreen && (
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-purple-500/30 flex items-center justify-center bg-slate-900/40">
                <div className="text-center space-y-2 pointer-events-none">
                  <Glasses className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-white">Mata Kanan (R) Stereoscopic</p>
                  <p className="text-[10px] text-purple-300">
                    Gunakan kacamata VR Cardboard untuk efek kedalaman 3D sejati
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
