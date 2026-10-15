'use client';

import React, { useState } from 'react';
import { SolarSystem3D } from './solar-system-3d';
import { RatioLab } from './ratio-lab';
import { NetworkTopologyLab } from './network-topology-lab';
import { SubnettingLab } from './subnetting-lab';
import { SDSolarMultiverseLab } from './sd-solar-multiverse-lab';
import { SDMathRatioMultiverseLab } from './sd-math-ratio-multiverse-lab';
import { SDGeometryShapesMultiverseLab } from './sd-geometry-shapes-multiverse-lab';
import { SDMathAdditionSubtractionLab } from './sd-math-addition-subtraction-lab';
import { Maximize2, Minimize2, RotateCcw, Sparkles, Sliders, Play, CheckCircle2 } from 'lucide-react';

interface LabSimulationEngineProps {
  slug: string;
  title: string;
  simulationType: string;
  simulationConfig?: string | null;
  onActivityComplete?: (activityId?: string) => void;
}

export function LabSimulationEngine({
  slug,
  title,
  simulationType,
  simulationConfig,
  onActivityComplete,
}: LabSimulationEngineProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [experimentVal1, setExperimentVal1] = useState(10);
  const [experimentVal2, setExperimentVal2] = useState(25);
  const [customRunning, setCustomRunning] = useState(false);
  const [customFinished, setCustomFinished] = useState(false);

  const handleSimProgress = () => {
    if (onActivityComplete) {
      onActivityComplete();
    }
  };

  const handleRunCustomExperiment = () => {
    setCustomRunning(true);
    setTimeout(() => {
      setCustomRunning(false);
      setCustomFinished(true);
      if (onActivityComplete) {
        onActivityComplete();
      }
    }, 1500);
  };

  const renderSimulationComponent = () => {
    switch (slug) {
      case 'lab-virtual-tata-surya':
        return <SolarSystem3D onProgressUpdate={handleSimProgress} />;

      case 'lab-ipas-sd-tata-surya':
        return <SDSolarMultiverseLab onProgressUpdate={handleSimProgress} />;

      case 'lab-matematika-sd-rasio':
        return <SDMathRatioMultiverseLab onProgressUpdate={handleSimProgress} />;

      case 'lab-matematika-sd-bangun-ruang':
        return <SDGeometryShapesMultiverseLab onProgressUpdate={handleSimProgress} />;

      case 'lab-matematika-sd-penjumlahan-pengurangan':
        return <SDMathAdditionSubtractionLab onProgressUpdate={handleSimProgress} />;

      case 'lab-rasio-matematika':
        return <RatioLab onProgressUpdate={handleSimProgress} />;

      case 'lab-jaringan-topologi':
        return <NetworkTopologyLab onProgressUpdate={handleSimProgress} />;

      case 'lab-ip-subnetting':
        return <SubnettingLab onProgressUpdate={handleSimProgress} />;

      default:
        // Generic interactive workbench for Physics/Chemistry/Biology/Electronics
        return (
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-tealbrand-400" />
                <h4 className="font-bold text-base text-slate-100">
                  Meja Eksperimen Interaktif: {title}
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-tealbrand-300 font-mono">
                {simulationType === 'TWO_D' ? 'Visualisasi 2D' : 'Aplikasi Web Interaktif'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-bold uppercase text-slate-400">Variabel Eksperimen</p>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Variabel Bebas (Intensitas / Massa / Konsentrasi):</span>
                    <span className="font-mono text-tealbrand-400 font-bold">{experimentVal1} unit</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={experimentVal1}
                    onChange={(e) => setExperimentVal1(parseInt(e.target.value))}
                    className="w-full accent-tealbrand-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Variabel Terikat (Suhu / Hambatan / Waktu):</span>
                    <span className="font-mono text-brand-400 font-bold">{experimentVal2}° / Ohm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={experimentVal2}
                    onChange={(e) => setExperimentVal2(parseInt(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleRunCustomExperiment}
                  disabled={customRunning}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{customRunning ? 'Menjalankan Simulasi...' : 'Jalankan Simulasi'}</span>
                </button>
              </div>

              {/* Output Monitor */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Monitor Sensor Digital</p>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Respon Sistem:</span>
                      <span className="text-tealbrand-400 font-bold">
                        {(experimentVal1 * 1.84 + experimentVal2 * 0.42).toFixed(2)} unit
                      </span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Taraf Efisiensi:</span>
                      <span className="text-amber-400 font-bold">
                        {Math.min(99.4, 45 + (experimentVal1 / 50) * 50).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {customFinished && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Data eksperimen berhasil direkam ke riwayat aktivitas belajar!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative transition-all ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto' : ''}`}>
      {/* Simulation Engine Controls Bar */}
      <div className="flex items-center justify-between pb-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-600">Simulasi Virtual Aktif</span>
        </div>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Keluar Layar Penuh</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Layar Penuh</span>
            </>
          )}
        </button>
      </div>

      {/* Render Module */}
      {renderSimulationComponent()}
    </div>
  );
}
