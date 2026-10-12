'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Info, Sparkles, Orbit } from 'lucide-react';

interface PlanetData {
  name: string;
  indonesianName: string;
  distance: number; // scene distance
  size: number;
  color: number;
  speed: number;
  realDistanceAU: number;
  periodDays: number;
  diameterKm: number;
  moons: number;
  tempC: string;
  description: string;
  hasRing?: boolean;
}

const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    indonesianName: 'Merkurius',
    distance: 14,
    size: 0.8,
    color: 0x9ca3af,
    speed: 0.04,
    realDistanceAU: 0.39,
    periodDays: 88,
    diameterKm: 4879,
    moons: 0,
    tempC: '-173 s/d 427°C',
    description: 'Planet terdekat dengan Matahari dan terkecil di Tata Surya, tidak memiliki atmosfer tebal.',
  },
  {
    name: 'Venus',
    indonesianName: 'Venus',
    distance: 22,
    size: 1.4,
    color: 0xf59e0b,
    speed: 0.025,
    realDistanceAU: 0.72,
    periodDays: 225,
    diameterKm: 12104,
    moons: 0,
    tempC: '462°C',
    description: 'Planet terpanas karena efek rumah kaca gas karbon dioksida pekat, berotasi searah jarum jam.',
  },
  {
    name: 'Earth',
    indonesianName: 'Bumi',
    distance: 32,
    size: 1.6,
    color: 0x3b82f6,
    speed: 0.018,
    realDistanceAU: 1.0,
    periodDays: 365.25,
    diameterKm: 12742,
    moons: 1,
    tempC: '-88 s/d 58°C',
    description: 'Satu-satunya planet yang diketahui menampung kehidupan dengan atmosfer kaya oksigen dan air cair.',
  },
  {
    name: 'Mars',
    indonesianName: 'Mars',
    distance: 42,
    size: 1.1,
    color: 0xef4444,
    speed: 0.013,
    realDistanceAU: 1.52,
    periodDays: 687,
    diameterKm: 6779,
    moons: 2,
    tempC: '-140 s/d 20°C',
    description: 'Dikenal sebagai Planet Merah akibat oksida besi di permukaannya, memiliki gunung tertinggi Olympus Mons.',
  },
  {
    name: 'Jupiter',
    indonesianName: 'Jupiter',
    distance: 58,
    size: 3.5,
    color: 0xd97706,
    speed: 0.007,
    realDistanceAU: 5.2,
    periodDays: 4333,
    diameterKm: 139820,
    moons: 95,
    tempC: '-110°C',
    description: 'Planet terbesar di Tata Surya dengan Bintik Merah Raksasa (badai abadi) dan gravitasi terkuat.',
  },
  {
    name: 'Saturn',
    indonesianName: 'Saturnus',
    distance: 76,
    size: 3.0,
    color: 0xfcd34d,
    speed: 0.005,
    realDistanceAU: 9.58,
    periodDays: 10759,
    diameterKm: 116460,
    moons: 146,
    tempC: '-140°C',
    description: 'Memiliki sistem cincin spektakuler yang tersusun dari partikel es dan batuan kosmik.',
    hasRing: true,
  },
  {
    name: 'Uranus',
    indonesianName: 'Uranus',
    distance: 92,
    size: 2.2,
    color: 0x06b6d4,
    speed: 0.003,
    realDistanceAU: 19.2,
    periodDays: 30687,
    diameterKm: 50724,
    moons: 28,
    tempC: '-195°C',
    description: 'Planet es raksasa yang menggelinding pada poros rotasi miring 98 derajat, atmosfer mengandung metana.',
  },
  {
    name: 'Neptune',
    indonesianName: 'Neptunus',
    distance: 108,
    size: 2.1,
    color: 0x2563eb,
    speed: 0.002,
    realDistanceAU: 30.1,
    periodDays: 60190,
    diameterKm: 49244,
    moons: 16,
    tempC: '-200°C',
    description: 'Planet terjauh yang dingin dan memiliki angin supersonic tercepat di tata surya mencapai 2.100 km/jam.',
  },
];

