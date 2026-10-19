'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Camera,
  Glasses,
  Play,
  Pause,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Layers,
  Box,
  Sliders,
  Maximize2,
  TrendingUp,
  Target,
  Calculator,
  Compass,
  Zap,
  Info,
  Check,
  Eye,
  Shuffle,
  Grid,
} from 'lucide-react';

type ViewMode = '2d' | '3d' | 'experiments' | 'ar' | 'vr';
type ShadingStyle = 'multi-color' | 'dhp-only' | 'inverse-clean';

export interface InequalityLine {
  id: string;
  name: string;
  a: number; // coefficient of x
  b: number; // coefficient of y
  op: '<=' | '>=';
  c: number; // constant
  colorHex: string;
  colorName: string;
  active: boolean;
}

export interface VertexPoint {
  x: number;
  y: number;
  label: string;
  zVal: number;
  isMax?: boolean;
  isMin?: boolean;
}

interface LinearInequalitiesDhpLabProps {
  onProgressUpdate?: (activityId?: string) => void;
}

export function LinearInequalitiesDhpLab({ onProgressUpdate }: LinearInequalitiesDhpLabProps) {
  // Multiverse modes
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [shadingStyle, setShadingStyle] = useState<ShadingStyle>('multi-color');

  // Presets
  const [presetKey, setPresetKey] = useState<string>('preset-roti');

  // Inequalities (positive axes x >= 0, y >= 0 are always enforced)
  const [lines, setLines] = useState<InequalityLine[]>([
    {
      id: 'L1',
      name: 'Pertidaksamaan 1 (Bahan Tepung)',
      a: 2,
      b: 1,
      op: '<=',
      c: 40,
      colorHex: '#06b6d4', // Cyan
      colorName: 'Cyan',
      active: true,
    },
    {
      id: 'L2',
      name: 'Pertidaksamaan 2 (Bahan Mentega)',
      a: 1,
      b: 2,
      op: '<=',
      c: 48,
      colorHex: '#f59e0b', // Amber
      colorName: 'Amber',
      active: true,
    },
    {
      id: 'L3',
      name: 'Pertidaksamaan 3 (Kapasitas Oven)',
      a: 1,
      b: 1,
      op: '<=',
      c: 32,
      colorHex: '#10b981', // Emerald
      colorName: 'Emerald',
      active: false,
    },
  ]);

  // Objective Function: Z = px + qy
  const [objP, setObjP] = useState<number>(2000);
  const [objQ, setObjQ] = useState<number>(1500);
  const [optimizeTarget, setOptimizeTarget] = useState<'max' | 'min'>('max');

  // Garis Selidik
  const [showGarisSelidik, setShowGarisSelidik] = useState<boolean>(true);
  const [garisSelidikK, setGarisSelidikK] = useState<number>(35000);

  // Titik Selidik Interaktif
  const [testPoint, setTestPoint] = useState<{ x: number; y: number }>({ x: 8, y: 12 });
  const [showTestPoint, setShowTestPoint] = useState<boolean>(true);

  // Hovered vertex
  const [hoveredVertex, setHoveredVertex] = useState<VertexPoint | null>(null);

  // Audio speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // 3D Three.js
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);

  // Camera & AR
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // VR
  const [isVrSplitScreen, setIsVrSplitScreen] = useState<boolean>(false);

  // Experiments Tab
  const [activeExperiment, setActiveExperiment] = useState<number>(1);
  const [exp1Point, setExp1Point] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [expQuizAnswers, setExpQuizAnswers] = useState<Record<number, number>>({});
  const [expQuizSubmitted, setExpQuizSubmitted] = useState<boolean>(false);
  const [expQuizScore, setExpQuizScore] = useState<number>(0);

  // Presets definition
  const applyPreset = (key: string) => {
    setPresetKey(key);
    if (key === 'preset-roti') {
      // Masalah Produksi Roti Bu Siti: 2x + y <= 40, x + 2y <= 48, Z = 2000x + 1500y
      setLines([
        { id: 'L1', name: 'Bahan Tepung (gr)', a: 2, b: 1, op: '<=', c: 40, colorHex: '#06b6d4', colorName: 'Cyan', active: true },
        { id: 'L2', name: 'Bahan Mentega (gr)', a: 1, b: 2, op: '<=', c: 48, colorHex: '#f59e0b', colorName: 'Amber', active: true },
        { id: 'L3', name: 'Kapasitas Rak Oven', a: 1, b: 1, op: '<=', c: 32, colorHex: '#10b981', colorName: 'Emerald', active: false },
      ]);
      setObjP(2000);
      setObjQ(1500);
      setOptimizeTarget('max');
      setTestPoint({ x: 10, y: 15 });
    } else if (key === 'preset-parkir') {
      // Masalah Lahan Parkir: x + 4y <= 60 (Luas), x + y <= 30 (Daya tampung), Z = 5000x + 10000y
      setLines([
        { id: 'L1', name: 'Kapasitas Luas (m²)', a: 1, b: 4, op: '<=', c: 60, colorHex: '#06b6d4', colorName: 'Cyan', active: true },
        { id: 'L2', name: 'Daya Tampung Kendaraan', a: 1, b: 1, op: '<=', c: 30, colorHex: '#f59e0b', colorName: 'Amber', active: true },
        { id: 'L3', name: 'Batas Kuota Petugas', a: 1, b: 0, op: '<=', c: 25, colorHex: '#10b981', colorName: 'Emerald', active: false },
      ]);
      setObjP(5000);
      setObjQ(10000);
      setOptimizeTarget('max');
      setTestPoint({ x: 15, y: 8 });
    } else if (key === 'preset-tiga-garis') {
      // 3 Pertidaksamaan: 2x + y <= 24, x + 2y <= 24, x + y >= 6
      setLines([
        { id: 'L1', name: 'Batas Mesin I (Jam)', a: 2, b: 1, op: '<=', c: 24, colorHex: '#06b6d4', colorName: 'Cyan', active: true },
        { id: 'L2', name: 'Batas Mesin II (Jam)', a: 1, b: 2, op: '<=', c: 24, colorHex: '#f59e0b', colorName: 'Amber', active: true },
        { id: 'L3', name: 'Target Minimum Produksi', a: 1, b: 1, op: '>=', c: 6, colorHex: '#10b981', colorName: 'Emerald', active: true },
      ]);
      setObjP(400);
      setObjQ(300);
      setOptimizeTarget('max');
      setTestPoint({ x: 6, y: 6 });
    } else if (key === 'preset-custom') {
      // Custom default
      setLines([
        { id: 'L1', name: 'Garis Pembatas 1', a: 3, b: 2, op: '<=', c: 18, colorHex: '#06b6d4', colorName: 'Cyan', active: true },
        { id: 'L2', name: 'Garis Pembatas 2', a: 1, b: 2, op: '<=', c: 10, colorHex: '#f59e0b', colorName: 'Amber', active: true },
        { id: 'L3', name: 'Garis Pembatas 3', a: 1, b: 1, op: '<=', c: 8, colorHex: '#10b981', colorName: 'Emerald', active: false },
      ]);
      setObjP(500);
      setObjQ(400);
      setOptimizeTarget('max');
      setTestPoint({ x: 2, y: 3 });
    }
  };

  // Determine coordinate domain (Xmax & Ymax) dynamically based on active line intercepts
  const { xMax, yMax } = useMemo(() => {
    let maxX = 10;
    let maxY = 10;
    lines.filter((l) => l.active).forEach((line) => {
      if (line.a > 0) {
        const xInt = line.c / line.a;
        if (xInt > 0 && isFinite(xInt)) maxX = Math.max(maxX, xInt);
      }
      if (line.b > 0) {
        const yInt = line.c / line.b;
        if (yInt > 0 && isFinite(yInt)) maxY = Math.max(maxY, yInt);
      }
    });
    // Add 20% margin
    const finalX = Math.ceil(maxX * 1.25);
    const finalY = Math.ceil(maxY * 1.25);
    return { xMax: Math.max(20, finalX), yMax: Math.max(20, finalY) };
  }, [lines]);

  // Calculate Intercepts and Intersections
  const activeLines = useMemo(() => lines.filter((l) => l.active), [lines]);

  // Compute Feasible Region (DHP) Polygon Vertices in Quadrant I (x >= 0, y >= 0)
  const dhpVertices: VertexPoint[] = useMemo(() => {
    const rawCandidates: { x: number; y: number }[] = [];

    // 1. Origin (0,0)
    rawCandidates.push({ x: 0, y: 0 });

    // 2. Intersections of each line with X axis (y = 0)
    activeLines.forEach((l) => {
      if (Math.abs(l.a) > 0.0001) {
        const x = l.c / l.a;
        if (x >= 0 && x <= xMax * 1.5) rawCandidates.push({ x, y: 0 });
      }
    });

    // 3. Intersections of each line with Y axis (x = 0)
    activeLines.forEach((l) => {
      if (Math.abs(l.b) > 0.0001) {
        const y = l.c / l.b;
        if (y >= 0 && y <= yMax * 1.5) rawCandidates.push({ x: 0, y });
      }
    });

    // 4. Pairwise intersections between active lines
    for (let i = 0; i < activeLines.length; i++) {
      for (let j = i + 1; j < activeLines.length; j++) {
        const l1 = activeLines[i];
        const l2 = activeLines[j];
        const det = l1.a * l2.b - l2.a * l1.b;
        if (Math.abs(det) > 0.0001) {
          const x = (l1.c * l2.b - l2.c * l1.b) / det;
          const y = (l1.a * l2.c - l2.a * l1.c) / det;
          if (x >= -0.001 && y >= -0.001 && x <= xMax * 1.5 && y <= yMax * 1.5) {
            rawCandidates.push({ x: Math.max(0, x), y: Math.max(0, y) });
          }
        }
      }
    }

    // 5. Filter candidates satisfying ALL active inequalities AND x >= 0, y >= 0
    const validPoints = rawCandidates.filter((pt) => {
      if (pt.x < -0.001 || pt.y < -0.001) return false;
      return activeLines.every((l) => {
        const val = l.a * pt.x + l.b * pt.y;
        if (l.op === '<=') return val <= l.c + 0.05;
        if (l.op === '>=') return val >= l.c - 0.05;
        return true;
      });
    });

    // Remove duplicates (within 0.05 precision)
    const uniquePoints: { x: number; y: number }[] = [];
    validPoints.forEach((pt) => {
      const exists = uniquePoints.some(
        (u) => Math.abs(u.x - pt.x) < 0.08 && Math.abs(u.y - pt.y) < 0.08
      );
      if (!exists) uniquePoints.push({ x: Number(pt.x.toFixed(2)), y: Number(pt.y.toFixed(2)) });
    });

    if (uniquePoints.length === 0) return [];

    // Sort vertices counter-clockwise around their centroid
    const cx = uniquePoints.reduce((acc, p) => acc + p.x, 0) / uniquePoints.length;
    const cy = uniquePoints.reduce((acc, p) => acc + p.y, 0) / uniquePoints.length;

    uniquePoints.sort((p1, p2) => {
      const angle1 = Math.atan2(p1.y - cy, p1.x - cx);
      const angle2 = Math.atan2(p2.y - cy, p2.x - cx);
      return angle1 - angle2;
    });

    // Map into VertexPoint with objective value Z = px + qy
    const letters = ['O', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const withZ: VertexPoint[] = uniquePoints.map((p, idx) => {
      const z = objP * p.x + objQ * p.y;
      return {
        x: p.x,
        y: p.y,
        label: p.x === 0 && p.y === 0 ? 'O' : letters[(idx % (letters.length - 1)) + 1] || `P${idx}`,
        zVal: z,
      };
    });

    if (withZ.length > 0) {
      let maxZ = -Infinity;
      let minZ = Infinity;
      withZ.forEach((v) => {
        if (v.zVal > maxZ) maxZ = v.zVal;
        if (v.zVal < minZ) minZ = v.zVal;
      });
      withZ.forEach((v) => {
        if (Math.abs(v.zVal - maxZ) < 0.01) v.isMax = true;
        if (Math.abs(v.zVal - minZ) < 0.01) v.isMin = true;
      });
    }

    return withZ;
  }, [activeLines, xMax, yMax, objP, objQ]);

  // Optimum Vertex
  const optimumVertex = useMemo(() => {
    if (dhpVertices.length === 0) return null;
    return optimizeTarget === 'max'
      ? dhpVertices.find((v) => v.isMax) || dhpVertices[0]
      : dhpVertices.find((v) => v.isMin) || dhpVertices[0];
  }, [dhpVertices, optimizeTarget]);

  // Update garis selidik slider default when optimum changes
  useEffect(() => {
    if (optimumVertex) {
      setGarisSelidikK(optimumVertex.zVal);
    }
  }, [optimumVertex]);

  // Check if testPoint is inside DHP
  const isTestPointInDHP = useMemo(() => {
    if (testPoint.x < 0 || testPoint.y < 0) return false;
    return activeLines.every((l) => {
      const val = l.a * testPoint.x + l.b * testPoint.y;
      return l.op === '<=' ? val <= l.c + 0.001 : val >= l.c - 0.001;
    });
  }, [testPoint, activeLines]);

  // SVG coordinate transform helper
  // SVG size: 600 x 480
  const svgW = 600;
  const svgH = 480;
  const padLeft = 55;
  const padBottom = 50;
  const padRight = 35;
  const padTop = 35;
  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const toSvgX = (x: number) => padLeft + (x / xMax) * plotW;
  const toSvgY = (y: number) => padTop + plotH - (y / yMax) * plotH;
  const fromSvgX = (sx: number) => Math.max(0, Math.min(xMax, ((sx - padLeft) / plotW) * xMax));
  const fromSvgY = (sy: number) => Math.max(0, Math.min(yMax, ((padTop + plotH - sy) / plotH) * yMax));

  // Handle canvas click to set testPoint
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mathX = Number(fromSvgX(clickX).toFixed(1));
    const mathY = Number(fromSvgY(clickY).toFixed(1));
    setTestPoint({ x: mathX, y: mathY });
  };

  // Build polygon path string for DHP
  const dhpPathData = useMemo(() => {
    if (dhpVertices.length < 3) return '';
    return (
      dhpVertices.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(v.x)} ${toSvgY(v.y)}`).join(' ') +
      ' Z'
    );
  }, [dhpVertices, xMax, yMax]);

  // Build Half-Plane Shading Polygon in Quadrant I for a single line
  const getLineShadingPolygon = (line: InequalityLine) => {
    // Intersections with x = 0, x = xMax, y = 0, y = yMax
    const points: { x: number; y: number }[] = [];
    const corners = [
      { x: 0, y: 0 },
      { x: xMax, y: 0 },
      { x: xMax, y: yMax },
      { x: 0, y: yMax },
    ];

    corners.forEach((c) => {
      const val = line.a * c.x + line.b * c.y;
      const ok = line.op === '<=' ? val <= line.c : val >= line.c;
      if (ok) points.push(c);
    });

    // Intersections with x=0 (Y axis)
    if (Math.abs(line.b) > 0.0001) {
      const y = line.c / line.b;
      if (y >= 0 && y <= yMax) points.push({ x: 0, y });
    }
    // Intersections with y=0 (X axis)
    if (Math.abs(line.a) > 0.0001) {
      const x = line.c / line.a;
      if (x >= 0 && x <= xMax) points.push({ x, y: 0 });
    }
    // Intersections with x=xMax
    if (Math.abs(line.b) > 0.0001) {
      const y = (line.c - line.a * xMax) / line.b;
      if (y >= 0 && y <= yMax) points.push({ x: xMax, y });
    }
    // Intersections with y=yMax
    if (Math.abs(line.a) > 0.0001) {
      const x = (line.c - line.b * yMax) / line.a;
      if (x >= 0 && x <= xMax) points.push({ x, y: yMax });
    }

    if (points.length < 3) return '';

    // Sort counter-clockwise
    const cx = points.reduce((a, b) => a + b.x, 0) / points.length;
    const cy = points.reduce((a, b) => a + b.y, 0) / points.length;
    points.sort((p1, p2) => Math.atan2(p1.y - cy, p1.x - cx) - Math.atan2(p2.y - cy, p2.x - cx));

    return (
      points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' ') + ' Z'
    );
  };

  // Web Speech API narration in Indonesian
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Peramban Anda belum mendukung fitur audio suara.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    let text = `Halo rekan-rekan pembelajar SMA dan SMK! Selamat datang di Laboratorium Sistem Pertidaksamaan Linear Dua Variabel. `;
    text += `Pada grafik kuadran pertama sumbu-sumbu positif x lebih dari sama dengan 0 dan y lebih dari sama dengan 0, `;
    text += `terdapat ${activeLines.length} garis pembatas pertidaksamaan. `;
    activeLines.forEach((l, idx) => {
      text += `Garis ke-${idx + 1} berwarna ${l.colorName} dengan persamaan ${l.a}x ditambah ${l.b}y sama dengan ${l.c}. `;
    });
    text += `Daerah himpunan penyelesaian atau D H P adalah daerah irisan berwarna kuning emas di mana seluruh arsiran warna bertemu. `;
    if (dhpVertices.length > 0) {
      text += `D H P dibatasi oleh ${dhpVertices.length} titik pojok yaitu: `;
      dhpVertices.forEach((v) => {
        text += `Titik ${v.label} di koordinat ${v.x} koma ${v.y}. `;
      });
      if (optimumVertex) {
        text += `Melalui uji titik pojok fungsi objektif Z, nilai maksimum diperoleh di titik ${optimumVertex.label} koordinat ${optimumVertex.x} koma ${optimumVertex.y} dengan nilai Z sebesar ${optimumVertex.zVal.toLocaleString('id-ID')} rupiah!`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =========================================================================
  // 3D THREE.JS WEBGL RENDERER (SPATIAL CARTESIAN DHP WORLD)
  // =========================================================================
  useEffect(() => {
    if ((viewMode !== '3d' && viewMode !== 'vr') || !canvas3DRef.current) return;

    const canvas = canvas3DRef.current;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewMode === 'vr' ? 0x050816 : 0x080e1e);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 18, 22);
    camera.lookAt(6, 3, 6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
    dirLight.position.set(15, 25, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 50);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    // 5. Main Model Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    groupRef.current = mainGroup;

    // Scale factors from math coordinates to 3D units
    const scaleFactor = 12 / Math.max(xMax, yMax);

    // Floor Grid in Quadrant I
    const gridHelper = new THREE.GridHelper(16, 16, 0x06b6d4, 0x1e293b);
    gridHelper.position.set(8, 0, 8);
    mainGroup.add(gridHelper);

    // 3D Axes: X (Red), Y (Green), Z-Height (Blue/Gold for Objective Z)
    const axisMatX = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const axisMatY = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
    const axisMatZ = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.5 });

    // X Axis cylinder along X
    const axisGeoX = new THREE.CylinderGeometry(0.08, 0.08, 16);
    const axisMeshX = new THREE.Mesh(axisGeoX, axisMatX);
    axisMeshX.rotation.z = -Math.PI / 2;
    axisMeshX.position.set(8, 0, 0);
    mainGroup.add(axisMeshX);

    // Y Axis cylinder along Z (spatial depth)
    const axisGeoY = new THREE.CylinderGeometry(0.08, 0.08, 16);
    const axisMeshY = new THREE.Mesh(axisGeoY, axisMatY);
    axisMeshY.rotation.x = Math.PI / 2;
    axisMeshY.position.set(0, 0, 8);
    mainGroup.add(axisMeshY);

    // Z Axis cylinder (Vertical Height = Nilai Z Fungsi Objektif)
    const axisGeoZ = new THREE.CylinderGeometry(0.08, 0.08, 10);
    const axisMeshZ = new THREE.Mesh(axisGeoZ, axisMatZ);
    axisMeshZ.position.set(0, 5, 0);
    mainGroup.add(axisMeshZ);

    // Render 3D DHP Extruded Prism standing UPWARDS above the grid floor
    if (dhpVertices.length >= 3) {
      const shape = new THREE.Shape();
      dhpVertices.forEach((v, idx) => {
        const x3d = v.x * scaleFactor;
        const z3d = v.y * scaleFactor;
        if (idx === 0) shape.moveTo(x3d, -z3d);
        else shape.lineTo(x3d, -z3d);
      });
      shape.closePath();

      const extrudeSettings = {
        steps: 1,
        depth: 2.2, // Prism height rising upwards above the floor (Y >= 0)
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.12,
        bevelSegments: 3,
      };

      const dhpGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      // Rotate shape so extrusion goes upwards (+Y >= 0) and lies flat on floor
      dhpGeo.rotateX(-Math.PI / 2);
      dhpGeo.computeVertexNormals();

      const dhpMaterial = new THREE.MeshStandardMaterial({
        color: 0xfacc15, // Golden yellow
        metalness: 0.35,
        roughness: 0.25,
        transparent: true,
        opacity: isWireframe ? 0.3 : 0.85,
        wireframe: isWireframe,
        side: THREE.DoubleSide,
      });

      const dhpMesh = new THREE.Mesh(dhpGeo, dhpMaterial);
      dhpMesh.position.set(0, 0, 0);
      dhpMesh.castShadow = true;
      dhpMesh.receiveShadow = true;
      mainGroup.add(dhpMesh);

      // Add vertex spheres & glowing pillars on each corner
      dhpVertices.forEach((v) => {
        const vx = v.x * scaleFactor;
        const vz = v.y * scaleFactor;

        // Pillar
        const pillarGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: v.isMax ? 0x22c55e : 0x38bdf8,
          emissive: v.isMax ? 0x15803d : 0x0284c7,
          emissiveIntensity: 0.5,
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(vx, 1.6, vz);
        mainGroup.add(pillar);

        // Top Sphere
        const sphereGeo = new THREE.SphereGeometry(v.isMax ? 0.32 : 0.22, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: v.isMax ? 0x22c55e : 0xf8fafc,
          roughness: 0.1,
          metalness: 0.8,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(vx, 3.2, vz);
        mainGroup.add(sphere);
      });
    }

    // Render 3D Boundary Wall Planes for each active line
    activeLines.forEach((l) => {
      // Find two points on boundary line within [0, xMax] x [0, yMax]
      const pts: { x: number; y: number }[] = [];
      if (Math.abs(l.b) > 0.001) {
        const y0 = l.c / l.b;
        if (y0 >= 0 && y0 <= yMax) pts.push({ x: 0, y: y0 });
        const y1 = (l.c - l.a * xMax) / l.b;
        if (y1 >= 0 && y1 <= yMax) pts.push({ x: xMax, y: y1 });
      }
      if (Math.abs(l.a) > 0.001) {
        const x0 = l.c / l.a;
        if (x0 >= 0 && x0 <= xMax && !pts.some((p) => Math.abs(p.x - x0) < 0.1)) {
          pts.push({ x: x0, y: 0 });
        }
      }

      if (pts.length >= 2) {
        const p1 = pts[0];
        const p2 = pts[1];
        const dx = (p2.x - p1.x) * scaleFactor;
        const dz = (p2.y - p1.y) * scaleFactor;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);

        const planeGeo = new THREE.PlaneGeometry(length, 5);
        const planeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(l.colorHex),
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const wall = new THREE.Mesh(planeGeo, planeMat);
        wall.position.set(
          (p1.x * scaleFactor + p2.x * scaleFactor) / 2,
          2.5,
          (p1.y * scaleFactor + p2.y * scaleFactor) / 2
        );
        wall.rotation.y = -angle;
        mainGroup.add(wall);
      }
    });

    // Orbit Drag Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const rotationSpeed = 0.006;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !mainGroup) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      mainGroup.rotation.y += deltaX * rotationSpeed;
      mainGroup.rotation.x += deltaY * rotationSpeed;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !mainGroup || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      mainGroup.rotation.y += deltaX * rotationSpeed;
      mainGroup.rotation.x += deltaY * rotationSpeed;

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
      if (isAutoRotate && !isDragging && mainGroup) {
        mainGroup.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };

    animate();

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
  }, [viewMode, lines, activeLines, dhpVertices, xMax, yMax, isWireframe, isAutoRotate]);

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
      setCameraError('Izin kamera diperlukan untuk memproyeksikan bidang grafik DHP di atas mejamu.');
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

  // Quiz submission evaluation
  const handleQuizSubmit = () => {
    // 5 Soal Program Linear
    // Q1: 0 (Uji titik (0,0) pada 2x + 3y <= 12 -> Benar, daerah menuju asal)
    // Q2: 1 (Titik potong 2x+y=10 dan x+2y=8 -> (4, 2))
    // Q3: 2 (DHP adalah daerah irisan yang memenuhi seluruh pertidaksamaan)
    // Q4: 0 (Uji titik pojok Z = 5000x + 4000y pada titik (0,0), (5,0), (4,2), (0,4) -> Maks di (4,2) bernilai 28.000)
    // Q5: 1 (Garis selidik ax+by=k digeser sejajar menjauhi titik asal untuk mencari nilai maksimum)
    const correctKeys = [0, 1, 2, 0, 1];
    let score = 0;
    correctKeys.forEach((key, idx) => {
      if (expQuizAnswers[idx] === key) score += 20;
    });
    setExpQuizScore(score);
    setExpQuizSubmitted(true);
    if (score >= 60) {
      confetti({ particleCount: 100, spread: 80 });
      if (onProgressUpdate) onProgressUpdate();
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* ============================================================== */}
      {/* 1. HEADER & MULTIVERSE NAVIGATION TABS                          */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950 uppercase tracking-wide">
              Matematika SMA / SMK (Fase E &amp; F)
            </span>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Pertidaksamaan Linear &amp; Program Linear
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Laboratorium Daerah Himpunan Penyelesaian (DHP) Sumbu Positif
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualisasikan arsiran multi-warna sistem pertidaksamaan linear dua variabel di kuadran positif (x &ge; 0, y &ge; 0), temukan titik potong, dan optimasi nilai fungsi objektif Z!
          </p>
        </div>

        {/* 5 Multiverse Modes Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setViewMode('2d');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === '2d'
                ? 'bg-gradient-to-r from-cyan-600 to-tealbrand-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🎨 2D Kartesius</span>
          </button>

          <button
            onClick={() => {
              setViewMode('3d');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
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
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
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
            <span>📱 AR Kamera Meja</span>
          </button>

          <button
            onClick={() => {
              setViewMode('vr');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'vr'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>🥽 VR 360°</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. PRESETS BAR & QUICK SETTINGS                                */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Pilih Skenario Kasus:
          </span>
          <button
            onClick={() => applyPreset('preset-roti')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              presetKey === 'preset-roti'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🍞 Pabrik Roti (Tepung &amp; Mentega)
          </button>
          <button
            onClick={() => applyPreset('preset-parkir')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              presetKey === 'preset-parkir'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🚗 Lahan Parkir (Mobil &amp; Bus)
          </button>
          <button
            onClick={() => applyPreset('preset-tiga-garis')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              presetKey === 'preset-tiga-garis'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🌈 3 Garis (Irisan Tiga Warna)
          </button>
          <button
            onClick={() => applyPreset('preset-custom')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              presetKey === 'preset-custom'
                ? 'bg-purple-500 text-white shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ⚙️ Kustom Bebas
          </button>
        </div>

        {/* Audio Teacher Button */}
        <button
          onClick={handleToggleVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isSpeaking
              ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span>{isSpeaking ? 'Hentikan Suara' : '🔊 Narasi Guru'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. MODE 1: 2D KARTESIUS EDUKASI INTERAKTIF                     */}
      {/* ============================================================== */}
      {viewMode === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Left Column (7 cols): Interactive SVG Cartesian Canvas */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Bidang Koordinat Kartesius Kuadran I (x &ge; 0, y &ge; 0)
                </h3>
              </div>

              {/* Shading Style Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setShadingStyle('multi-color')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                    shadingStyle === 'multi-color'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilkan garis arsiran multi-warna dari setiap pertidaksamaan"
                >
                  Arsiran Warna-Warni
                </button>
                <button
                  onClick={() => setShadingStyle('dhp-only')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                    shadingStyle === 'dhp-only'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Sorot hanya daerah himpunan penyelesaian"
                >
                  Sorot DHP Emas
                </button>
                <button
                  onClick={() => setShadingStyle('inverse-clean')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                    shadingStyle === 'inverse-clean'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Metode daerah bersih: arsiran di luar DHP"
                >
                  Metode Bersih
                </button>
              </div>
            </div>

            {/* SVG Canvas Container */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-2">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-auto max-h-[490px] select-none cursor-crosshair"
                onClick={handleSvgClick}
              >
                {/* SVG Definitions for Hatching Patterns */}
                <defs>
                  {/* Pattern Line 1: Cyan diagonal lines 45 deg */}
                  <pattern
                    id="hatch-cyan"
                    patternUnits="userSpaceOnUse"
                    width="12"
                    height="12"
                    patternTransform="rotate(45)"
                  >
                    <line x1="0" y1="0" x2="0" y2="12" stroke="#06b6d4" strokeWidth="2.5" opacity="0.6" />
                  </pattern>

                  {/* Pattern Line 2: Amber diagonal lines 135 deg */}
                  <pattern
                    id="hatch-amber"
                    patternUnits="userSpaceOnUse"
                    width="12"
                    height="12"
                    patternTransform="rotate(-45)"
                  >
                    <line x1="0" y1="0" x2="0" y2="12" stroke="#f59e0b" strokeWidth="2.5" opacity="0.6" />
                  </pattern>

                  {/* Pattern Line 3: Emerald horizontal lines 0 deg */}
                  <pattern id="hatch-emerald" patternUnits="userSpaceOnUse" width="10" height="10">
                    <line x1="0" y1="0" x2="10" y2="0" stroke="#10b981" strokeWidth="2" opacity="0.6" />
                  </pattern>

                  {/* Glow filter for DHP */}
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. Grid Lines */}
                {Array.from({ length: 11 }).map((_, i) => {
                  const gx = (i / 10) * xMax;
                  const gy = (i / 10) * yMax;
                  return (
                    <g key={i}>
                      {/* Vertical grid */}
                      <line
                        x1={toSvgX(gx)}
                        y1={padTop}
                        x2={toSvgX(gx)}
                        y2={padTop + plotH}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      {/* Horizontal grid */}
                      <line
                        x1={padLeft}
                        y1={toSvgY(gy)}
                        x2={padLeft + plotW}
                        y2={toSvgY(gy)}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      {/* X labels */}
                      <text
                        x={toSvgX(gx)}
                        y={padTop + plotH + 18}
                        fill="#94a3b8"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {Math.round(gx)}
                      </text>
                      {/* Y labels */}
                      <text
                        x={padLeft - 10}
                        y={toSvgY(gy) + 3}
                        fill="#94a3b8"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        {Math.round(gy)}
                      </text>
                    </g>
                  );
                })}

                {/* 2. Positive Sumbu-Sumbu X & Y (Thick Axes with Arrows) */}
                {/* Sumbu X */}
                <line
                  x1={padLeft}
                  y1={toSvgY(0)}
                  x2={padLeft + plotW + 15}
                  y2={toSvgY(0)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />
                <polygon
                  points={`${padLeft + plotW + 22},${toSvgY(0)} ${padLeft + plotW + 14},${toSvgY(0) - 4} ${padLeft + plotW + 14},${toSvgY(0) + 4}`}
                  fill="#ef4444"
                />
                <text
                  x={padLeft + plotW + 12}
                  y={toSvgY(0) + 16}
                  fill="#ef4444"
                  fontSize="12"
                  fontWeight="black"
                >
                  X (x &ge; 0)
                </text>

                {/* Sumbu Y */}
                <line
                  x1={toSvgX(0)}
                  y1={padTop + plotH}
                  x2={toSvgX(0)}
                  y2={padTop - 15}
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <polygon
                  points={`${toSvgX(0)},${padTop - 22} ${toSvgX(0) - 4},${padTop - 14} ${toSvgX(0) + 4},${padTop - 14}`}
                  fill="#10b981"
                />
                <text
                  x={toSvgX(0) - 8}
                  y={padTop - 14}
                  fill="#10b981"
                  fontSize="12"
                  fontWeight="black"
                  textAnchor="end"
                >
                  Y (y &ge; 0)
                </text>

                {/* Origin Label O (0,0) */}
                <text x={padLeft - 12} y={toSvgY(0) + 16} fill="#94a3b8" fontSize="11" fontWeight="bold">
                  O(0,0)
                </text>

                {/* 3. Layer 1: Multi-Color Shading Regions for each inequality */}
                {shadingStyle === 'multi-color' &&
                  activeLines.map((l) => {
                    const polyData = getLineShadingPolygon(l);
                    if (!polyData) return null;
                    const hatchId =
                      l.id === 'L1'
                        ? 'url(#hatch-cyan)'
                        : l.id === 'L2'
                        ? 'url(#hatch-amber)'
                        : 'url(#hatch-emerald)';
                    return (
                      <g key={`shade-${l.id}`} opacity="0.8">
                        {/* Semi-transparent color background */}
                        <path d={polyData} fill={l.colorHex} fillOpacity="0.14" />
                        {/* Hatch pattern layer */}
                        <path d={polyData} fill={hatchId} />
                      </g>
                    );
                  })}

                {/* Inverse-clean shading (dimming outside DHP) */}
                {shadingStyle === 'inverse-clean' && (
                  <path
                    d={`M ${padLeft} ${padTop} L ${padLeft + plotW} ${padTop} L ${padLeft + plotW} ${padTop + plotH} L ${padLeft} ${padTop + plotH} Z ${dhpPathData}`}
                    fill="#0f172a"
                    fillOpacity="0.65"
                    fillRule="evenodd"
                  />
                )}

                {/* 4. Layer 2: Feasible Region (DHP) - Gold Highlighting & Glowing Border */}
                {dhpPathData && (
                  <g filter="url(#glow-gold)">
                    <path
                      d={dhpPathData}
                      fill="#eab308"
                      fillOpacity={shadingStyle === 'dhp-only' ? '0.45' : '0.35'}
                      stroke="#facc15"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />
                  </g>
                )}

                {/* DHP Central Label Badge */}
                {dhpVertices.length >= 3 && (
                  <g>
                    {(() => {
                      const avgX = dhpVertices.reduce((a, b) => a + b.x, 0) / dhpVertices.length;
                      const avgY = dhpVertices.reduce((a, b) => a + b.y, 0) / dhpVertices.length;
                      return (
                        <g transform={`translate(${toSvgX(avgX)}, ${toSvgY(avgY)})`}>
                          <rect
                            x="-52"
                            y="-14"
                            width="104"
                            height="28"
                            rx="14"
                            fill="#020617"
                            stroke="#eab308"
                            strokeWidth="2"
                            className="shadow-lg"
                          />
                          <text
                            x="0"
                            y="4"
                            fill="#facc15"
                            fontSize="11"
                            fontWeight="900"
                            textAnchor="middle"
                            letterSpacing="0.5"
                          >
                            ⭐ DAERAH HP
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}

                {/* 5. Boundary Lines */}
                {activeLines.map((l) => {
                  // Find points at x=0 and x=xMax
                  let yAt0 = l.b !== 0 ? l.c / l.b : 0;
                  let yAtMax = l.b !== 0 ? (l.c - l.a * xMax) / l.b : 0;

                  return (
                    <g key={`line-${l.id}`}>
                      <line
                        x1={toSvgX(0)}
                        y1={toSvgY(yAt0)}
                        x2={toSvgX(xMax)}
                        y2={toSvgY(yAtMax)}
                        stroke={l.colorHex}
                        strokeWidth="3"
                        strokeDasharray={l.op === '<=' ? undefined : '6,4'}
                      />
                      {/* Line Name Tag on Canvas */}
                      <text
                        x={toSvgX(xMax * 0.75)}
                        y={toSvgY((l.c - l.a * (xMax * 0.75)) / l.b) - 8}
                        fill={l.colorHex}
                        fontSize="11"
                        fontWeight="bold"
                        className="drop-shadow"
                      >
                        {l.a}x + {l.b}y = {l.c}
                      </text>
                    </g>
                  );
                })}

                {/* 6. Garis Selidik: px + qy = k */}
                {showGarisSelidik && (
                  <g>
                    {(() => {
                      const y0 = garisSelidikK / objQ;
                      const yMaxX = (garisSelidikK - objP * xMax) / objQ;
                      return (
                        <g>
                          <line
                            x1={toSvgX(0)}
                            y1={toSvgY(y0)}
                            x2={toSvgX(xMax)}
                            y2={toSvgY(yMaxX)}
                            stroke="#e11d48"
                            strokeWidth="2.5"
                            strokeDasharray="5,4"
                          />
                          <text
                            x={toSvgX(xMax * 0.4)}
                            y={toSvgY((garisSelidikK - objP * (xMax * 0.4)) / objQ) - 6}
                            fill="#fb7185"
                            fontSize="10"
                            fontWeight="bold"
                          >
                            Garis Selidik: {objP}x + {objQ}y = {garisSelidikK.toLocaleString()}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}

                {/* 7. Vertices (Titik Pojok DHP) */}
                {dhpVertices.map((v) => {
                  const isHovered = hoveredVertex?.label === v.label;
                  return (
                    <g
                      key={`v-${v.label}`}
                      onMouseEnter={() => setHoveredVertex(v)}
                      onMouseLeave={() => setHoveredVertex(null)}
                      className="cursor-pointer"
                    >
                      {/* Pulse circle if optimum */}
                      {v.isMax && (
                        <circle
                          cx={toSvgX(v.x)}
                          cy={toSvgY(v.y)}
                          r="14"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="2"
                          opacity="0.8"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={toSvgX(v.x)}
                        cy={toSvgY(v.y)}
                        r={isHovered ? 8 : 6}
                        fill={v.isMax ? '#22c55e' : '#f8fafc'}
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        className="transition-all duration-200 shadow"
                      />
                      {/* Vertex Label & Coordinates Tag */}
                      <rect
                        x={toSvgX(v.x) + 8}
                        y={toSvgY(v.y) - 18}
                        width="80"
                        height="20"
                        rx="6"
                        fill="#020617"
                        stroke={v.isMax ? '#22c55e' : '#475569'}
                        strokeWidth="1.5"
                        opacity="0.95"
                      />
                      <text
                        x={toSvgX(v.x) + 48}
                        y={toSvgY(v.y) - 4}
                        fill={v.isMax ? '#4ade80' : '#f8fafc'}
                        fontSize="10"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {v.label} ({v.x}, {v.y})
                      </text>
                    </g>
                  );
                })}

                {/* 8. Interactive Test Point */}
                {showTestPoint && (
                  <g>
                    <circle
                      cx={toSvgX(testPoint.x)}
                      cy={toSvgY(testPoint.y)}
                      r="7"
                      fill={isTestPointInDHP ? '#10b981' : '#f43f5e'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={toSvgX(testPoint.x) + 10}
                      y={toSvgY(testPoint.y) + 4}
                      fill={isTestPointInDHP ? '#34d399' : '#fb7185'}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Uji ({testPoint.x}, {testPoint.y}) : {isTestPointInDHP ? 'Di Dalam DHP' : 'Di Luar DHP'}
                    </text>
                  </g>
                )}
              </svg>

              {/* Canvas Overlay Legend */}
              <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-[10px] space-y-1 backdrop-blur shadow-lg">
                <div className="font-bold text-slate-300">Keterangan Arsiran:</div>
                {activeLines.map((l) => (
                  <div key={l.id} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: l.colorHex }} />
                    <span className="text-slate-300">{l.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-0.5 border-t border-slate-800">
                  <span className="w-3 h-3 rounded bg-amber-400 shadow" />
                  <span className="text-amber-300 font-bold">Irisan Bersama (DHP)</span>
                </div>
              </div>
            </div>

            {/* Slider Garis Selidik */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Garis Selidik: {objP}x + {objQ}y = k
                </span>
                <span className="font-mono text-amber-300 font-black">
                  k = {garisSelidikK.toLocaleString('id-ID')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.round((optimumVertex?.zVal || 50000) * 1.3)}
                step={objP > 500 ? 500 : 10}
                value={garisSelidikK}
                onChange={(e) => setGarisSelidikK(Number(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Geser nilai <strong>k</strong> untuk melihat pergerakan garis selidik. Titik pojok DHP terakhir yang disentuh garis sebelum keluar dari DHP adalah titik optimum maksimum!
              </p>
            </div>
          </div>

          {/* Right Column (5 cols): Controls, Coefficients & Objective Function */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Panel Kendali Sistem Pertidaksamaan */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Sistem Pertidaksamaan (SPtLDV)</span>
                </h4>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800">
                  x &ge; 0, y &ge; 0
                </span>
              </div>

              {/* Line items with interactive inputs */}
              <div className="space-y-3">
                {lines.map((l, index) => (
                  <div
                    key={l.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      l.active
                        ? 'bg-slate-950 border-slate-700 shadow-md'
                        : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={l.active}
                          onChange={(e) => {
                            const newLines = [...lines];
                            newLines[index].active = e.target.checked;
                            setLines(newLines);
                          }}
                          className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.colorHex }} />
                        <span className="text-xs font-bold text-slate-200">{l.name}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold" style={{ color: l.colorHex }}>
                        {l.a}x + {l.b}y {l.op} {l.c}
                      </span>
                    </div>

                    {/* Inputs a, b, op, c */}
                    {l.active && (
                      <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Koef. x (a)</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={l.a}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              const newLines = [...lines];
                              newLines[index].a = val;
                              setLines(newLines);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Koef. y (b)</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={l.b}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              const newLines = [...lines];
                              newLines[index].b = val;
                              setLines(newLines);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Tanda</label>
                          <select
                            value={l.op}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[index].op = e.target.value as '<=' | '>=';
                              setLines(newLines);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 text-center font-mono font-bold text-amber-400 focus:outline-none"
                          >
                            <option value="<=">&le;</option>
                            <option value=">=">&ge;</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Konstanta (c)</label>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={l.c}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              const newLines = [...lines];
                              newLines[index].c = val;
                              setLines(newLines);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Uji Titik Pojok & Fungsi Objektif Z */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <h4 className="font-extrabold text-sm text-white">
                    Uji Titik Pojok (Fungsi Objektif Z)
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setOptimizeTarget('max')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      optimizeTarget === 'max'
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Maksimum
                  </button>
                  <button
                    onClick={() => setOptimizeTarget('min')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      optimizeTarget === 'min'
                        ? 'bg-blue-500 text-white font-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Minimum
                  </button>
                </div>
              </div>

              {/* Objective Function Form: Z = px + qy */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold">Z(x, y) = </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={objP}
                    onChange={(e) => setObjP(parseInt(e.target.value) || 0)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 text-center font-bold text-cyan-300"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={objQ}
                    onChange={(e) => setObjQ(parseInt(e.target.value) || 0)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 text-center font-bold text-amber-300"
                  />
                  <span>y</span>
                </div>
              </div>

              {/* Table of Vertices Evaluation */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-1.5 pl-1 font-bold">Titik Pojok</th>
                      <th className="pb-1.5 font-bold">Koordinat (x, y)</th>
                      <th className="pb-1.5 font-bold">Perhitungan Z</th>
                      <th className="pb-1.5 font-bold text-right pr-1">Nilai Z</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {dhpVertices.map((v) => {
                      const isOpt =
                        optimizeTarget === 'max' ? v.isMax : v.isMin;
                      return (
                        <tr
                          key={v.label}
                          className={`transition-colors ${
                            isOpt
                              ? 'bg-emerald-950/40 text-emerald-300 font-bold'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <td className="py-2 pl-1 flex items-center gap-1.5 font-bold">
                            <span>{v.label}</span>
                            {isOpt && <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </td>
                          <td className="py-2">
                            ({v.x}, {v.y})
                          </td>
                          <td className="py-2 text-[11px] text-slate-400">
                            {objP}({v.x}) + {objQ}({v.y})
                          </td>
                          <td className="py-2 text-right pr-1 font-black">
                            {v.zVal.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Conclusion Banner */}
              {optimumVertex && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-2.5">
                  <Award className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-300">
                      🎯 Nilai {optimizeTarget === 'max' ? 'Maksimum' : 'Minimum'} Tercapai di Titik{' '}
                      {optimumVertex.label} ({optimumVertex.x}, {optimumVertex.y})
                    </p>
                    <p className="text-[11px] text-emerald-200/90 mt-0.5 font-mono">
                      Nilai Optimum Z = {optimumVertex.zVal.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE 2: 3D THREE.JS WEBGL RENDERER                          */}
      {/* ============================================================== */}
      {viewMode === '3d' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              <h3 className="font-extrabold text-sm text-white">
                Simulasi 3D Spasial Poligon DHP &amp; Bidang Pertidaksamaan
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all border ${
                  isAutoRotate
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoRotate ? 'Jeda Putar' : 'Putar Otomatis'}</span>
              </button>

              <button
                onClick={() => setIsWireframe(!isWireframe)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all border ${
                  isWireframe
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{isWireframe ? 'Mode Padat' : 'Mode Rangka'}</span>
              </button>
            </div>
          </div>

          <div className="relative h-[480px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            <canvas ref={canvas3DRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

            {/* 3D Legend Info Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs space-y-1.5 backdrop-blur shadow-xl pointer-events-none">
              <div className="font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Elemen 3D Spasial:</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Sumbu X (Horizontal)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Sumbu Y (Kedalaman / Positif)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Prisma Emas = Daerah HP (DHP)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Bidang Dinding Pembatas SPtLDV</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/80 px-3 py-1 rounded-xl text-[11px] text-slate-400 border border-slate-800">
              💡 Geser mouse / usap layar untuk memutar 360°
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODE 3: 🧪 5 MODUL EKSPERIMEN PROGRAM LINEAR                 */}
      {/* ============================================================== */}
      {viewMode === 'experiments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Experiment Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 1, title: '1. Uji Titik Selidik (0,0)', icon: '🎯' },
              { id: 2, title: '2. Titik Potong Garis', icon: '✂️' },
              { id: 3, title: '3. Irisan Multi-Warna DHP', icon: '🎨' },
              { id: 4, title: '4. Garis Selidik & Optimasi', icon: '📈' },
              { id: 5, title: '5. Kuis Juara SPtLDV', icon: '🏆' },
            ].map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeExperiment === exp.id
                    ? 'bg-gradient-to-r from-cyan-900/40 to-tealbrand-900/40 border-cyan-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="text-xl mb-1">{exp.icon}</div>
                <div className="text-xs font-bold leading-tight">{exp.title}</div>
              </button>
            ))}
          </div>

          {/* Eksperimen 1: Uji Titik Selidik (0,0) */}
          {activeExperiment === 1 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 1: Cara Cepat Menentukan Arah Arsiran dengan Titik Selidik (0, 0)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pelajari langkah standar menentukan daerah benar atau salah pada pertidaksamaan linear.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-cyan-400">Kasus Pertidaksamaan: 2x + 3y &le; 12</h5>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
                    <li>
                      <strong>Langkah 1:</strong> Gambar garis batas <code>2x + 3y = 12</code> dengan mencari titik potong sumbu:
                      <ul className="list-disc list-inside pl-4 text-slate-400 mt-1">
                        <li>Jika y = 0 &rarr; 2x = 12 &rarr; <strong>x = 6 &rarr; (6, 0)</strong></li>
                        <li>Jika x = 0 &rarr; 3y = 12 &rarr; <strong>y = 4 &rarr; (0, 4)</strong></li>
                      </ul>
                    </li>
                    <li>
                      <strong>Langkah 2:</strong> Uji titik selidik <code>(0, 0)</code> ke dalam pertidaksamaan:
                      <div className="mt-1 p-2 rounded-xl bg-slate-900 font-mono text-cyan-300 font-bold">
                        2(0) + 3(0) &le; 12 &rarr; 0 &le; 12 (BENAR / MEMENUHI)
                      </div>
                    </li>
                    <li>
                      <strong>Langkah 3:</strong> Karena pernyataan <strong>BENAR</strong>, arsir daerah yang <strong>memuat titik (0, 0)</strong> (mengarah ke titik asal).
                    </li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="text-xs font-bold text-amber-400">Simulasi Uji Sembarang Titik:</h5>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span>Titik Uji (x, y):</span>
                      <input
                        type="number"
                        value={exp1Point.x}
                        onChange={(e) => setExp1Point({ ...exp1Point, x: parseInt(e.target.value) || 0 })}
                        className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                      />
                      <input
                        type="number"
                        value={exp1Point.y}
                        onChange={(e) => setExp1Point({ ...exp1Point, y: parseInt(e.target.value) || 0 })}
                        className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                      />
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-900 font-mono text-xs">
                      <p>Nilai: 2({exp1Point.x}) + 3({exp1Point.y}) = {2 * exp1Point.x + 3 * exp1Point.y}</p>
                      <p className="mt-1 font-bold">
                        Status:{' '}
                        {2 * exp1Point.x + 3 * exp1Point.y <= 12 ? (
                          <span className="text-emerald-400">MEMENUHI &le; 12 (Masuk Daerah HP)</span>
                        ) : (
                          <span className="text-rose-400">TIDAK MEMENUHI &gt; 12 (Di Luar Daerah HP)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setViewMode('2d');
                      applyPreset('preset-custom');
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <span>Coba di Kanvas 2D Kartesius</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 2: Menghitung Titik Potong Dua Garis */}
          {activeExperiment === 2 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">✂️</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 2: Eliminasi &amp; Substitusi Titik Potong Dua Garis Pembatas
                  </h4>
                  <p className="text-xs text-slate-400">
                    Menghitung koordinat perpotongan dua garis pembatas yang menjadi salah satu titik pojok terpenting DHP.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-800/40">
                    <p className="text-cyan-300 font-bold">Persamaan (1): 2x + y = 40</p>
                    <p className="text-slate-400 mt-0.5">Dikalikan 2 &rarr; 4x + 2y = 80</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-800/40">
                    <p className="text-amber-300 font-bold">Persamaan (2): x + 2y = 48</p>
                    <p className="text-slate-400 mt-0.5">Dikalikan 1 &rarr; x + 2y = 48</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 space-y-2">
                  <p className="font-bold text-white">Langkah Eliminasi Variabel y:</p>
                  <p className="font-mono text-cyan-300">
                    (4x + 2y = 80) &minus; (x + 2y = 48) &rarr; 3x = 32 &rarr; <strong>x = 10.67 (atau 32/3)</strong>
                  </p>
                  <p className="font-bold text-white mt-2">Langkah Substitusi Nilai x ke Persamaan (1):</p>
                  <p className="font-mono text-amber-300">
                    2(32/3) + y = 40 &rarr; 64/3 + y = 120/3 &rarr; <strong>y = 56/3 &asymp; 18.67</strong>
                  </p>
                  <p className="text-emerald-400 font-bold mt-2">
                    &rArr; Titik Potong Pembatas DHP berada pada koordinat (10.67, 18.67)!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 3: Irisan Multi-Warna DHP */}
          {activeExperiment === 3 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">🎨</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 3: Sistem Pertidaksamaan Multi-Warna &amp; Daerah Feasible
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pahami bagaimana setiap pertidaksamaan memancarkan warna arsirannya masing-masing, dan DHP adalah perpotongannya.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <span className="w-3 h-3 rounded bg-cyan-400" />
                    <span>Arsiran Garis 1 (Cyan)</span>
                  </div>
                  <p className="text-slate-300 mt-2">
                    Garis arsiran diagonal 45&deg; menaungi seluruh daerah yang memenuhi kendala pertama.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <span className="w-3 h-3 rounded bg-amber-400" />
                    <span>Arsiran Garis 2 (Amber)</span>
                  </div>
                  <p className="text-slate-300 mt-2">
                    Garis arsiran berlawanan arah 135&deg; menaungi seluruh daerah kendala kedua.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-yellow-950/40 border border-yellow-500/40">
                  <div className="flex items-center gap-2 font-bold text-yellow-300">
                    <span className="w-3 h-3 rounded bg-yellow-400" />
                    <span>DHP (Emas Bercahaya)</span>
                  </div>
                  <p className="text-slate-300 mt-2">
                    Daerah irisan di mana kedua warna saling bersilangan di kuadran pertama x &ge; 0, y &ge; 0.
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => {
                    setViewMode('2d');
                    applyPreset('preset-tiga-garis');
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-amber-600 hover:from-cyan-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <span>Tampilkan Irisan 3 Warna di Kanvas 2D</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Eksperimen 4: Garis Selidik & Optimasi */}
          {activeExperiment === 4 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">📈</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 4: Garis Selidik px + qy = k untuk Menentukan Titik Maksimum
                  </h4>
                  <p className="text-xs text-slate-400">
                    Konsep geometri di balik fungsi objektif tanpa harus menguji satu per satu.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3 leading-relaxed">
                <p className="text-slate-300">
                  <strong>Garis Selidik</strong> adalah garis keluarga <code>ax + by = k</code> yang memiliki gradien tetap <code>m = &minus;a/b</code>. Ketika nilai <strong>k</strong> diperbesar, garis ini akan bergeser sejajar menjauhi titik asal (0,0).
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-cyan-300">
                  <p>&bull; Titik DHP pertama yang disentuh saat k diperbesar &rarr; Titik Minimum</p>
                  <p>&bull; Titik DHP terakhir yang disentuh sebelum meninggalkan DHP &rarr; Titik Maksimum</p>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Buka tab <strong>2D Kartesius</strong> dan gunakan penggeser (slider) merah jambu di bawah kanvas untuk melihat pergeseran garis selidik ini secara langsung!
                </p>
              </div>
            </div>
          )}

          {/* Eksperimen 5: Kuis Juara SPtLDV */}
          {activeExperiment === 5 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h4 className="font-extrabold text-base text-white">
                      Eksperimen 5: Kuis Juara Program Linear &amp; SPtLDV SMA/SMK
                    </h4>
                    <p className="text-xs text-slate-400">
                      Uji kompetensimu dalam menentukan DHP, titik potong, dan nilai optimum fungsi objektif.
                    </p>
                  </div>
                </div>
                {expQuizSubmitted && (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300 font-mono font-bold text-xs">
                    Skor: {expQuizScore} / 100
                  </span>
                )}
              </div>

              {/* 5 Questions */}
              <div className="space-y-4">
                {[
                  {
                    q: '1. Jika titik selidik (0, 0) disubstitusikan ke dalam pertidaksamaan 2x + 3y <= 12 dan bernilai BENAR (0 <= 12), ke manakah arah daerah himpunan penyelesaiannya?',
                    opts: [
                      'Mengarah ke bawah/kiri (memuat titik asal 0,0)',
                      'Mengarah ke atas/kanan (menjauhi titik asal 0,0)',
                      'Hanya tepat di sepanjang garis batas saja',
                      'Tidak ada daerah penyelesaian yang terbentuk',
                    ],
                  },
                  {
                    q: '2. Berapakah koordinat titik potong antara garis 2x + y = 10 dan garis x + 2y = 8?',
                    opts: ['(2, 6)', '(4, 2)', '(3, 4)', '(5, 0)'],
                  },
                  {
                    q: '3. Apakah yang dimaksud dengan Daerah Himpunan Penyelesaian (DHP) pada sistem pertidaksamaan linear?',
                    opts: [
                      'Daerah yang hanya memenuhi satu pertidaksamaan saja',
                      'Seluruh bidang kartesius tanpa batasan',
                      'Daerah irisan yang sekaligus memenuhi seluruh pertidaksamaan dalam sistem',
                      'Garis yang menghubungkan titik potong sumbu X dan Y',
                    ],
                  },
                  {
                    q: '4. Diketahui DHP memiliki titik pojok O(0,0), A(5,0), B(4,2), dan C(0,4). Berapakah nilai maksimum dari fungsi objektif Z = 5000x + 4000y?',
                    opts: [
                      'Rp 28.000 (pada titik B)',
                      'Rp 25.000 (pada titik A)',
                      'Rp 16.000 (pada titik C)',
                      'Rp 32.000 (pada titik di luar DHP)',
                    ],
                  },
                  {
                    q: '5. Pada metode garis selidik ax + by = k, bagaimanakah cara menentukan titik yang menghasilkan nilai maksimum?',
                    opts: [
                      'Mencari titik potong sumbu X terdekat',
                      'Menggeser garis selidik sejajar menjauhi titik asal hingga titik pojok terakhir yang disentuh sebelum keluar DHP',
                      'Memilih titik asal O(0,0)',
                      'Mengubah gradien garis secara acak',
                    ],
                  },
                ].map((item, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <p className="text-xs font-bold text-slate-200">{item.q}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.opts.map((opt, optIdx) => {
                        const isSelected = expQuizAnswers[qIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (!expQuizSubmitted) {
                                setExpQuizAnswers({ ...expQuizAnswers, [qIdx]: optIdx });
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <span className="font-mono mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(expQuizAnswers).length < 5 || expQuizSubmitted}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-tealbrand-600 hover:from-emerald-500 hover:to-tealbrand-500 disabled:opacity-50 text-white font-black text-xs shadow-lg transition-all"
                  >
                    {expQuizSubmitted ? 'Kuis Selesai' : 'Kirim Jawaban Kuis'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODE 4: AR KAMERA MEJA NYATA                                */}
      {/* ============================================================== */}
      {viewMode === 'ar' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-400" />
              <div>
                <h4 className="font-extrabold text-sm text-white">Augmented Reality (AR) Kamera Meja</h4>
                <p className="text-xs text-slate-400">
                  Arahkan kamera laptop atau HP ke meja belajarmu untuk melihat bidang grafik DHP melayang di dunia nyata!
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[480px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {cameraError ? (
              <div className="p-6 text-center max-w-sm space-y-2">
                <Camera className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-xs font-bold text-rose-300">{cameraError}</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}

            {/* AR Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-slate-950/80 backdrop-blur border border-pink-500/50 p-3 rounded-2xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                    AR Status Tracking
                  </span>
                  <p className="font-bold text-white">Target Bidang Meja: Terkunci</p>
                  <p className="text-[11px] text-slate-300 font-mono">
                    DHP Vertices: {dhpVertices.length} Titik Pojok
                  </p>
                </div>

                {optimumVertex && (
                  <div className="bg-slate-950/80 backdrop-blur border border-emerald-500/50 p-3 rounded-2xl text-right text-xs">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Optimum Maksimum
                    </span>
                    <p className="font-bold text-white">Titik {optimumVertex.label}</p>
                    <p className="text-emerald-300 font-mono font-bold">
                      Z = {optimumVertex.zVal.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>

              {/* Center AR Crosshair */}
              <div className="self-center flex flex-col items-center gap-2">
                <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-cyan-400/70 flex items-center justify-center bg-cyan-500/5">
                  <div className="text-center space-y-1">
                    <Layers className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                    <p className="text-[11px] font-bold text-white">DHP 3D Spasial</p>
                    <p className="text-[9px] text-cyan-300">Kuadran Positif</p>
                  </div>
                </div>
              </div>

              <div className="self-center bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
                Posisikan meja datar di dalam kotak fokus
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODE 5: VR 360° PLANETARIUM GEOMETRI                        */}
      {/* ============================================================== */}
      {viewMode === 'vr' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Glasses className="w-4 h-4 text-purple-400" />
              <h3 className="font-extrabold text-sm text-white">
                VR 360° Laboratorium Antariksa Geometri
              </h3>
            </div>

            <button
              onClick={() => setIsVrSplitScreen(!isVrSplitScreen)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
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
            {/* Left Eye Canvas */}
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-purple-500/30 flex items-center justify-center">
              <canvas ref={canvas3DRef} className="w-full h-full block" />
              <div className="absolute top-3 left-3 bg-purple-950/80 border border-purple-700 text-purple-200 px-2 py-0.5 rounded text-[10px] font-mono">
                {isVrSplitScreen ? 'Mata Kiri (L)' : 'VR 360°'}
              </div>
            </div>

            {/* Right Eye (if split screen) */}
            {isVrSplitScreen && (
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-purple-500/30 flex items-center justify-center bg-slate-900/40">
                <div className="text-center space-y-2 pointer-events-none">
                  <Glasses className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-white">Mata Kanan (R) Stereoscopic</p>
                  <p className="text-[10px] text-purple-300">
                    Gunakan kacamata VR Cardboard untuk pengalaman imersif 3D sejati
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
