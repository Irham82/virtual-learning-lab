'use client';

import React, { useState, useMemo } from 'react';
import { Binary, Calculator, CheckCircle2, RotateCcw, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubnettingLabProps {
  onProgressUpdate?: () => void;
}

function ipToLong(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join('.');
}

export function SubnettingLab({ onProgressUpdate }: SubnettingLabProps) {
  const [ipInput, setIpInput] = useState<string>('192.168.10.45');
  const [cidr, setCidr] = useState<number>(26);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSolved, setQuizSolved] = useState<boolean>(false);

  // Valid IP check
  const isValidIp = useMemo(() => {
    const parts = ipInput.split('.');
    if (parts.length !== 4) return false;
    return parts.every((p) => {
      const n = parseInt(p, 10);
      return !isNaN(n) && n >= 0 && n <= 255 && p === n.toString();
    });
  }, [ipInput]);

  // Calculations
  const calculations = useMemo(() => {
    if (!isValidIp) return null;

    const ipLong = ipToLong(ipInput);
    const maskLong = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardLong = ~maskLong >>> 0;
    const networkLong = (ipLong & maskLong) >>> 0;
    const broadcastLong = (networkLong | wildcardLong) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    const firstHostLong = cidr >= 31 ? networkLong : networkLong + 1;
    const lastHostLong = cidr >= 31 ? broadcastLong : broadcastLong - 1;

    // Binary representation of mask
    const binaryMask = Array.from({ length: 32 }, (_, i) => (i < cidr ? '1' : '0'));

    return {
      subnetMask: longToIp(maskLong),
      wildcard: longToIp(wildcardLong),
      networkAddress: longToIp(networkLong),
      broadcastAddress: longToIp(broadcastLong),
      firstHost: usableHosts > 0 ? longToIp(firstHostLong) : 'None',
      lastHost: usableHosts > 0 ? longToIp(lastHostLong) : 'None',
      usableHosts,
      totalHosts,
      binaryMask,
    };
  }, [ipInput, cidr, isValidIp]);

  // Handle challenge
  const handleVerifyQuiz = () => {
    // Challenge: minimum 25 hosts required => correct CIDR is /27 (up to 30 usable hosts)
    if (quizAnswer === 27) {
      setQuizSolved(true);
      confetti({ particleCount: 70, spread: 50 });
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } else {
      alert('Jawaban belum tepat. Coba ingat rumus host: 2^(32-prefix) - 2 >= jumlah host!');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-tealbrand-600" />
            Laboratorium Subnetting IPv4 &amp; Kalkulator CIDR Interaktif
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis pembagian bit Network vs Host, Network ID, Broadcast ID, dan rentang alamat host valid.
          </p>
        </div>

        <button
          onClick={() => {
            setIpInput('192.168.10.45');
            setCidr(26);
            setQuizSolved(false);
            setQuizAnswer(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Nilai
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
        <div className="md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Alamat IPv4:
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value.trim())}
            placeholder="192.168.1.1"
            className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm border font-semibold outline-none transition-all ${
              isValidIp
                ? 'bg-white border-slate-300 focus:border-tealbrand-500 text-slate-900'
                : 'bg-rose-50 border-rose-400 text-rose-700'
            }`}
          />
          {!isValidIp && (
            <p className="text-[11px] text-rose-600 mt-1">
              Masukkan alamat IP desimal bertitik yang valid (0-255 tiap oktet).
            </p>
          )}
        </div>

        <div className="md:col-span-6">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Prefix Panjang Subnet (CIDR):
            </label>
            <span className="font-mono text-sm font-extrabold text-tealbrand-700 bg-tealbrand-100 px-2 py-0.5 rounded">
              /{cidr}
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="30"
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value))}
            className="w-full accent-tealbrand-600 cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>/8 (Class A)</span>
            <span>/16 (Class B)</span>
            <span>/24 (Class C)</span>
            <span>/30 (Point-to-Point)</span>
          </div>
        </div>
      </div>

      {/* Binary Decomposition Visualizer */}
      {calculations && (
        <div className="bg-slate-900 p-4 sm:p-5 rounded-xl text-white space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Binary className="w-4 h-4 text-tealbrand-400" />
              Dekomposisi Biner Netmask 32-Bit
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-tealbrand-400 inline-block"></span>
                Bit Network ({cidr} bit)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                Bit Host ({32 - cidr} bit)
              </span>
            </div>
          </div>

          {/* 4 Octets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center">
            {[0, 1, 2, 3].map((octetIdx) => {
              const octetBits = calculations.binaryMask.slice(octetIdx * 8, (octetIdx + 1) * 8);
              return (
                <div key={octetIdx} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Oktet {octetIdx + 1}</p>
                  <div className="flex justify-center gap-0.5 tracking-widest font-bold">
                    {octetBits.map((bit, bitIdx) => {
                      const globalIdx = octetIdx * 8 + bitIdx;
                      const isNet = globalIdx < cidr;
                      return (
                        <span
                          key={bitIdx}
                          className={isNet ? 'text-tealbrand-400 font-extrabold' : 'text-amber-400'}
                        >
                          {bit}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calculated Parameters Grid */}
      {calculations && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Subnet Mask</p>
            <p className="font-mono text-base font-extrabold text-slate-900 mt-1">
              {calculations.subnetMask}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Wildcard: {calculations.wildcard}</p>
          </div>

          <div className="p-3.5 bg-tealbrand-50 rounded-xl border border-tealbrand-200">
            <p className="text-[10px] font-bold text-tealbrand-800 uppercase">Network ID (Alamat Jaringan)</p>
            <p className="font-mono text-base font-extrabold text-tealbrand-900 mt-1">
              {calculations.networkAddress}
            </p>
            <p className="text-[10px] text-tealbrand-700 mt-0.5">Identitas segmen lokal</p>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-[10px] font-bold text-amber-800 uppercase">Broadcast ID</p>
            <p className="font-mono text-base font-extrabold text-amber-900 mt-1">
              {calculations.broadcastAddress}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">Alamat kirim ke semua node</p>
          </div>

          <div className="p-3.5 bg-brand-50 rounded-xl border border-brand-200">
            <p className="text-[10px] font-bold text-brand-800 uppercase">Host Efektif (Usable)</p>
            <p className="font-mono text-base font-extrabold text-brand-900 mt-1">
              {calculations.usableHosts.toLocaleString('id-ID')} Host
            </p>
            <p className="text-[10px] text-brand-700 mt-0.5">Total slot: {calculations.totalHosts}</p>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3.5 bg-slate-100 rounded-xl border border-slate-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase">Rentang Alamat Host yang Valid:</span>
              <p className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                {calculations.firstHost} — {calculations.lastHost}
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
              {calculations.usableHosts} IP dapat dikonfigurasi ke perangkat
            </span>
          </div>
        </div>
      )}

      {/* Challenge Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-indigo-50 via-tealbrand-50 to-white border border-tealbrand-200 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-tealbrand-600" />
          <h4 className="font-bold text-sm text-slate-900">
            Tantangan Kasus: Desain Subnetting Laboratorium Sekolah
          </h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Sebuah ruang laboratorium komputer sekolah memiliki <strong>24 unit PC dan 1 Server</strong> (total 25 perangkat). Tentukan panjang prefix CIDR paling efisien yang dapat menampung kebutuhan tersebut tanpa membuang terlalu banyak IP!
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {[26, 27, 28, 29].map((p) => (
            <label
              key={p}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                quizAnswer === p
                  ? 'bg-tealbrand-600 text-white border-tealbrand-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="subnetQuiz"
                checked={quizAnswer === p}
                onChange={() => setQuizAnswer(p)}
                className="hidden"
              />
              <span>/{p} ({Math.pow(2, 32 - p) - 2} host)</span>
            </label>
          ))}

          <button
            onClick={handleVerifyQuiz}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              quizSolved
                ? 'bg-emerald-600 text-white'
                : 'bg-tealbrand-600 hover:bg-tealbrand-700 text-white shadow-sm'
            }`}
          >
            {quizSolved ? 'Benar Sekali! 🎉' : 'Periksa Jawaban'}
          </button>
        </div>
      </div>
    </div>
  );
}