export function SolarSystem3D({ onProgressUpdate }: { onProgressUpdate?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);

  // References for Three.js state
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(speedMultiplier);
  speedRef.current = speedMultiplier;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 75, 130);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Stars Background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1200;
    const starCoords = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 600;
      starCoords[i + 1] = (Math.random() - 0.5) * 600;
      starCoords[i + 2] = (Math.random() - 0.5) * 600;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 3. Sun
    const sunGeom = new THREE.SphereGeometry(6, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sun);

    // Sun Glow
    const sunLight = new THREE.PointLight(0xffffff, 2, 300);
    scene.add(sunLight);
    const ambientLight = new THREE.AmbientLight(0x334155, 0.9);
    scene.add(ambientLight);

    // 4. Planet Meshes and Orbits
    const planetMeshes: { mesh: THREE.Mesh; data: PlanetData; angle: number; orbitLine?: THREE.Line }[] = [];

    PLANETS.forEach((p, idx) => {
      // Orbit circle line
      const orbitCurve = new THREE.EllipseCurve(0, 0, p.distance, p.distance, 0, 2 * Math.PI, false, 0);
      const orbitPoints = orbitCurve.getPoints(100);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map((pt) => new THREE.Vector3(pt.x, 0, pt.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      scene.add(orbitLine);

      // Planet Mesh
      const pGeom = new THREE.SphereGeometry(p.size, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.7,
        metalness: 0.1,
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);

      // If Saturn, add ring
      if (p.hasRing) {
        const ringGeom = new THREE.RingGeometry(p.size * 1.4, p.size * 2.3, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xe2e8f0,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2.5;
        pMesh.add(ringMesh);
      }

      // Initial angle spaced out
      const initialAngle = (idx * (Math.PI * 2)) / PLANETS.length;
      pMesh.position.set(Math.cos(initialAngle) * p.distance, 0, Math.sin(initialAngle) * p.distance);
      scene.add(pMesh);

      planetMeshes.push({
        mesh: pMesh,
        data: p,
        angle: initialAngle,
        orbitLine,
      });
    });

    // 5. Mouse Interaction / Orbit Controls (Lightweight Drag)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = 0.5;
    let radius = 150;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.008;
      sphericalPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalPhi + deltaY * 0.008));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(40, Math.min(260, radius + e.deltaY * 0.1));
      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0, 0);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 6. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotate Sun slowly
      sun.rotation.y += 0.003;

      if (isPlayingRef.current) {
        const speed = speedRef.current;
        planetMeshes.forEach((item) => {
          item.angle += item.data.speed * 0.5 * speed;
          item.mesh.position.x = Math.cos(item.angle) * item.data.distance;
          item.mesh.position.z = Math.sin(item.angle) * item.data.distance;
          item.mesh.rotation.y += 0.02 * speed;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  const handleSelectPlanet = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-slate-950 rounded-2xl p-4 text-white shadow-2xl border border-slate-800">
      {/* 3D Canvas Container */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Orbit className="w-5 h-5 text-tealbrand-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-100">
              Simulasi 3D Tata Surya &amp; Revolusi Planet
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
            Kepler Law Engine
          </span>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative w-full h-[450px] sm:h-[520px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing my-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          {/* Overlay Guide */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 pointer-events-none z-10">
            🖱️ Klik &amp; Drag: Putar Sudut Pandang | Scroll: Zoom In/Out
          </div>

          {/* Quick Planet Pills */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto pb-1 z-10">
            {PLANETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPlanet(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-md ${
                  selectedPlanet?.name === p.name
                    ? 'bg-amber-400 text-slate-950 scale-105'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {p.indonesianName}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Jeda Waktu' : 'Lanjutkan'}</span>
            </button>

            <button
              onClick={() => {
                setSpeedMultiplier(1);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
              title="Reset Kecepatan Normal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Laju Waktu:</span>
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-brand-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-tealbrand-400 w-10">
              {speedMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* Planetary Science Panel */}
      <div className="w-full lg:w-80 bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Info className="w-4 h-4 text-tealbrand-400" />
            <h4 className="font-bold text-sm text-slate-200">Data Fisik Astronomi</h4>
          </div>

          {selectedPlanet ? (
            <div className="space-y-4 mt-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-amber-400">{selectedPlanet.indonesianName}</h3>
                  <span className="text-xs text-slate-400 italic">{selectedPlanet.name}</span>
                </div>
                <div
                  className="w-6 h-6 rounded-full border border-white/20"
                  style={{ backgroundColor: `#${selectedPlanet.color.toString(16).padStart(6, '0')}` }}
                />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {selectedPlanet.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Jarak Rata-rata</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedPlanet.realDistanceAU} AU</p>
                  <p className="text-[10px] text-slate-500">{(selectedPlanet.realDistanceAU * 149.6).toFixed(1)} jt km</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Periode Orbit</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedPlanet.periodDays} Hari</p>
                  <p className="text-[10px] text-slate-500">{(selectedPlanet.periodDays / 365.25).toFixed(2)} Tahun</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Diameter Khatulistiwa</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedPlanet.diameterKm.toLocaleString('id-ID')} km</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Suhu Permukaan</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedPlanet.tempC}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Satelit Alami (Bulan):</span>
                <span className="font-bold text-tealbrand-400">{selectedPlanet.moons} Satelit</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">
                Pilih salah satu planet pada daftar di bawah kanvas untuk membedah data orbit dan struktur fisiknya.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
          💡 Hukum Kepler III: <code className="text-tealbrand-300 font-mono">T² ∝ a³</code> (Planet lebih jauh membutuhkan waktu revolusi lebih panjang).
        </div>
      </div>
    </div>
  );
}
