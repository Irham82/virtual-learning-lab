'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ArrowDown,
  Layers,
  Box,
  Sliders,
  Plus,
  Minus,
  Shuffle,
  Calculator,
  Compass,
  Zap,
  Info,
  Check,
} from 'lucide-react';

type ViewMode = '2d' | '3d' | 'experiments' | 'ar' | 'vr';
type OperationType = 'add' | 'subtract';

interface SDMathAddSubLabProps {
  onProgressUpdate?: (activityId?: string) => void;
}

export function SDMathAdditionSubtractionLab({ onProgressUpdate }: SDMathAddSubLabProps) {
  // Modes & Operation
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [operation, setOperation] = useState<OperationType>('add');

  // Operands
  const [numA, setNumA] = useState<number>(8);
  const [numB, setNumB] = useState<number>(5);

  // Regrouping & Place Value Interactive Student Inputs
  const [inputCarry, setInputCarry] = useState<string>('');
  const [inputTens, setInputTens] = useState<string>('');
  const [inputOnes, setInputOnes] = useState<string>('');
  const [checkResult, setCheckResult] = useState<{
    status: 'idle' | 'correct' | 'incorrect';
    message: string;
  }>({ status: 'idle', message: '' });

  // 3D Canvas Refs
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const blockGroupRef = useRef<THREE.Group | null>(null);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);

  // Audio / Speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Camera & AR
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // VR
  const [isVrSplitScreen, setIsVrSplitScreen] = useState<boolean>(false);

  // Experiments
  const [activeExperiment, setActiveExperiment] = useState<number>(1);
  const [expPlaceValueNum, setExpPlaceValueNum] = useState<number>(27);
  const [expFrogStart, setExpFrogStart] = useState<number>(8);
  const [expFrogJump, setExpFrogJump] = useState<number>(6);
  const [expFrogOp, setExpFrogOp] = useState<'+' | '-'>('+');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Decompose numbers into Tens and Ones
  const tensA = Math.floor(numA / 10);
  const onesA = numA % 10;
  const tensB = Math.floor(numB / 10);
  const onesB = numB % 10;

  // Addition calculations
  const onesSum = onesA + onesB;
  const hasCarry = onesSum > 9;
  const actualCarry = hasCarry ? 1 : 0;
  const expectedOnes = operation === 'add' ? onesSum % 10 : (onesA < onesB ? onesA + 10 - onesB : onesA - onesB);
  const hasBorrow = operation === 'subtract' && onesA < onesB;
  const expectedTens = operation === 'add'
    ? tensA + tensB + actualCarry
    : (tensA - (hasBorrow ? 1 : 0)) - tensB;
  const totalResult = operation === 'add' ? numA + numB : numA - numB;

  // Clear inputs when operands change
  useEffect(() => {
    setInputCarry('');
    setInputTens('');
    setInputOnes('');
    setCheckResult({ status: 'idle', message: '' });
  }, [numA, numB, operation]);

  // Handle Speech Narration
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

    let text = '';
    if (operation === 'add') {
      if (hasCarry) {
        text = `Halo adik-adik hebat! Mari kita jumlahkan ${numA} ditambah ${numB}. Perhatikan kolom satuan: ${onesA} ditambah ${onesB} hasilnya adalah ${onesSum}. Wah, ${onesSum} lebih besar dari 9! Sepuluh kubus satuan bergabung menjadi satu batang puluhan. Kita simpan angka 1 di kotak atas kolom puluhan, dan tulis angka ${expectedOnes} di kolom satuan. Lalu di kolom puluhan, kita jumlahkan ${tensA} ditambah ${tensB} ditambah simpanan 1, hasilnya ${expectedTens}. Jadi, ${numA} ditambah ${numB} sama dengan ${totalResult}!`;
      } else {
        text = `Halo juara! Mari kita jumlahkan ${numA} ditambah ${numB}. Di kolom satuan, ${onesA} ditambah ${onesB} hasilnya ${expectedOnes}. Karena tidak lebih dari 9, kita tidak perlu menyimpan. Di kolom puluhan, ${tensA} ditambah ${tensB} hasilnya ${expectedTens}. Total hasilnya adalah ${totalResult}!`;
      }
    } else {
      if (hasBorrow) {
        text = `Mari kita kurangkan ${numA} dikurangi ${numB}. Di kolom satuan, ${onesA} tidak cukup dikurangi ${onesB}. Jangan khawatir! Kita pinjam satu puluhan dari kolom puluhan. Satu puluhan dipecah menjadi sepuluh satuan, sehingga satuan menjadi ${onesA + 10}. Sekarang ${onesA + 10} dikurangi ${onesB} adalah ${expectedOnes}. Puluhan berkurang satu menjadi ${tensA - 1}. Hasil akhirnya adalah ${totalResult}!`;
      } else {
        text = `Mari kita kurangkan ${numA} dikurangi ${numB}. Di kolom satuan, ${onesA} dikurangi ${onesB} sama dengan ${expectedOnes}. Di kolom puluhan, ${tensA} dikurangi ${tensB} sama dengan ${expectedTens}. Hasil akhirnya adalah ${totalResult}!`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick Random Number Generator
  const handleRandomize = () => {
    if (operation === 'add') {
      // Generate numbers that often trigger carry (> 9)
      const a = Math.floor(Math.random() * 35) + 6; // 6 to 40
      const b = Math.floor(Math.random() * 25) + 5; // 5 to 30
      setNumA(a);
      setNumB(b);
    } else {
      // Subtraction: ensure A >= B
      const a = Math.floor(Math.random() * 40) + 12; // 12 to 52
      const b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
      setNumA(a);
      setNumB(b);
    }
  };

  // Check student calculation
  const handleCheckAnswer = () => {
    const tensVal = parseInt(inputTens, 10);
    const onesVal = parseInt(inputOnes, 10);
    const carryVal = inputCarry === '' ? 0 : parseInt(inputCarry, 10);

    const isTensCorrect = isNaN(tensVal) ? expectedTens === 0 : tensVal === expectedTens;
    const isOnesCorrect = onesVal === expectedOnes;
    const isCarryCorrect = hasCarry ? carryVal === 1 : (inputCarry === '' || carryVal === 0);

    if (isOnesCorrect && isTensCorrect && isCarryCorrect) {
      setCheckResult({
        status: 'correct',
        message: `Horeee! Jawabanmu 100% Benar! ${numA} ${operation === 'add' ? '+' : '-'} ${numB} = ${totalResult}`,
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      if (onProgressUpdate) onProgressUpdate();
    } else {
      let hint = 'Coba periksa lagi ';
      if (!isOnesCorrect) hint += 'kolom satuannya. ';
      if (hasCarry && !isCarryCorrect) hint += 'Jangan lupa masukkan simpanan 1 di kotak atas puluhan! ';
      if (!isTensCorrect) hint += 'kolom puluhannya. ';
      setCheckResult({ status: 'incorrect', message: hint });
    }
  };

  // Auto-fill solution
  const handleFillSolution = () => {
    if (hasCarry) setInputCarry('1');
    else setInputCarry('');
    setInputTens(expectedTens.toString());
    setInputOnes(expectedOnes.toString());
    setCheckResult({
      status: 'correct',
      message: `Kunci Jawaban Terbuka: ${numA} ${operation === 'add' ? '+' : '-'} ${numB} = ${totalResult}`,
    });
  };

  // =========================================================================
  // 3D THREE.JS WEBGL RENDERER (BASE-10 DIENES BLOCKS SPATIAL WORLD)
  // =========================================================================
  useEffect(() => {
    if ((viewMode !== '3d' && viewMode !== 'vr') || !canvas3DRef.current) return;

    const canvas = canvas3DRef.current;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewMode === 'vr' ? 0x050816 : 0x070b19);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 7, 13);
    camera.lookAt(0, 1, 0);
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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 14, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 1.5, 25);
    blueLight.position.set(-6, 6, 4);
    scene.add(blueLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 1.5, 25);
    amberLight.position.set(6, 6, 4);
    scene.add(amberLight);

    // 5. Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // 6. Build Base-10 3D Dienes Blocks
    const mainGroup = new THREE.Group();
    blockGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // Materials
    const tensMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: isWireframe,
    });
    const onesMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: isWireframe,
    });
    const carryMaterial = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.1,
      wireframe: isWireframe,
    });

    const cubeSize = 0.55;
    const gap = 0.08;

    // Helper: Create a 3D Unit Cube (Satuan)
    const createUnitCube = (x: number, y: number, z: number, mat = onesMaterial) => {
      const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y + cubeSize / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Create a 3D Tens Rod (Batang Puluhan: 10 cubes connected)
    const createTensRod = (x: number, y: number, z: number, mat = tensMaterial) => {
      const rodGroup = new THREE.Group();
      rodGroup.position.set(x, y, z);
      for (let i = 0; i < 10; i++) {
        const c = createUnitCube(0, i * (cubeSize + 0.02), 0, mat);
        rodGroup.add(c);
      }
      return rodGroup;
    };

    // Build Layout:
    // Left Zone (X < 0): Puluhan Platform (Cyan)
    // Right Zone (X > 0): Satuan Platform (Amber)
    const tensCenterX = -3.2;
    const onesCenterX = 3.2;

    // Row 1 (Operand A): Z = -2.5
    // Tens A
    for (let i = 0; i < tensA; i++) {
      const rod = createTensRod(tensCenterX + (i - (tensA - 1) / 2) * 1.0, 0, -2.5, tensMaterial);
      mainGroup.add(rod);
    }
    // Ones A
    for (let i = 0; i < onesA; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const cube = createUnitCube(
        onesCenterX + (col - 2) * (cubeSize + gap),
        row * (cubeSize + gap),
        -2.5,
        onesMaterial
      );
      mainGroup.add(cube);
    }

    // Row 2 (Operand B): Z = 1.5
    // Tens B
    for (let i = 0; i < tensB; i++) {
      const rod = createTensRod(tensCenterX + (i - (tensB - 1) / 2) * 1.0, 0, 1.5, tensMaterial);
      mainGroup.add(rod);
    }
    // Ones B
    for (let i = 0; i < onesB; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const cube = createUnitCube(
        onesCenterX + (col - 2) * (cubeSize + gap),
        row * (cubeSize + gap),
        1.5,
        onesMaterial
      );
      mainGroup.add(cube);
    }

    // If Addition has carry: Render a Floating Golden/Pink Carry Cube/Rod above Tens column
    if (operation === 'add' && hasCarry) {
      const carryRod = createTensRod(tensCenterX, 6.2, -0.5, carryMaterial);
      carryRod.name = 'carry_indicator';
      mainGroup.add(carryRod);
    }

    // Divider Line between Tens and Ones
    const dividerGeo = new THREE.BoxGeometry(0.08, 0.2, 10);
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const divider = new THREE.Mesh(dividerGeo, dividerMat);
    divider.position.set(0, 0, 0);
    mainGroup.add(divider);

    // Orbit Drag Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const rotationSpeed = 0.005;

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

    // Touch support for tablets/phones
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

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isAutoRotate && !isDragging && mainGroup) {
        mainGroup.rotation.y += 0.004;
      }

      // Gentle pulsating bounce for carry indicator
      const carryObj = mainGroup.getObjectByName('carry_indicator');
      if (carryObj) {
        carryObj.position.y = 6.2 + Math.sin(Date.now() * 0.005) * 0.25;
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
  }, [viewMode, numA, numB, operation, isWireframe, isAutoRotate]);

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
      setCameraError('Izin akses kamera diperlukan untuk menampilkan balok hitung di meja belajarmu.');
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
    const correctKeys = [1, 0, 2, 1, 0]; // 5 Questions
    let score = 0;
    correctKeys.forEach((key, idx) => {
      if (quizAnswers[idx] === key) score += 20;
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
      {/* 1. HEADER & MULTIVERSE NAVIGATION TABS                          */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              Matematika SD Kelas 1 &amp; 2 (Fase A)
            </span>
            <span className="text-xs text-tealbrand-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Nilai Tempat, Penjumlahan &amp; Pengurangan
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Petualangan Berhitung Balok Nilai Tempat (2D, 3D, AR &amp; VR)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pelajari konsep penjumlahan menyimpan (&gt;9) dan pengurangan meminjam melalui Balok Dienes Satuan &amp; Puluhan secara konkret!
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
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📱 Mode AR</span>
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
            <span>🥽 Mode VR 360°</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. OPERAND CONTROLS BAR (INPUT BILANGAN CACAH)                  */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Operation Selector (+ / -) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Operasi:</span>
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => {
                setOperation('add');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all ${
                operation === 'add'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Penjumlahan (+)</span>
            </button>
            <button
              onClick={() => {
                setOperation('subtract');
                if (numA < numB) {
                  setNumA(numB);
                  setNumB(numA);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all ${
                operation === 'subtract'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Pengurangan (−)</span>
            </button>
          </div>
        </div>

        {/* Inputs for Num A and Num B */}
        <div className="flex items-center gap-3">
          {/* Bilangan Pertama */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Angka 1:</label>
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 px-2 py-1">
              <button
                onClick={() => setNumA(Math.max(1, numA - 1))}
                className="text-slate-400 hover:text-white p-0.5 text-xs font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={numA}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                  setNumA(val);
                  if (operation === 'subtract' && val < numB) setNumB(val);
                }}
                className="w-12 text-center bg-transparent font-mono font-bold text-amber-400 text-sm focus:outline-none"
              />
              <button
                onClick={() => setNumA(Math.min(99, numA + 1))}
                className="text-slate-400 hover:text-white p-0.5 text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          <span className="text-sm font-black text-slate-500">
            {operation === 'add' ? '+' : '−'}
          </span>

          {/* Bilangan Kedua */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Angka 2:</label>
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 px-2 py-1">
              <button
                onClick={() => setNumB(Math.max(1, numB - 1))}
                className="text-slate-400 hover:text-white p-0.5 text-xs font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={operation === 'subtract' ? numA : 99}
                value={numB}
                onChange={(e) => {
                  const maxLimit = operation === 'subtract' ? numA : 99;
                  const val = Math.max(1, Math.min(maxLimit, parseInt(e.target.value) || 1));
                  setNumB(val);
                }}
                className="w-12 text-center bg-transparent font-mono font-bold text-tealbrand-400 text-sm focus:outline-none"
              />
              <button
                onClick={() => {
                  const maxLimit = operation === 'subtract' ? numA : 99;
                  setNumB(Math.min(maxLimit, numB + 1));
                }}
                className="text-slate-400 hover:text-white p-0.5 text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Randomizer Button */}
          <button
            onClick={handleRandomize}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-all border border-slate-700"
            title="Acak Soal"
          >
            <Shuffle className="w-4 h-4" />
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
          {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-tealbrand-400" />}
          <span>{isSpeaking ? 'Hentikan Suara' : '🔊 Suara Penjelasan Guru'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. MODE 1: 2D EDUKASI INTERAKTIF (PAPAN NILAI TEMPAT)          */}
      {/* ============================================================== */}
      {viewMode === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Left Column (7 cols): Papan Bersusun & Kolom Nilai Tempat */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Papan Hitung Bersusun Nilai Tempat
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                {operation === 'add' ? 'Penjumlahan (+)' : 'Pengurangan (−)'}
              </span>
            </div>

            {/* Alert banner if addition > 9 (requires Carry) */}
            {operation === 'add' && hasCarry && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-amber-300">
                    ⚡ Perhatian: Penjumlahan Satuan Lebih Dari 9! ({onesA} + {onesB} = {onesSum})
                  </p>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    10 kubus satuan bergabung menjadi <strong>1 Puluhan</strong>. Kolom simpan di atas puluhan menyala! Masukkan angka <strong>1</strong> di kotak simpan atas puluhan.
                  </p>
                </div>
              </div>
            )}

            {/* Alert banner if subtraction requires borrow */}
            {operation === 'subtract' && hasBorrow && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-rose-300">
                    💡 Perhatian: Satuan Tidak Cukup! ({onesA} &lt; {onesB})
                  </p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5">
                    Pinjam 1 puluhan dari kolom puluhan (bernilai 10 satuan), sehingga satuan menjadi {onesA + 10}.
                  </p>
                </div>
              </div>
            )}

            {/* Papan Bersusun Tabel Interaktif */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col items-center">
              {/* Header Columns */}
              <div className="grid grid-cols-2 gap-8 w-64 text-center font-bold text-xs uppercase tracking-wider pb-2 border-b-2 border-slate-700">
                <div className="text-cyan-400 flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <span>Puluhan (10)</span>
                </div>
                <div className="text-amber-400 flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>Satuan (1)</span>
                </div>
              </div>

              {/* Carry Row (Kotak Simpan di atas puluhan saat > 9) */}
              <div className="grid grid-cols-2 gap-8 w-64 text-center py-2 items-center">
                <div className="flex justify-center">
                  {operation === 'add' && hasCarry ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-pink-400 font-bold">Simpan:</span>
                      <input
                        type="text"
                        maxLength={1}
                        placeholder="1"
                        value={inputCarry}
                        onChange={(e) => setInputCarry(e.target.value)}
                        className="w-8 h-8 rounded-xl bg-pink-500/20 border-2 border-pink-500 text-pink-300 font-mono font-bold text-center text-sm shadow-lg shadow-pink-500/30 animate-bounce focus:outline-none focus:ring-2 focus:ring-pink-400"
                        title="Kotak Simpan 1 Puluhan"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-700 font-mono">-</span>
                  )}
                </div>
                <div></div>
              </div>

              {/* Operand A Row */}
              <div className="grid grid-cols-2 gap-8 w-64 text-center py-1.5 font-mono text-2xl font-black">
                <span className="text-cyan-300">{tensA > 0 ? tensA : ''}</span>
                <span className="text-amber-300">{onesA}</span>
              </div>

              {/* Operand B Row with Sign */}
              <div className="relative grid grid-cols-2 gap-8 w-64 text-center py-1.5 font-mono text-2xl font-black">
                <span className="absolute -left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                  {operation === 'add' ? '+' : '−'}
                </span>
                <span className="text-cyan-300">{tensB > 0 ? tensB : ''}</span>
                <span className="text-amber-300">{onesB}</span>
              </div>

              {/* Calculation Line */}
              <div className="w-64 border-b-4 border-slate-600 my-2"></div>

              {/* Student Input / Result Row */}
              <div className="grid grid-cols-2 gap-8 w-64 text-center pt-2">
                {/* Input Puluhan */}
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    value={inputTens}
                    onChange={(e) => setInputTens(e.target.value)}
                    placeholder="?"
                    className="w-14 h-12 rounded-2xl bg-slate-900 border-2 border-cyan-500/60 text-cyan-300 font-mono font-black text-xl text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-md"
                  />
                  <span className="text-[10px] text-cyan-400 font-bold mt-1">Puluhan</span>
                </div>

                {/* Input Satuan */}
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    value={inputOnes}
                    onChange={(e) => setInputOnes(e.target.value)}
                    placeholder="?"
                    className="w-14 h-12 rounded-2xl bg-slate-900 border-2 border-amber-500/60 text-amber-300 font-mono font-black text-xl text-center focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
                  />
                  <span className="text-[10px] text-amber-400 font-bold mt-1">Satuan</span>
                </div>
              </div>

              {/* Check Answer Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCheckAnswer}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-tealbrand-600 hover:from-emerald-500 hover:to-tealbrand-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Periksa Jawaban</span>
                </button>

                <button
                  onClick={handleFillSolution}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
                >
                  Buka Kunci
                </button>
              </div>

              {/* Feedback Message */}
              {checkResult.status !== 'idle' && (
                <div
                  className={`mt-4 p-3 rounded-2xl border text-xs flex items-center gap-2 max-w-sm text-center ${
                    checkResult.status === 'correct'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                  }`}
                >
                  {checkResult.status === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{checkResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Visualisasi Balok Dienes & Rumah Satuan */}
          <div className="lg:col-span-5 space-y-4">
            {/* Balok Dienes Container */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <span>Visualisasi Balok Dienes Konkret</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">1 Batang = 10 Kubus</span>
              </div>

              {/* Visual Balok A */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-300">Bilangan Pertama: {numA}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {tensA} Puluhan, {onesA} Satuan
                  </span>
                </div>
                <div className="flex items-center gap-3 min-h-[48px] overflow-x-auto py-1">
                  {/* Batang Puluhan A */}
                  <div className="flex gap-1.5 shrink-0">
                    {Array.from({ length: tensA }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-12 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm border border-cyan-200 flex flex-col justify-between py-0.5"
                        title="1 Batang Puluhan (10)"
                      >
                        {Array.from({ length: 9 }).map((_, j) => (
                          <div key={j} className="h-px bg-cyan-700/60 w-full" />
                        ))}
                      </div>
                    ))}
                    {tensA === 0 && <span className="text-[11px] text-slate-600">0 Puluhan</span>}
                  </div>

                  <div className="w-px h-10 bg-slate-800" />

                  {/* Kubus Satuan A */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {Array.from({ length: onesA }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-sm border border-amber-200 shadow-sm"
                        title="1 Kubus Satuan"
                      />
                    ))}
                    {onesA === 0 && <span className="text-[11px] text-slate-600">0 Satuan</span>}
                  </div>
                </div>
              </div>

              {/* Visual Balok B */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-tealbrand-300">Bilangan Kedua: {numB}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {tensB} Puluhan, {onesB} Satuan
                  </span>
                </div>
                <div className="flex items-center gap-3 min-h-[48px] overflow-x-auto py-1">
                  {/* Batang Puluhan B */}
                  <div className="flex gap-1.5 shrink-0">
                    {Array.from({ length: tensB }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-12 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm border border-cyan-200 flex flex-col justify-between py-0.5"
                        title="1 Batang Puluhan (10)"
                      >
                        {Array.from({ length: 9 }).map((_, j) => (
                          <div key={j} className="h-px bg-cyan-700/60 w-full" />
                        ))}
                      </div>
                    ))}
                    {tensB === 0 && <span className="text-[11px] text-slate-600">0 Puluhan</span>}
                  </div>

                  <div className="w-px h-10 bg-slate-800" />

                  {/* Kubus Satuan B */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {Array.from({ length: onesB }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-sm border border-amber-200 shadow-sm"
                        title="1 Kubus Satuan"
                      />
                    ))}
                    {onesB === 0 && <span className="text-[11px] text-slate-600">0 Satuan</span>}
                  </div>
                </div>
              </div>

              {/* Pedagogical Rule Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-tealbrand-300">
                  <Info className="w-4 h-4 text-tealbrand-400" />
                  <span>Kaidah Emas Berhitung Nilai Tempat:</span>
                </div>
                <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                  <li>
                    <strong>Satuan maksimal 9</strong>: Jika kubus satuan sudah ada 10, segera tukarkan menjadi 1 batang puluhan!
                  </li>
                  <li>
                    <strong>Kotak Simpan</strong>: Simpan 1 puluhan di atas kolom puluhan, lalu jumlahkan bersama puluhan lainnya.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE 2: 3D WEBGL INTERAKTIF                                 */}
      {/* ============================================================== */}
      {viewMode === '3d' && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span>Simulasi 3D Balok Dienes: {numA} {operation === 'add' ? '+' : '−'} {numB}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                  Three.js WebGL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Putar sudut pandang 360° untuk melihat batang puluhan (biru) dan kubus satuan (emas) berdiri di panggung spasial.
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
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
                  isAutoRotate
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoRotate ? 'Jeda Putar' : 'Putar 360°'}</span>
              </button>
            </div>
          </div>

          {/* Canvas 3D */}
          <div className="relative w-full h-[480px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing">
            <canvas ref={canvas3DRef} className="w-full h-full block outline-none" />

            {/* Instruction Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Klik &amp; Geser mouse untuk memutar panggung 360°</span>
            </div>

            {/* 3D Legend Bar */}
            <div className="absolute bottom-4 inset-x-4 max-w-lg mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-2xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <span className="w-3 h-3 rounded-sm bg-cyan-400"></span>
                <span>Kiri: Batang Puluhan (10)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <span className="w-3 h-3 rounded-sm bg-amber-400"></span>
                <span>Kanan: Kubus Satuan (1)</span>
              </div>
              {hasCarry && (
                <div className="flex items-center gap-2 text-pink-300 font-bold animate-pulse">
                  <span className="w-3 h-3 rounded-sm bg-pink-500"></span>
                  <span>Melayang: Simpan 1 Puluhan</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODE 3: 5 MODUL EKSPERIMEN SAINS MATEMATIKA KURIKULUM        */}
      {/* ============================================================== */}
      {viewMode === 'experiments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Navigation Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { id: 1, title: 'Eksperimen 1', desc: 'Rumah Nilai Tempat', icon: '🏠' },
              { id: 2, title: 'Eksperimen 2', desc: 'Tambah Simpan (>9)', icon: '➕' },
              { id: 3, title: 'Eksperimen 3', desc: 'Kurang Pinjam', icon: '➖' },
              { id: 4, title: 'Eksperimen 4', desc: 'Garis Bilangan Katak', icon: '🐸' },
              { id: 5, title: 'Eksperimen 5', desc: 'Kuis Juara Hitung', icon: '🏆' },
            ].map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
                  activeExperiment === exp.id
                    ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{exp.icon}</span>
                <div>
                  <p className="font-bold text-xs">{exp.title}</p>
                  <p className="text-[10px] opacity-80 line-clamp-1">{exp.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Experiment 1: Rumah Nilai Tempat */}
          {activeExperiment === 1 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">🏠</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 1: Eksplorasi Rumah Nilai Tempat (1 - 99)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Geser slider angka dan amati bagaimana angka dipecah menjadi kumpulan puluhan dan satuan.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="text-xs font-bold text-slate-300">Pilih Angka:</label>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={expPlaceValueNum}
                  onChange={(e) => setExpPlaceValueNum(parseInt(e.target.value))}
                  className="flex-1 accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-black text-lg">
                  {expPlaceValueNum}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rumah Puluhan */}
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 space-y-2">
                  <div className="flex justify-between items-center text-cyan-300 font-bold text-sm">
                    <span>🏢 Rumah Puluhan</span>
                    <span className="font-mono text-xl">{Math.floor(expPlaceValueNum / 10)} Puluhan</span>
                  </div>
                  <p className="text-[11px] text-cyan-200/80">
                    Bernilai {Math.floor(expPlaceValueNum / 10) * 10} ({Math.floor(expPlaceValueNum / 10)} batang balok).
                  </p>
                  <div className="flex gap-2 flex-wrap pt-2">
                    {Array.from({ length: Math.floor(expPlaceValueNum / 10) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-12 bg-cyan-400 rounded-sm border border-cyan-200 shadow"
                        title="1 Batang (10)"
                      />
                    ))}
                  </div>
                </div>

                {/* Rumah Satuan */}
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 space-y-2">
                  <div className="flex justify-between items-center text-amber-300 font-bold text-sm">
                    <span>🏠 Rumah Satuan</span>
                    <span className="font-mono text-xl">{expPlaceValueNum % 10} Satuan</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">
                    Bernilai {expPlaceValueNum % 10} kubus kecil satuan.
                  </p>
                  <div className="flex gap-2 flex-wrap pt-2">
                    {Array.from({ length: expPlaceValueNum % 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 bg-amber-400 rounded-sm border border-amber-200 shadow"
                        title="1 Satuan"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experiment 2: Penjumlahan Di Atas Angka Sembilan (Menyimpan) */}
          {activeExperiment === 2 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">➕</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 2: Mengapa Harus Menyimpan Saat Hasil Satuan &gt; 9?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pahami perpindahan 10 kubus satuan ke kolom puluhan menggunakan contoh konkret 7 + 8.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="text-center font-mono text-2xl font-black text-amber-300">
                  7 + 8 = 15
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">Langkah 1</p>
                    <p className="text-sm font-bold text-white mt-1">7 + 8 = 15</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Hasil satuan lebih dari 9</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">Langkah 2</p>
                    <p className="text-sm font-bold text-pink-400 mt-1">15 = 10 + 5</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pecah jadi 1 Puluhan dan 5 Satuan</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">Langkah 3</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">Tulis 5, Simpan 1</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Simpan 1 di atas kolom puluhan</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setOperation('add');
                      setNumA(7);
                      setNumB(8);
                      setViewMode('2d');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <span>Coba di Papan Bersusun 2D</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Experiment 3: Pengurangan Meminjam */}
          {activeExperiment === 3 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">➖</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 3: Trik Meminjam Puluhan (1 Puluhan = 10 Satuan)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Bagaimana jika angka satuan atas lebih kecil dari angka satuan bawah? Contoh: 23 − 7.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="text-center font-mono text-2xl font-black text-rose-300">
                  23 − 7 = 16
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">Langkah 1</p>
                    <p className="text-sm font-bold text-white mt-1">Satuan: 3 − 7 ?</p>
                    <p className="text-[11px] text-rose-400 mt-0.5">Tidak cukup karena 3 &lt; 7</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">Langkah 2</p>
                    <p className="text-sm font-bold text-cyan-400 mt-1">Pinjam 1 Puluhan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Satuan menjadi 10 + 3 = 13</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold">Langkah 3</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">13 − 7 = 6</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Puluhan tersisa 1. Hasil: 16!</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setOperation('subtract');
                      setNumA(23);
                      setNumB(7);
                      setViewMode('2d');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <span>Coba Pengurangan 23 − 7 di Papan 2D</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Experiment 4: Garis Bilangan Lompat Katak */}
          {activeExperiment === 4 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-2xl">🐸</span>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 4: Garis Bilangan Lompat Katak Si Pintar
                  </h4>
                  <p className="text-xs text-slate-400">
                    Penjumlahan adalah melompat ke kanan (+), dan pengurangan adalah melompat ke kiri (−).
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-400">Titik Mulai (A): {expFrogStart}</label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={expFrogStart}
                    onChange={(e) => setExpFrogStart(parseInt(e.target.value))}
                    className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">Arah Lompatan:</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setExpFrogOp('+')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        expFrogOp === '+' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Maju (+)
                    </button>
                    <button
                      onClick={() => setExpFrogOp('-')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        expFrogOp === '-' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Mundur (−)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Banyak Langkah (B): {expFrogJump}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={expFrogOp === '-' ? expFrogStart : 15}
                    value={expFrogJump}
                    onChange={(e) => setExpFrogJump(parseInt(e.target.value))}
                    className="w-full accent-tealbrand-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Number Line Canvas */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-center space-y-4">
                <p className="font-mono text-xl font-bold text-emerald-400">
                  {expFrogStart} {expFrogOp} {expFrogJump} ={' '}
                  {expFrogOp === '+' ? expFrogStart + expFrogJump : expFrogStart - expFrogJump}
                </p>

                {/* Number Line Track */}
                <div className="relative min-w-[600px] h-20 flex items-center justify-between px-6 border-b-4 border-slate-700">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-slate-400 mb-2">{i}</span>
                      <div
                        className={`w-1 h-3 rounded-full ${
                          i === expFrogStart
                            ? 'bg-amber-400 h-5 w-2'
                            : i === (expFrogOp === '+' ? expFrogStart + expFrogJump : expFrogStart - expFrogJump)
                            ? 'bg-emerald-400 h-6 w-2.5 shadow-lg'
                            : 'bg-slate-700'
                        }`}
                      />
                    </div>
                  ))}

                  {/* Frog Marker */}
                  <div
                    className="absolute top-0 text-2xl transition-all duration-500 transform -translate-x-1/2"
                    style={{
                      left: `${((expFrogOp === '+' ? expFrogStart + expFrogJump : expFrogStart - expFrogJump) / 24) * 90 + 5}%`,
                    }}
                  >
                    🐸
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experiment 5: Kuis Juara Hitung Cilik */}
          {activeExperiment === 5 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="font-extrabold text-base text-white">
                    Eksperimen 5: Kuis Juara Hitung SD (Fase A)
                  </h4>
                </div>
                {quizSubmitted && (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold font-mono text-xs border border-amber-500/30">
                    Nilai: {quizScore} / 100
                  </span>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {[
                  {
                    q: '1. Angka 38 terdiri dari...',
                    options: ['8 puluhan dan 3 satuan', '3 puluhan dan 8 satuan', '38 puluhan', '11 satuan'],
                    correct: 1,
                    explanation: 'Angka depan (3) adalah nilai puluhan (30), dan angka belakang (8) adalah nilai satuan.',
                  },
                  {
                    q: '2. Pada penjumlahan 8 + 6 = 14, angka berapakah yang disimpan di atas kolom puluhan?',
                    options: ['Angka 1', 'Angka 4', 'Angka 6', 'Angka 8'],
                    correct: 0,
                    explanation: '14 terdiri dari 1 puluhan dan 4 satuan. Angka 1 disimpan di kolom puluhan dan 4 ditulis di kolom satuan.',
                  },
                  {
                    q: '3. Berapakah hasil penjumlahan bersusun dari 17 + 8?',
                    options: ['24', '15', '25', '35'],
                    correct: 2,
                    explanation: 'Satuan: 7 + 8 = 15 (tulis 5, simpan 1). Puluhan: 1 + 1 (simpanan) = 2. Hasil: 25.',
                  },
                  {
                    q: '4. Ibu memiliki 25 butir telur. Sebanyak 7 butir telur digoreng. Berapa sisa telur Ibu?',
                    options: ['17 butir', '18 butir', '19 butir', '16 butir'],
                    correct: 1,
                    explanation: '25 − 7 = 18 butir (satuan 5 pinjam 1 puluhan menjadi 15 − 7 = 8, puluhan 2 tersisa 1).',
                  },
                  {
                    q: '5. Jika kamu memiliki 10 kubus kecil satuan, kamu dapat menukarkannya dengan...',
                    options: ['1 batang puluhan', '2 batang puluhan', '10 batang puluhan', '100 balok'],
                    correct: 0,
                    explanation: '1 batang puluhan pada Balok Dienes tepat berisikan 10 kubus satuan kecil.',
                  },
                ].map((item, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="font-bold text-xs text-slate-200">{item.q}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {item.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const isCorrect = item.correct === oIdx;
                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })}
                            className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                              quizSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                  : isSelected
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                                : isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                        <strong className="text-tealbrand-400">Pembahasan:</strong> {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-xl transition-all"
                >
                  Kirim Jawaban Kuis Juara
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Coba Kuis Lagi</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODE 4: AUGMENTED REALITY (AR) MEJA BELAJAR                 */}
      {/* ============================================================== */}
      {viewMode === 'ar' && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-400" />
                <span>Augmented Reality (AR): Balok Hitung di Meja Nyata</span>
              </h3>
              <p className="text-xs text-slate-400">
                Arahkan kamera perangkatmu ke meja belajarmu untuk memproyeksikan tumpukan balok hitung nyata!
              </p>
            </div>
            {isCameraActive && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Kamera Langsung Aktif</span>
              </span>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center">
              {cameraError}
            </div>
          )}

          <div className="relative w-full h-[450px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
            {/* Live Camera Feed */}
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

            {/* If camera is inactive overlay */}
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/80 backdrop-blur-sm space-y-3">
                <Camera className="w-12 h-12 text-slate-500 animate-bounce" />
                <p className="font-bold text-sm text-slate-300">
                  Kamera Belum Aktif
                </p>
                <button
                  onClick={handleStartCamera}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg"
                >
                  Aktifkan Kamera AR Meja
                </button>
              </div>
            )}

            {/* AR Hologram HUD Overlay */}
            {isCameraActive && (
              <div className="absolute inset-x-4 bottom-4 bg-slate-900/85 backdrop-blur-md p-4 rounded-2xl border border-pink-500/40 shadow-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-pink-300">
                    Proyeksi Balok: {numA} {operation === 'add' ? '+' : '−'} {numB} = {totalResult}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {expectedTens} Puluhan, {expectedOnes} Satuan
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNumA(Math.min(99, numA + 1))}
                    className="flex-1 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-bold"
                  >
                    + Tambah Balok
                  </button>
                  <button
                    onClick={() => setNumA(Math.max(1, numA - 1))}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    − Kurang Balok
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODE 5: VIRTUAL REALITY (VR 360°)                           */}
      {/* ============================================================== */}
      {viewMode === 'vr' && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Glasses className="w-4 h-4 text-purple-400" />
                <span>Virtual Reality 360°: Planet Berhitung Futuristik</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rasakan pengalaman berada di ruang angkasa berhitung. Gunakan kacamata VR Cardboard untuk efek 3D nyata!
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
