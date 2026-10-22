'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
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
  TrendingUp,
  Target,
  Zap,
  Info,
  Check,
  Eye,
  Beaker,
  Droplet,
  FlaskConical,
  Activity,
  Atom,
} from 'lucide-react';

Chart.register(...registerables);

export type ViewMode = '2d' | '3d' | 'experiments' | 'ar' | 'vr';
export type AcidType = 'hcl' | 'ch3cooh';

interface AcidBaseTitrationLabProps {
  onProgressUpdate?: (activityId?: string) => void;
}

// Particle for Molecular Animation
interface MoleculeParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'H+' | 'OH-' | 'H2O' | 'Na+' | 'Cl-' | 'CH3COO-';
  radius: number;
  color: string;
}

export function AcidBaseTitrationLab({ onProgressUpdate }: AcidBaseTitrationLabProps) {
  // Multiverse mode
  const [viewMode, setViewMode] = useState<ViewMode>('2d');

  // Titration parameters
  const [acidType, setAcidType] = useState<AcidType>('hcl');
  const [acidVolume, setAcidVolume] = useState<number>(25); // mL
  const [acidConcentration, setAcidConcentration] = useState<number>(0.1); // Molar (M)
  const [baseConcentration, setBaseConcentration] = useState<number>(0.1); // Molar (M) of NaOH
  const [buretVolumeAdded, setBuretVolumeAdded] = useState<number>(0); // mL NaOH added (0 - 50 mL)
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const [isStirrerActive, setIsStirrerActive] = useState<boolean>(true);
  const [showMolecularView, setShowMolecularView] = useState<boolean>(true);
  const [indicatorType] = useState<string>('PP (Fenolftalein)');

  // Audio Speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Chart.js instance ref
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Molecular Canvas ref
  const molecularCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<MoleculeParticle[]>([]);
  const molecularAnimFrameRef = useRef<number | null>(null);

  // 3D Three.js refs
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const dropMeshRef = useRef<THREE.Mesh | null>(null);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);

  // AR & Camera refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // VR Split-screen
  const [isVrSplitScreen, setIsVrSplitScreen] = useState<boolean>(false);

  // Experiments Tab
  const [activeExperiment, setActiveExperiment] = useState<number>(1);
  const [expQuizAnswers, setExpQuizAnswers] = useState<Record<number, number>>({});
  const [expQuizSubmitted, setExpQuizSubmitted] = useState<boolean>(false);
  const [expQuizScore, setExpQuizScore] = useState<number>(0);

  // -------------------------------------------------------------------------
  // 1. CHEMISTRY CALCULATIONS (pH, EQUIVALENCE, BUFFER, HYDROLYSIS)
  // -------------------------------------------------------------------------
  // Constant Ka for CH3COOH (Asam Asetat)
  const Ka_CH3COOH = 1.8e-5;
  const pKa_CH3COOH = 4.74;
  const Kw = 1e-14;

  // Equivalence volume Vb_eq = (Va * Ma) / Mb
  const equivalenceVolume = useMemo(() => {
    return (acidVolume * acidConcentration) / baseConcentration;
  }, [acidVolume, acidConcentration, baseConcentration]);

  // Function to calculate pH given any added base volume (mL)
  const calculatePH = useCallback(
    (vb: number, type: AcidType = acidType): number => {
      const va = acidVolume;
      const ma = acidConcentration;
      const mb = baseConcentration;
      const veq = (va * ma) / mb;
      const totalVolume = va + vb; // in mL

      if (type === 'hcl') {
        // STRONG ACID (HCl) + STRONG BASE (NaOH)
        if (vb <= 0) {
          // Pure HCl
          return -Math.log10(ma);
        } else if (vb < veq - 0.0001) {
          // Excess H+
          const molesHRem = (va * ma - vb * mb) / 1000;
          const concH = molesHRem / (totalVolume / 1000);
          return Math.max(0.5, Math.min(6.99, -Math.log10(concH)));
        } else if (Math.abs(vb - veq) <= 0.0001) {
          // Exact Equivalence point: pH = 7.00
          return 7.0;
        } else {
          // Excess OH-
          const molesOHExcess = (vb * mb - va * ma) / 1000;
          const concOH = molesOHExcess / (totalVolume / 1000);
          const pOH = -Math.log10(concOH);
          return Math.min(13.8, Math.max(7.01, 14.0 - pOH));
        }
      } else {
        // WEAK ACID (CH3COOH) + STRONG BASE (NaOH)
        if (vb <= 0) {
          // Pure weak acid: [H+] = sqrt(Ka * Ma)
          const concH = Math.sqrt(Ka_CH3COOH * ma);
          return -Math.log10(concH); // ~2.87 for 0.1 M
        } else if (vb < veq - 0.0001) {
          // Buffer Region: CH3COOH / CH3COO-
          // Using Henderson-Hasselbalch equation
          const molesAcidRem = (va * ma - vb * mb) / 1000;
          const molesSaltFormed = (vb * mb) / 1000;
          if (molesAcidRem <= 0) return 7.0;
          const ratio = molesSaltFormed / molesAcidRem;
          return Math.max(1.5, Math.min(8.5, pKa_CH3COOH + Math.log10(ratio)));
        } else if (Math.abs(vb - veq) <= 0.0001) {
          // Equivalence Point: Hydrolysis of CH3COO- (Basic salt)
          // [CH3COO-] = (va * ma) / totalVolume
          const concSalt = (va * ma) / totalVolume;
          const Kh = Kw / Ka_CH3COOH;
          const concOH = Math.sqrt(Kh * concSalt);
          const pOH = -Math.log10(concOH);
          return Math.min(9.5, 14.0 - pOH); // ~8.72 for 0.1 M
        } else {
          // Post-equivalence: Excess strong base NaOH dominates
          const molesOHExcess = (vb * mb - va * ma) / 1000;
          const concOH = molesOHExcess / (totalVolume / 1000);
          const pOH = -Math.log10(concOH);
          return Math.min(13.8, Math.max(8.8, 14.0 - pOH));
        }
      }
    },
    [acidVolume, acidConcentration, baseConcentration, acidType]
  );

  // Current real-time pH
  const currentPH = useMemo(() => {
    return calculatePH(buretVolumeAdded);
  }, [buretVolumeAdded, calculatePH]);

  // Equivalence pH
  const equivalencePH = useMemo(() => {
    return calculatePH(equivalenceVolume);
  }, [equivalenceVolume, calculatePH]);

  // Is at Equivalence point
  const isAtEquivalence = useMemo(() => {
    return Math.abs(buretVolumeAdded - equivalenceVolume) < 0.2;
  }, [buretVolumeAdded, equivalenceVolume]);

  // Solution Appearance (Erlenmeyer Color with Phenolphthalein Indicator)
  // PP transition: pH 8.2 - 10.0 (Clear -> Pink -> Vivid Pink / Fuchsia)
  const flaskColorInfo = useMemo(() => {
    if (currentPH < 8.2) {
      return {
        rgba: 'rgba(235, 248, 255, 0.35)',
        borderColor: '#94a3b8',
        name: 'Bening / Tidak Berwarna',
        description: 'Larutan asam (pH < 8.2) sehingga indikator PP tidak berwarna.',
        stage: 'Asam',
      };
    } else if (currentPH >= 8.2 && currentPH <= 10.0) {
      // Fraction of pink intensity: 0 to 1
      const fraction = (currentPH - 8.2) / (10.0 - 8.2);
      const alpha = 0.4 + fraction * 0.45;
      return {
        rgba: `rgba(244, 114, 182, ${alpha.toFixed(2)})`,
        borderColor: '#ec4899',
        name: fraction < 0.3 ? 'Merah Muda Pudar (Titik Akhir)' : 'Merah Muda Transisi',
        description: 'Mencapai trayek perubahan warna fenolftalein (pH 8.2 - 10.0).',
        stage: 'Titik Akhir Titrasi',
      };
    } else {
      return {
        rgba: 'rgba(236, 72, 153, 0.92)',
        borderColor: '#db2777',
        name: 'Merah Muda Pekat / Fuchsia',
        description: 'Larutan basa kuat berlebih (pH > 10.0), warna PP sangat pekat.',
        stage: 'Basa Berlebih',
      };
    }
  }, [currentPH]);

  // -------------------------------------------------------------------------
  // 2. BURET DRIP INTERVAL CONTROLS
  // -------------------------------------------------------------------------
  useEffect(() => {
    let timer: any = null;
    if (isDripping) {
      timer = setInterval(() => {
        setBuretVolumeAdded((prev) => {
          if (prev >= 50) {
            setIsDripping(false);
            return 50;
          }
          const next = Number((prev + 0.1).toFixed(1));
          return next;
        });
      }, 120);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDripping]);

  const handleAddVolume = (amt: number) => {
    setBuretVolumeAdded((prev) => {
      const next = Math.min(50, Math.max(0, Number((prev + amt).toFixed(1))));
      return next;
    });
  };

  const handleReset = () => {
    setIsDripping(false);
    setBuretVolumeAdded(0);
  };

  // Trigger celebration on equivalence
  const hasTriggeredConfetti = useRef<boolean>(false);
  useEffect(() => {
    if (isAtEquivalence && !hasTriggeredConfetti.current && buretVolumeAdded > 0) {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      hasTriggeredConfetti.current = true;
      if (onProgressUpdate) onProgressUpdate();
    }
    if (Math.abs(buretVolumeAdded - equivalenceVolume) >= 1) {
      hasTriggeredConfetti.current = false;
    }
  }, [isAtEquivalence, buretVolumeAdded, equivalenceVolume, onProgressUpdate]);

  // -------------------------------------------------------------------------
  // 3. CHART.JS REAL-TIME TITRATION CURVE
  // -------------------------------------------------------------------------
  // Generate theoretical points for the full curve (0 - 50 mL)
  const fullCurveData = useMemo(() => {
    const pointsHCl: { x: number; y: number }[] = [];
    const pointsCH3COOH: { x: number; y: number }[] = [];

    // Dense step near equivalence (24 to 26 mL)
    for (let v = 0; v <= 50; v = Number((v + (v >= 23.5 && v <= 26.5 ? 0.05 : 0.5)).toFixed(2))) {
      pointsHCl.push({ x: v, y: Number(calculatePH(v, 'hcl').toFixed(2)) });
      pointsCH3COOH.push({ x: v, y: Number(calculatePH(v, 'ch3cooh').toFixed(2)) });
    }
    return { pointsHCl, pointsCH3COOH };
  }, [calculatePH]);

  useEffect(() => {
    if (viewMode !== '2d' || !chartCanvasRef.current) return;

    const ctx = chartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const currentPoints = acidType === 'hcl' ? fullCurveData.pointsHCl : fullCurveData.pointsCH3COOH;

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          // 1. Full Theoretical Curve
          {
            label: acidType === 'hcl' ? 'Kurva Titrasi HCl + NaOH' : 'Kurva Titrasi CH3COOH + NaOH',
            data: currentPoints,
            borderColor: acidType === 'hcl' ? '#06b6d4' : '#f59e0b',
            borderWidth: 3,
            fill: false,
            pointRadius: 0,
            tension: 0.15,
          },
          // 2. Current Progress Marker
          {
            label: 'Titik Titrasi Saat Ini',
            data: [{ x: buretVolumeAdded, y: currentPH }],
            borderColor: '#ec4899',
            backgroundColor: '#f43f5e',
            pointRadius: 7,
            pointHoverRadius: 9,
            pointBorderWidth: 2,
            pointBorderColor: '#ffffff',
            showLine: false,
          },
          // 3. Equivalence Point Marker
          {
            label: `Titik Ekivalen (${equivalenceVolume} mL, pH ${equivalencePH.toFixed(2)})`,
            data: [{ x: equivalenceVolume, y: equivalencePH }],
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            pointRadius: 6,
            pointStyle: 'rectRot',
            showLine: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0, // Instant response for smooth slider and dripping
        },
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: 50,
            title: {
              display: true,
              text: 'Volume NaOH Ditambahkan (mL)',
              color: '#94a3b8',
              font: { weight: 'bold', size: 11 },
            },
            grid: {
              color: 'rgba(51, 65, 85, 0.4)',
            },
            ticks: {
              color: '#cbd5e1',
              stepSize: 5,
            },
          },
          y: {
            min: 0,
            max: 14,
            title: {
              display: true,
              text: 'Derajat Keasaman (pH)',
              color: '#94a3b8',
              font: { weight: 'bold', size: 11 },
            },
            grid: {
              color: 'rgba(51, 65, 85, 0.4)',
            },
            ticks: {
              color: '#cbd5e1',
              stepSize: 2,
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e2e8f0',
              font: { size: 11, weight: 'bold' },
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const p = context.raw as { x: number; y: number };
                return `Volume: ${p.x.toFixed(1)} mL | pH: ${p.y.toFixed(2)}`;
              },
            },
          },
        },
      },
    });

    chartInstanceRef.current = chartInstance;

    return () => {
      chartInstance.destroy();
      chartInstanceRef.current = null;
    };
  }, [viewMode, acidType, fullCurveData, buretVolumeAdded, currentPH, equivalenceVolume, equivalencePH]);

  // Update existing chart instance dynamically without full re-creation
  useEffect(() => {
    if (chartInstanceRef.current) {
      const chart = chartInstanceRef.current;
      // Update current progress marker
      chart.data.datasets[1].data = [{ x: buretVolumeAdded, y: currentPH }];
      chart.update('none');
    }
  }, [buretVolumeAdded, currentPH]);

  // -------------------------------------------------------------------------
  // 4. SUB-MICROSCOPIC MOLECULAR ANIMATION (H+ + OH- -> H2O)
  // -------------------------------------------------------------------------
  // Initialize and spawn particles based on titration state
  useEffect(() => {
    if (!molecularCanvasRef.current || viewMode !== '2d' || !showMolecularView) return;

    const canvas = molecularCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    const height = (canvas.height = 180);

    // Initial pool of particles
    const particles: MoleculeParticle[] = [];
    const hCount = Math.max(2, Math.round((1 - Math.min(1, buretVolumeAdded / equivalenceVolume)) * 16));
    const ohCount = buretVolumeAdded > equivalenceVolume ? Math.min(16, Math.round(((buretVolumeAdded - equivalenceVolume) / 10) * 8)) : 0;
    const h2oCount = Math.min(18, Math.round((Math.min(buretVolumeAdded, equivalenceVolume) / equivalenceVolume) * 16));

    // Spawn H+ (Red)
    for (let i = 0; i < hCount; i++) {
      particles.push({
        id: Math.random(),
        x: 20 + Math.random() * (width - 40),
        y: 20 + Math.random() * (height - 40),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: 'H+',
        radius: 6,
        color: '#ef4444',
      });
    }

    // Spawn OH- (Cyan)
    for (let i = 0; i < ohCount; i++) {
      particles.push({
        id: Math.random(),
        x: 20 + Math.random() * (width - 40),
        y: 20 + Math.random() * (height - 40),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: 'OH-',
        radius: 8,
        color: '#06b6d4',
      });
    }

    // Spawn H2O (Blue with O + 2H atoms)
    for (let i = 0; i < h2oCount; i++) {
      particles.push({
        id: Math.random(),
        x: 20 + Math.random() * (width - 40),
        y: 20 + Math.random() * (height - 40),
        vx: (Math.random() - 0.5) * 1.0,
        vy: (Math.random() - 0.5) * 1.0,
        type: 'H2O',
        radius: 9,
        color: '#3b82f6',
      });
    }

    particlesRef.current = particles;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Glass beaker background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      const parts = particlesRef.current;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundary
        if (p.x - p.radius < 5) {
          p.x = 5 + p.radius;
          p.vx *= -1;
        }
        if (p.x + p.radius > width - 5) {
          p.x = width - 5 - p.radius;
          p.vx *= -1;
        }
        if (p.y - p.radius < 5) {
          p.y = 5 + p.radius;
          p.vy *= -1;
        }
        if (p.y + p.radius > height - 5) {
          p.y = height - 5 - p.radius;
          p.vy *= -1;
        }

        // Draw particle based on type
        if (p.type === 'H+') {
          // Ion H+ (Red sphere with label)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 6;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H⁺', p.x, p.y);
          ctx.shadowBlur = 0;
        } else if (p.type === 'OH-') {
          // Ion OH- (Cyan sphere with label)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 6;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('OH⁻', p.x, p.y);
          ctx.shadowBlur = 0;
        } else if (p.type === 'H2O') {
          // H2O molecule (O center in blue + 2 H small white ears)
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();
          // Hydrogen ears
          ctx.beginPath();
          ctx.arc(p.x - 5, p.y - 4, 3, 0, Math.PI * 2);
          ctx.arc(p.x + 5, p.y - 4, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#e2e8f0';
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '7px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H₂O', p.x, p.y + 1);
        }

        // Check for collision between H+ and OH- to form H2O
        for (let j = i + 1; j < parts.length; j++) {
          const p2 = parts[j];
          if ((p.type === 'H+' && p2.type === 'OH-') || (p.type === 'OH-' && p2.type === 'H+')) {
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < p.radius + p2.radius + 3) {
              // Neutralization reaction: H+ + OH- -> H2O
              p.type = 'H2O';
              p.radius = 9;
              p.color = '#3b82f6';
              // Draw flash spark
              ctx.beginPath();
              ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(250, 204, 21, 0.6)';
              ctx.fill();
              // Remove the second particle
              parts.splice(j, 1);
              break;
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    molecularAnimFrameRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [viewMode, showMolecularView, buretVolumeAdded, equivalenceVolume]);

  // -------------------------------------------------------------------------
  // 5. 3D THREE.JS WEBGL LABORATORY (BURET, STAND & FLASK IN 3D)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if ((viewMode !== '3d' && viewMode !== 'vr') || !canvas3DRef.current) return;

    const canvas = canvas3DRef.current;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewMode === 'vr' ? 0x050816 : 0x0b1120);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 22);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(12, 22, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.2, 40);
    pointLight.position.set(-6, 8, 8);
    scene.add(pointLight);

    // 5. Main Lab Table Group
    const labGroup = new THREE.Group();
    scene.add(labGroup);

    // Laboratory Desk
    const deskGeo = new THREE.BoxGeometry(24, 0.6, 16);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.1 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, -0.3, 0);
    desk.receiveShadow = true;
    labGroup.add(desk);

    // Retort Stand Base (Iron Cast plate)
    const standBaseGeo = new THREE.BoxGeometry(4.5, 0.4, 7);
    const standBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const standBase = new THREE.Mesh(standBaseGeo, standBaseMat);
    standBase.position.set(-2.5, 0.2, 0);
    labGroup.add(standBase);

    // Iron Stand Rod (Vertical Pole)
    const standRodGeo = new THREE.CylinderGeometry(0.12, 0.12, 14, 16);
    const standRodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const standRod = new THREE.Mesh(standRodGeo, standRodMat);
    standRod.position.set(-2.5, 7.2, -2.5);
    labGroup.add(standRod);

    // Buret Clamp
    const clampArmGeo = new THREE.BoxGeometry(2.8, 0.2, 0.2);
    const clampArmMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const clampArm = new THREE.Mesh(clampArmGeo, clampArmMat);
    clampArm.position.set(-1.1, 8.5, -2.5);
    labGroup.add(clampArm);

    // Buret Glass Tube (Vertical Cylinder)
    const buretGeo = new THREE.CylinderGeometry(0.35, 0.35, 10, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    });
    const buret = new THREE.Mesh(buretGeo, glassMat);
    buret.position.set(0, 9.5, 0);
    labGroup.add(buret);

    // Buret Tip (Nozzle)
    const nozzleGeo = new THREE.ConeGeometry(0.35, 1.2, 32);
    const nozzle = new THREE.Mesh(nozzleGeo, glassMat);
    nozzle.rotation.x = Math.PI;
    nozzle.position.set(0, 4.0, 0);
    labGroup.add(nozzle);

    // Buret Stopcock valve (Keran)
    const stopcockGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16);
    const stopcockMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
    const stopcock = new THREE.Mesh(stopcockGeo, stopcockMat);
    stopcock.rotation.z = Math.PI / 2;
    stopcock.position.set(0, 4.6, 0);
    labGroup.add(stopcock);

    // Erlenmeyer Flask (Glass Cone + Neck)
    const flaskBodyGeo = new THREE.ConeGeometry(2.4, 3.2, 32);
    const flask = new THREE.Mesh(flaskBodyGeo, glassMat);
    flask.position.set(0, 1.6, 0);
    labGroup.add(flask);

    const flaskNeckGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 32);
    const flaskNeck = new THREE.Mesh(flaskNeckGeo, glassMat);
    flaskNeck.position.set(0, 3.8, 0);
    labGroup.add(flaskNeck);

    // Erlenmeyer Liquid Inside
    const liquidGeo = new THREE.ConeGeometry(2.1, 2.0, 32);
    // Parse color from flaskColorInfo
    const liquidColorHex = currentPH < 8.2 ? 0xe0f2fe : currentPH <= 10.0 ? 0xf472b6 : 0xec4899;
    const liquidMat = new THREE.MeshStandardMaterial({
      color: liquidColorHex,
      transparent: true,
      opacity: currentPH < 8.2 ? 0.35 : 0.85,
      roughness: 0.2,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.set(0, 1.2, 0);
    labGroup.add(liquidMesh);
    liquidMeshRef.current = liquidMesh;

    // Falling Drop
    const dropGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const dropMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    const dropMesh = new THREE.Mesh(dropGeo, dropMat);
    dropMesh.position.set(0, 3.2, 0);
    labGroup.add(dropMesh);
    dropMeshRef.current = dropMesh;

    // Orbit Controls Drag
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const rotationSpeed = 0.005;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !labGroup) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      labGroup.rotation.y += deltaX * rotationSpeed;
      labGroup.rotation.x += deltaY * rotationSpeed;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let dropY = 3.4;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isAutoRotate && !isDragging) {
        labGroup.rotation.y += 0.003;
      }

      // Animate falling drop if dripping
      if (isDripping && dropMesh) {
        dropY -= 0.12;
        if (dropY <= 2.2) dropY = 3.4;
        dropMesh.position.y = dropY;
        dropMesh.visible = true;
      } else if (dropMesh) {
        dropMesh.visible = false;
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
      renderer.dispose();
    };
  }, [viewMode, isAutoRotate, isWireframe, currentPH, isDripping]);

  // Update 3D liquid color dynamically
  useEffect(() => {
    if (liquidMeshRef.current) {
      const hex = currentPH < 8.2 ? 0xe0f2fe : currentPH <= 10.0 ? 0xf472b6 : 0xec4899;
      (liquidMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(hex);
      (liquidMeshRef.current.material as THREE.MeshStandardMaterial).opacity = currentPH < 8.2 ? 0.35 : 0.85;
    }
  }, [currentPH]);

  // Web Speech API Narration
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Peramban Anda belum mendukung audio Web Speech.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    let text = `Selamat datang di Laboratorium Virtual Titrasi Asam Basa SMA. `;
    text += `Saat ini Anda mentitrasi ${acidVolume} mililiter ${
      acidType === 'hcl' ? 'Asam Klorida HCl asam kuat' : 'Asam Asetat CH3COOH asam lemah'
    } berkonsentrasi ${acidConcentration} Molar, menggunakan penitrasi Natrium Hidroksida NaOH basa kuat berkonsentrasi ${baseConcentration} Molar. `;
    text += `Titik ekivalen tercapai saat mol ion H positif sama persis dengan mol ion OH negatif, yaitu pada penambahan ${equivalenceVolume.toFixed(
      1
    )} mililiter NaOH. `;
    text += `Volume NaOH saat ini adalah ${buretVolumeAdded.toFixed(1)} mililiter dengan derajat keasaman pH ${currentPH.toFixed(
      2
    )}. `;
    if (currentPH < 8.2) {
      text += `Larutan di dalam erlenmeyer masih bening tidak berwarna karena pH masih di bawah trayek fenolftalein. `;
    } else if (currentPH <= 10.0) {
      text += `Perhatikan labu erlenmeyer telah berubah warna menjadi merah muda pudar, menandakan titik akhir titrasi indikator fenolftalein telah tercapai! `;
    } else {
      text += `Warna larutan telah menjadi merah muda pekat karena kelebihan basa kuat NaOH. `;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;

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

  // Camera & AR handler
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
      console.warn('Camera error:', err);
      setCameraError('Izin kamera diperlukan untuk memproyeksikan alat titrasi di meja.');
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

  // Quiz evaluation
  const handleQuizSubmit = () => {
    // 5 Soal Titrasi
    // Q1: 1 (Titik ekivalen tercapai saat mol H+ = mol OH-)
    // Q2: 0 (HCl + NaOH titik ekivalen di pH 7.00)
    // Q3: 2 (CH3COOH + NaOH titik ekivalen di pH > 7 karena hidrolisis garam basa)
    // Q4: 1 (Trayek PP: pH 8.2 - 10.0, bening ke merah muda)
    // Q5: 0 (Rumus: Va * Ma * na = Vb * Mb * nb)
    const correctKeys = [1, 0, 2, 1, 0];
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
      {/* 1. HEADER & MULTIVERSE TABS                                     */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white uppercase tracking-wide">
              Kimia SMA / MA (Fase F - Stoikiometri Larutan)
            </span>
            <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" />
              Titrasi Asam Basa &amp; Kurva pH Real-Time
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Laboratorium Titrasi Asam Basa &amp; Simulasi Sub-Mikroskopik
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pelajari perubahan pH, visualisasi buret dan perubahan warna indikator PP di erlenmeyer, kurva titrasi Chart.js, serta reaksi ion H⁺ + OH⁻ &rarr; H₂O!
          </p>
        </div>

        {/* Multiverse Navigation Modes */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setViewMode('2d');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === '2d'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🎨 2D Edukasi</span>
          </button>

          <button
            onClick={() => {
              setViewMode('3d');
              handleStopCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
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
                ? 'bg-gradient-to-r from-emerald-600 to-tealbrand-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📱 AR Kamera</span>
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
      {/* 2. REAGENTS CONFIGURATION & ACID SELECTION BAR                 */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-pink-400" />
            Pilih Sampel Titrat Asam:
          </span>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setAcidType('hcl');
                handleReset();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all ${
                acidType === 'hcl'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>HCl (Asam Kuat)</span>
            </button>
            <button
              onClick={() => {
                setAcidType('ch3cooh');
                handleReset();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all ${
                acidType === 'ch3cooh'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>CH₃COOH (Asam Lemah)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Titran:</span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-700/60 text-blue-300 font-bold">
              NaOH {baseConcentration} M (Basa Kuat)
            </span>
          </div>
        </div>

        {/* Audio Speech Button */}
        <button
          onClick={handleToggleVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isSpeaking
              ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          <span>{isSpeaking ? 'Hentikan Suara' : '🔊 Penjelasan Guru'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. MODE 1: ANTARMUKA DUA KOLOM EDUKASI 2D                       */}
      {/* ============================================================== */}
      {viewMode === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* ============================================================ */}
          {/* KOLOM KIRI (5 Cols): VISUALISASI BURET & LABU ERLENMEYER       */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-pink-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Aparatus Titrasi Kimia
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-pink-300 font-bold">
                {indicatorType}
              </span>
            </div>

            {/* Buret & Erlenmeyer Stand Graphic */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-4 h-[440px] flex items-center justify-center overflow-hidden">
              {/* Statif Pole Background */}
              <div className="absolute left-[34%] top-4 bottom-14 w-1.5 bg-slate-700 rounded-full" />
              {/* Statif Base */}
              <div className="absolute left-[20%] bottom-10 w-28 h-3.5 bg-slate-800 border border-slate-700 rounded-md shadow-lg" />
              {/* Buret Clamp */}
              <div className="absolute left-[34%] top-[140px] w-12 h-2.5 bg-slate-600 rounded-sm" />

              {/* Buret Glass Tube (Skala 0 - 50 mL) */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Buret Top Funnel */}
                <div className="w-8 h-3 border-2 border-slate-400 border-b-0 rounded-t-sm bg-slate-800/40" />

                {/* Buret Cylinder Tube */}
                <div className="relative w-7 h-48 border-2 border-slate-400 bg-slate-900/60 backdrop-blur rounded-sm overflow-hidden flex flex-col justify-end">
                  {/* Fluid inside Buret (Decreases as volume is added) */}
                  <div
                    className="w-full bg-cyan-400/30 transition-all duration-200 border-t-2 border-cyan-300"
                    style={{ height: `${Math.max(2, ((50 - buretVolumeAdded) / 50) * 100)}%` }}
                  />

                  {/* Milliliter Tick Marks on Buret */}
                  <div className="absolute inset-0 flex flex-col justify-between py-1 px-0.5 pointer-events-none">
                    {[0, 10, 20, 30, 40, 50].map((tick) => (
                      <div key={tick} className="flex items-center justify-between w-full text-[8px] text-slate-400 font-mono">
                        <span className="w-1.5 h-0.5 bg-slate-400" />
                        <span>{tick}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buret Keran (Stopcock Valve) - Clickable */}
                <div className="relative my-1 flex items-center justify-center">
                  <div className="w-2.5 h-5 bg-slate-600 border border-slate-500 rounded-sm" />
                  <button
                    onClick={() => setIsDripping(!isDripping)}
                    className={`absolute -right-3.5 px-2 py-1 rounded-md text-[9px] font-black tracking-tight border transition-all shadow-md ${
                      isDripping
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 rotate-90'
                        : 'bg-rose-600 text-white border-rose-500 rotate-0'
                    }`}
                    title="Klik keran buret untuk membuka/menutup tetesan"
                  >
                    {isDripping ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Buret Tip Nozzle */}
                <div className="w-2 h-4 border-x border-b border-slate-400 bg-slate-800/60 rounded-b-sm" />

                {/* Animated Falling Droplet */}
                <div className="h-10 w-full flex items-center justify-center relative">
                  {isDripping && (
                    <div className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce shadow-md shadow-cyan-400/50" />
                  )}
                </div>

                {/* Labu Erlenmeyer Glass Flask */}
                <div className="relative flex flex-col items-center">
                  {/* Flask Neck */}
                  <div className="w-7 h-5 border-x-2 border-t-2 border-slate-400 bg-slate-900/40" />

                  {/* Flask Conical Body */}
                  <div
                    className="relative w-32 h-24 border-2 border-slate-400 rounded-b-2xl overflow-hidden flex flex-col justify-end transition-all duration-300 shadow-2xl"
                    style={{
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                    }}
                  >
                    {/* Liquid Solution with Gradual Color Change (PP Indicator) */}
                    <div
                      className="w-full transition-all duration-300 relative flex items-center justify-center"
                      style={{
                        height: `${Math.min(90, ((acidVolume + buretVolumeAdded) / 75) * 85)}%`,
                        backgroundColor: flaskColorInfo.rgba,
                      }}
                    >
                      {/* Magnetic Stirrer Bar Whirlpool */}
                      {isStirrerActive && (
                        <div className="w-6 h-1.5 bg-white/90 rounded-full animate-spin shadow" />
                      )}
                    </div>
                  </div>

                  {/* Digital pH Sensor Display on Flask */}
                  <div className="absolute -right-16 top-6 bg-slate-900/90 border border-slate-700 px-2.5 py-1.5 rounded-xl text-center shadow-lg backdrop-blur">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Sensor pH</span>
                    <span
                      className={`text-base font-black font-mono ${
                        currentPH < 7
                          ? 'text-cyan-400'
                          : isAtEquivalence
                          ? 'text-emerald-400 animate-pulse'
                          : 'text-pink-400'
                      }`}
                    >
                      {currentPH.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge inside visual container */}
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Warna Indikator PP:</span>
                <span className="font-bold text-sm block" style={{ color: flaskColorInfo.borderColor }}>
                  {flaskColorInfo.name}
                </span>
              </div>
            </div>

            {/* Buret Control Buttons & Step Adjusters */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Volume NaOH Ditambahkan:</span>
                <span className="font-mono text-cyan-300 text-sm font-black">
                  {buretVolumeAdded.toFixed(1)} / 50.0 mL
                </span>
              </div>

              {/* Range Slider for Manual Fast Drag */}
              <input
                type="range"
                min="0"
                max="50"
                step="0.1"
                value={buretVolumeAdded}
                onChange={(e) => setBuretVolumeAdded(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Drop by Drop Action Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
                <button
                  onClick={() => handleAddVolume(0.1)}
                  className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold transition-all"
                  title="Tambah 0.1 mL (1 tetes halus)"
                >
                  +0.1 mL
                </button>
                <button
                  onClick={() => handleAddVolume(0.5)}
                  className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold transition-all"
                  title="Tambah 0.5 mL"
                >
                  +0.5 mL
                </button>
                <button
                  onClick={() => handleAddVolume(1.0)}
                  className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold transition-all"
                  title="Tambah 1.0 mL"
                >
                  +1.0 mL
                </button>
                <button
                  onClick={() => setIsDripping(!isDripping)}
                  className={`py-1.5 rounded-xl font-black text-xs transition-all border ${
                    isDripping
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  }`}
                >
                  {isDripping ? 'Tutup Keran' : 'Buka Keran'}
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Isi Ulang Buret / Reset Titrasi</span>
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* KOLOM KANAN (7 Cols): CHART.JS KURVA & ANIMASI MOLEKUL         */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Real-time Chart.js Titration Curve */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-extrabold text-sm sm:text-base text-white">
                    Kurva Titrasi pH Real-Time (Chart.js)
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Titik Ekivalen:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold">
                    {equivalenceVolume.toFixed(1)} mL (pH {equivalencePH.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Chart.js Canvas */}
              <div className="h-64 sm:h-72 w-full relative bg-slate-950 rounded-2xl p-2 border border-slate-800">
                <canvas ref={chartCanvasRef} />
              </div>

              {/* Equivalence and Indicator Infobox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>Rumus Titik Ekivalen:</span>
                  </div>
                  <p className="font-mono text-slate-300 text-[11px]">
                    mol H⁺ = mol OH⁻ &hArr; Va &times; Ma = Vb &times; Mb
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Vb,eq = ({acidVolume} &times; {acidConcentration}) / {baseConcentration} ={' '}
                    <strong>{equivalenceVolume.toFixed(1)} mL</strong>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-pink-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Trayek Indikator PP:</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    pH 8.2 &minus; 10.0 (Bening &rarr; Merah Muda)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {acidType === 'hcl'
                      ? 'Lonjakan tajam pH 4 ke 10 langsung mendeteksi titik ekivalen.'
                      : 'Titik ekivalen di pH 8.72 (hidrolisis basa) sangat pas dengan trayek PP.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Sub-Microscopic Molecular Animation Box (H+ + OH- -> H2O) */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-extrabold text-sm text-white">
                    Animasi Tingkat Molekul (H⁺ + OH⁻ &rarr; H₂O)
                  </h4>
                </div>
                <button
                  onClick={() => setShowMolecularView(!showMolecularView)}
                  className="text-xs text-slate-400 hover:text-white font-bold"
                >
                  {showMolecularView ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>

              {showMolecularView && (
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                    <canvas ref={molecularCanvasRef} className="w-full h-full block" />

                    {/* Molecular Legend */}
                    <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-slate-200">Ion H⁺ (Asam)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        <span className="text-slate-200">Ion OH⁻ (Basa)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-slate-200">Molekul H₂O (Netral)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    💡 <strong>Mekanisme Reaksi:</strong> Saat ion OH⁻ (basa dari buret) bertabrakan dengan ion H⁺ (asam di erlenmeyer), keduanya bereaksi secara spontan membentuk molekul netral H₂O! Ketika seluruh ion H⁺ habis dinetralkan, penambahan OH⁻ berikutnya menyebabkan larutan menjadi basa dan merangsang perubahan warna indikator PP.
                  </p>
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
                Simulasi Meja Laboratorium Kimia 3D (Three.js)
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
                onClick={() => setIsDripping(!isDripping)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all border ${
                  isDripping
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-emerald-600 text-white border-emerald-500'
                }`}
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>{isDripping ? 'Tutup Keran' : 'Buka Keran Tetes'}</span>
              </button>
            </div>
          </div>

          <div className="relative h-[480px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            <canvas ref={canvas3DRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs space-y-1.5 backdrop-blur shadow-xl pointer-events-none">
              <div className="font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Status Larutan 3D:</span>
              </div>
              <div className="text-slate-300 text-[11px] font-mono">
                pH Larutan: <strong className="text-pink-300">{currentPH.toFixed(2)}</strong>
              </div>
              <div className="text-slate-300 text-[11px]">
                Warna Cairan: <strong style={{ color: flaskColorInfo.borderColor }}>{flaskColorInfo.name}</strong>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/80 px-3 py-1 rounded-xl text-[11px] text-slate-400 border border-slate-800">
              💡 Geser mouse / layar sentuh untuk memutar sudut pandang 360°
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODE 3: 🧪 5 MODUL EKSPERIMEN TITRASI KIMIA SMA              */}
      {/* ============================================================== */}
      {viewMode === 'experiments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Experiment Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 1, title: '1. Titrasi HCl + NaOH', icon: '⚡' },
              { id: 2, title: '2. Titrasi CH₃COOH', icon: '🧪' },
              { id: 3, title: '3. Titik Ekivalen & PP', icon: '🎯' },
              { id: 4, title: '4. Perbandingan Kurva', icon: '📈' },
              { id: 5, title: '5. Kuis Stoikiometri', icon: '🏆' },
            ].map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeExperiment === exp.id
                    ? 'bg-gradient-to-r from-pink-900/40 to-rose-900/40 border-pink-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="text-xl mb-1">{exp.icon}</div>
                <div className="text-xs font-bold leading-tight">{exp.title}</div>
              </button>
            ))}
          </div>

          {/* Eksperimen 1: Titrasi Asam Kuat (HCl) */}
          {activeExperiment === 1 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 1: Karakteristik Kurva Titrasi Asam Kuat (HCl) dengan Basa Kuat (NaOH)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Memahami lonjakan drastis pH di sekitar titik ekivalen netral (pH = 7.00).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-cyan-400">Reaksi Kimia:</h5>
                  <p className="font-mono text-slate-200">
                    HCl(aq) + NaOH(aq) &rarr; NaCl(aq) + H₂O(l)
                  </p>
                  <p className="text-slate-300 mt-2">
                    Ion H⁺ dan ion OH⁻ bereaksi membentuk molekul air H₂O. Garam NaCl yang terbentuk berasal dari asam kuat dan basa kuat sehingga tidak mengalami hidrolisis (pH netral = 7.00).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-pink-400">Karakteristik Kurva:</h5>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>pH awal sangat rendah (pH &approx; 1.00 untuk 0.1 M HCl).</li>
                    <li>Kenaikan pH sangat lambat pada penambahan 0 - 24 mL.</li>
                    <li>Lonjakan vertikal tajam dari pH 4 hingga pH 10 pada volume 24.9 - 25.1 mL.</li>
                    <li>Titik ekivalen tepat di pH 7.00.</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setAcidType('hcl');
                  setViewMode('2d');
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <span>Uji Titrasi HCl di Antarmuka 2D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Eksperimen 2: Titrasi Asam Lemah (CH3COOH) */}
          {activeExperiment === 2 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">🧪</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 2: Titrasi Asam Lemah (CH₃COOH) &amp; Daerah Buffer
                  </h4>
                  <p className="text-xs text-slate-400">
                    Menganalisis daerah penyangga (buffer) dan titik ekivalen basa (pH &gt; 7) akibat hidrolisis.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed">
                <p className="text-slate-300 font-mono text-amber-300 font-bold">
                  CH₃COOH(aq) + NaOH(aq) &rarr; CH₃COONa(aq) + H₂O(l)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 space-y-1">
                    <p className="font-bold text-white">1. Daerah Buffer (Penyangga):</p>
                    <p className="text-slate-400">
                      Sebelum titik ekivalen, terdapat campuran CH₃COOH sisa dan ion CH₃COO⁻ yang terbentuk, membentuk larutan penyangga asam.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 space-y-1">
                    <p className="font-bold text-white">2. Titik Ekivalen Basa (pH &approx; 8.72):</p>
                    <p className="text-slate-400">
                      Garam CH₃COONa terhidrolisis parsial menghasilkan ion OH⁻, sehingga larutan bersifat basa pada titik ekivalen!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 3: Deteksi Titik Ekivalen & Indikator PP */}
          {activeExperiment === 3 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 3: Titik Ekivalen vs Titik Akhir Titrasi Indikator Fenolftalein (PP)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Memahami mengapa indikator PP sangat cocok untuk titrasi asam-basa.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 leading-relaxed">
                <p className="text-slate-300">
                  <strong>Titik Ekivalen</strong> adalah titik teoritis ketika mol H⁺ tepat habis bereaksi dengan mol OH⁻.
                </p>
                <p className="text-slate-300">
                  <strong>Titik Akhir Titrasi</strong> adalah titik praktis saat indikator berubah warna secara permanen. Karena trayek fenolftalein berada pada rentang <strong>pH 8.2 &minus; 10.0</strong>, perubahan warna dari bening ke merah muda pudar menandakan titrasi harus segera dihentikan!
                </p>
              </div>
            </div>
          )}

          {/* Eksperimen 4: Perbandingan Kurva Titrasi */}
          {activeExperiment === 4 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">📈</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 4: Perbandingan Kurva HCl vs CH₃COOH
                  </h4>
                  <p className="text-xs text-slate-400">
                    Membandingkan bentuk kurva titrasi asam kuat dan asam lemah secara langsung.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 space-y-2">
                  <p className="text-cyan-300 font-bold">HCl + NaOH</p>
                  <p className="text-slate-300">&bull; pH awal: 1.00</p>
                  <p className="text-slate-300">&bull; Tidak ada daerah buffer</p>
                  <p className="text-slate-300">&bull; Titik ekivalen: pH 7.00</p>
                  <p className="text-slate-300">&bull; Lonjakan pH: Sangat tajam</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 space-y-2">
                  <p className="text-amber-300 font-bold">CH₃COOH + NaOH</p>
                  <p className="text-slate-300">&bull; pH awal: 2.87</p>
                  <p className="text-slate-300">&bull; Memiliki daerah buffer</p>
                  <p className="text-slate-300">&bull; Titik ekivalen: pH 8.72</p>
                  <p className="text-slate-300">&bull; Lonjakan pH: Lebih landai</p>
                </div>
              </div>
            </div>
          )}

          {/* Eksperimen 5: Kuis Stoikiometri Titrasi */}
          {activeExperiment === 5 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h4 className="font-extrabold text-base text-white">
                      Eksperimen 5: Kuis Stoikiometri &amp; Titrasi Asam Basa SMA
                    </h4>
                    <p className="text-xs text-slate-400">
                      Uji kompetensi perhitungan titrasi dan kurva pH titrasi asam-basa.
                    </p>
                  </div>
                </div>
                {expQuizSubmitted && (
                  <span className="px-3 py-1 rounded-xl bg-pink-500/20 border border-pink-500 text-pink-300 font-mono font-bold text-xs">
                    Skor: {expQuizScore} / 100
                  </span>
                )}
              </div>

              {/* 5 Questions */}
              <div className="space-y-4">
                {[
                  {
                    q: '1. Titik ekivalen pada titrasi asam basa tercapai pada saat keadaan...',
                    opts: [
                      'Volume asam tepat sama dengan volume basa',
                      'Mol ion H+ tepat sama dengan mol ion OH-',
                      'Massa asam tepat sama dengan massa basa',
                      'Indikator berubah warna menjadi merah pekat',
                    ],
                  },
                  {
                    q: '2. Pada titrasi 25 mL HCl 0.1 M dengan larutan NaOH 0.1 M, berapakah nilai pH tepat pada titik ekivalen?',
                    opts: ['pH = 7.00', 'pH = 8.72', 'pH = 1.00', 'pH = 14.00'],
                  },
                  {
                    q: '3. Mengapa titik ekivalen pada titrasi asam lemah CH3COOH dengan basa kuat NaOH bernilai pH > 7 (sekitar pH 8.7)?',
                    opts: [
                      'Karena asam asetat menguap selama titrasi',
                      'Karena NaOH yang digunakan terlalu encer',
                      'Karena garam CH3COONa mengalami hidrolisis parsial menghasilkan ion OH-',
                      'Karena tidak ditambahkan indikator PP',
                    ],
                  },
                  {
                    q: '4. Indikator fenolftalein (PP) mengalami perubahan warna pada rentang trayek pH...',
                    opts: ['pH 1.2 - 2.8', 'pH 8.2 - 10.0', 'pH 4.2 - 6.3', 'pH 6.0 - 7.6'],
                  },
                  {
                    q: '5. Sebanyak 20 mL larutan HCl dititrasi dengan larutan NaOH 0.1 M. Jika titik ekivalen tercapai saat volume NaOH adalah 25 mL, berapakah konsentrasi HCl tersebut?',
                    opts: ['0.125 M', '0.100 M', '0.080 M', '0.200 M'],
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
                                ? 'bg-pink-500/20 border-pink-400 text-pink-200 font-bold'
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-xs shadow-lg transition-all"
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
      {/* 6. MODE 4: AR KAMERA MEJA                                      */}
      {/* ============================================================== */}
      {viewMode === 'ar' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-extrabold text-sm text-white">Augmented Reality (AR) Kamera Meja</h4>
                <p className="text-xs text-slate-400">
                  Proyeksikan buret kaca dan labu erlenmeyer titrasi di atas meja belajarmu secara real-time!
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
                <div className="bg-slate-950/80 backdrop-blur border border-emerald-500/50 p-3 rounded-2xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    AR Chemical Sensor
                  </span>
                  <p className="font-bold text-white">pH Real-Time: {currentPH.toFixed(2)}</p>
                  <p className="text-[11px] text-slate-300 font-mono">
                    Volume Titran: {buretVolumeAdded.toFixed(1)} mL
                  </p>
                </div>

                <div className="bg-slate-950/80 backdrop-blur border border-pink-500/50 p-3 rounded-2xl text-right text-xs">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                    Indikator Fenolftalein
                  </span>
                  <p className="font-bold text-white" style={{ color: flaskColorInfo.borderColor }}>
                    {flaskColorInfo.name}
                  </p>
                </div>
              </div>

              <div className="self-center bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
                Posisikan meja datar untuk memproyeksikan alat titrasi
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODE 5: VR 360° LABORATORIUM KIMIA                          */}
      {/* ============================================================== */}
      {viewMode === 'vr' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Glasses className="w-4 h-4 text-purple-400" />
              <h3 className="font-extrabold text-sm text-white">
                VR 360° Laboratorium Kimia Analitik
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
