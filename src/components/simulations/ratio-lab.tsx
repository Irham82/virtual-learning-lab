'use client';

import React, { useState } from 'react';
import { Scale, CheckCircle2, RotateCcw, Target, Sparkles, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RatioLabProps {
  onProgressUpdate?: () => void;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function RatioLab({ onProgressUpdate }: RatioLabProps) {
  const [countA, setCountA] = useState<number>(6);
  const [countB, setCountB] = useState<number>(9);
  const [targetRatio, setTargetRatio] = useState<{ a: number; b: number; label: string }>({
    a: 2,
    b: 3,
    label: '2 : 3',
  });
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);

  const divisor = gcd(countA, countB);
  const simplifiedA = countA > 0 ? countA / divisor : 0;
  const simplifiedB = countB > 0 ? countB / divisor : 0;

  const total = countA + countB;
  const percentA = total > 0 ? ((countA / total) * 100).toFixed(1) : '0';
  const percentB = total > 0 ? ((countB / total) * 100).toFixed(1) : '0';

  // Check challenge
  const isMatchChallenge = simplifiedA === targetRatio.a && simplifiedB === targetRatio.b && total >= 10;

  const handleCheckChallenge = () => {
    if (isMatchChallenge) {
      setChallengeCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    }
  };

  const handleReset = () => {
    setCountA(4);
    setCountB(6);
    setChallengeCompleted(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-600" />
            Laboratorium Rasio, Proporsi, dan Kesetaraan Visual
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Eksperimen memanipulasi jumlah objek dan amati bentuk perbandingan paling sederhana.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Nilai
        </button>
      </div>

      {/* Main interactive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (4 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/80">
          <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider text-xs">
            Kontrol Kuantitas Objek
          </h4>

          {/* Item A */}
          <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-rose-700 flex items-center gap-1.5">
                🍎 Objek A (Apel Merah)
              </span>
              <span className="font-mono text-base font-extrabold text-rose-600 px-2 py-0.5 bg-rose-50 rounded-md">
                {countA}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={countA}
              onChange={(e) => {
                setCountA(parseInt(e.target.value) || 1);
                setChallengeCompleted(false);
              }}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Min: 1</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCountA(Math.max(1, countA - 1))}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setCountA(Math.min(24, countA + 1))}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span>Max: 24</span>
            </div>
          </div>

          {/* Item B */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-700 flex items-center gap-1.5">
                🍊 Objek B (Jeruk Manis)
              </span>
              <span className="font-mono text-base font-extrabold text-amber-600 px-2 py-0.5 bg-amber-50 rounded-md">
                {countB}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={countB}
              onChange={(e) => {
                setCountB(parseInt(e.target.value) || 1);
                setChallengeCompleted(false);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Min: 1</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCountB(Math.max(1, countB - 1))}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setCountB(Math.min(24, countB + 1))}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span>Max: 24</span>
            </div>
          </div>

          {/* Interactive Challenge Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-brand-50 border border-brand-200">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-600" />
              <h5 className="font-bold text-xs text-brand-900">Tantangan Proporsi Terbimbing</h5>
            </div>
            <p className="text-xs text-brand-700 mt-1.5 leading-relaxed">
              Atur slider sehingga rasio sederhana bernilai <strong className="font-bold text-brand-900">2 : 3</strong> dengan total minimal 10 buah!
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700">
                Status: {simplifiedA}:{simplifiedB} {isMatchChallenge ? '✅ Setara!' : '⏳ Belum'}
              </span>
              <button
                onClick={handleCheckChallenge}
                disabled={!isMatchChallenge}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isMatchChallenge
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {challengeCompleted ? 'Tantangan Selesai 🎉' : 'Verifikasi Tantangan'}
              </button>
            </div>
          </div>
        </div>

        {/* Visualizer Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
          {/* Ratio Comparison Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Rasio Asli (A : B)</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
                {countA} : {countB}
              </p>
            </div>

            <div className="bg-brand-50 p-3 rounded-xl border border-brand-200">
              <p className="text-[11px] font-semibold text-brand-700 uppercase">Bentuk Sederhana</p>
              <p className="text-xl sm:text-2xl font-black text-brand-700 mt-1 font-mono">
                {simplifiedA} : {simplifiedB}
              </p>
              <p className="text-[10px] text-brand-600 font-medium">FPB = {divisor}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-tealbrand-50 p-3 rounded-xl border border-tealbrand-200">
              <p className="text-[11px] font-semibold text-tealbrand-800 uppercase">Persentase Bagian</p>
              <p className="text-sm font-bold text-tealbrand-900 mt-1.5">
                {percentA}% : {percentB}%
              </p>
              <p className="text-[10px] text-tealbrand-700">Total {total} buah</p>
            </div>
          </div>

          {/* Visual Display Grid */}
          <div className="bg-slate-900 rounded-xl p-4 text-white space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Representasi Kanvas Objek ({total} Buah)</span>
              <span>1 Kotak = 1 Unit Objek</span>
            </div>

            {/* Apple visual grid */}
            <div>
              <p className="text-xs text-rose-300 font-semibold mb-1.5">Apel ({countA} unit):</p>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {Array.from({ length: countA }).map((_, i) => (
                  <span
                    key={`a-${i}`}
                    className="w-7 h-7 rounded-md bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-sm shadow-sm hover:scale-110 transition-transform"
                    title={`Apel #${i + 1}`}
                  >
                    🍎
                  </span>
                ))}
              </div>
            </div>

            {/* Orange visual grid */}
            <div>
              <p className="text-xs text-amber-300 font-semibold mb-1.5">Jeruk ({countB} unit):</p>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {Array.from({ length: countB }).map((_, i) => (
                  <span
                    key={`b-${i}`}
                    className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-sm shadow-sm hover:scale-110 transition-transform"
                    title={`Jeruk #${i + 1}`}
                  >
                    🍊
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Proportion Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
                <div
                  className="bg-rose-500 transition-all duration-300"
                  style={{ width: `${percentA}%` }}
                />
                <div
                  className="bg-amber-500 transition-all duration-300"
                  style={{ width: `${percentB}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Apel: {percentA}%</span>
                <span>Jeruk: {percentB}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
