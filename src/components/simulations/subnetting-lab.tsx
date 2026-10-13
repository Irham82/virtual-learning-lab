'use client';

import React, { useState, useMemo } from 'react';
import {
  Binary,
  Calculator,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Network,
  Layers,
  Table,
  Volume2,
  Lightbulb,
  Radio,
  Server,
  Laptop,
  Check,
  ChevronRight,
  Hash,
} from 'lucide-react';
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

// Cheat Sheet reference for common IPv4 CIDR (/24 - /30)
const CIDR_CHEAT_SHEET = [
  { cidr: 24, mask: '255.255.255.0', x: 0, subnets: 1, y: 8, totalHosts: 256, usableHosts: 254, block: 256, binaryLast: '00000000' },
  { cidr: 25, mask: '255.255.255.128', x: 1, subnets: 2, y: 7, totalHosts: 128, usableHosts: 126, block: 128, binaryLast: '10000000' },
  { cidr: 26, mask: '255.255.255.192', x: 2, subnets: 4, y: 6, totalHosts: 64, usableHosts: 62, block: 64, binaryLast: '11000000' },
  { cidr: 27, mask: '255.255.255.224', x: 3, subnets: 8, y: 5, totalHosts: 32, usableHosts: 30, block: 32, binaryLast: '11100000' },
  { cidr: 28, mask: '255.255.255.240', x: 4, subnets: 16, y: 4, totalHosts: 16, usableHosts: 14, block: 16, binaryLast: '11110000' },
  { cidr: 29, mask: '255.255.255.248', x: 5, subnets: 32, y: 3, totalHosts: 8, usableHosts: 6, block: 8, binaryLast: '11111000' },
  { cidr: 30, mask: '255.255.255.252', x: 6, subnets: 64, y: 2, totalHosts: 4, usableHosts: 2, block: 4, binaryLast: '11111100' },
];

export function SubnettingLab({ onProgressUpdate }: SubnettingLabProps) {
  // Navigation tabs: 'kalkulator' | 'panduan' | 'cheatsheet' | 'latihan'
  const [activeTab, setActiveTab] = useState<'kalkulator' | 'panduan' | 'cheatsheet' | 'latihan'>('kalkulator');

  // Input states
  const [ipInput, setIpInput] = useState<string>('192.168.10.45');
  const [cidr, setCidr] = useState<number>(26);

  // Active guide sub-topic (1: Subnetting, 2: Jumlah Subnet, 3: IP Network, 4: Broadcast, 5: IP Valid)
  const [guideTopic, setGuideTopic] = useState<number>(1);

  // Practice / Quiz State
  const [practiceStep, setPracticeStep] = useState<number>(1);
  const [practiceAnswers, setPracticeAnswers] = useState<{
    mask?: string;
    subnets?: string;
    network?: string;
    broadcast?: string;
    validRange?: string;
  }>({});
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);

  // Validate IP
  const isValidIp = useMemo(() => {
    const parts = ipInput.split('.');
    if (parts.length !== 4) return false;
    return parts.every((p) => {
      const n = parseInt(p, 10);
      return !isNaN(n) && n >= 0 && n <= 255 && p === n.toString();
    });
  }, [ipInput]);

  // Calculations for current IP & CIDR
  const calculations = useMemo(() => {
    if (!isValidIp) return null;

    const parts = ipInput.split('.').map((p) => parseInt(p, 10));
    const firstOctet = parts[0];

    // Determine Class
    let ipClass = 'C';
    let defaultClassBits = 24;
    let defaultMask = '255.255.255.0';

    if (firstOctet < 128) {
      ipClass = 'A';
      defaultClassBits = 8;
      defaultMask = '255.0.0.0';
    } else if (firstOctet < 192) {
      ipClass = 'B';
      defaultClassBits = 16;
      defaultMask = '255.255.0.0';
    }

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

    // Values of x and y for formulas:
    // x = bit 1 pinjaman dari host (di oktet subnet)
    // Untuk Kelas C: x = cidr - 24 (jika cidr >= 24)
    const xBorrowed = Math.max(0, cidr - defaultClassBits);
    // y = bit 0 tersisa untuk host
    const yHostBits = 32 - cidr;

    // Subnets count: 2^x
    const subnetCount = Math.pow(2, xBorrowed);

    // Subnet mask string
    const subnetMaskStr = longToIp(maskLong);
    const maskOctets = subnetMaskStr.split('.').map((n) => parseInt(n, 10));

    // Determine active octet where subnetting happens (usually 4th octet for /24-/30)
    let activeOctetIndex = 3;
    if (cidr <= 16) activeOctetIndex = 1;
    else if (cidr <= 24) activeOctetIndex = 2;

    const activeMaskOctet = maskOctets[activeOctetIndex];
    // Interval Blok Subnet = 256 - mask octet (jika activeMaskOctet < 256)
    const blockInterval = 256 - activeMaskOctet;

    // Generate list of subnets in the active octet (limit display up to 8 rows for clarity)
    const subnetRows: {
      index: number;
      network: string;
      firstHost: string;
      lastHost: string;
      broadcast: string;
      isCurrent: boolean;
    }[] = [];

    // Prefix base IP up to active octet
    const baseOctets = [...parts];
    const maxSubnetsToGenerate = Math.min(16, subnetCount);

    for (let i = 0; i < maxSubnetsToGenerate; i++) {
      const netOctetVal = i * blockInterval;
      if (netOctetVal > 255) break;

      const subNetParts = [...baseOctets];
      subNetParts[activeOctetIndex] = netOctetVal;
      for (let k = activeOctetIndex + 1; k < 4; k++) subNetParts[k] = 0;

      const rowNetLong = ipToLong(subNetParts.join('.'));
      const rowBcLong = rowNetLong + blockInterval - 1;

      const isCurrentSubnet = ipLong >= rowNetLong && ipLong <= rowBcLong;

      subnetRows.push({
        index: i + 1,
        network: longToIp(rowNetLong),
        firstHost: longToIp(rowNetLong + 1),
        lastHost: longToIp(rowBcLong - 1),
        broadcast: longToIp(rowBcLong),
        isCurrent: isCurrentSubnet,
      });
    }

    return {
      ipClass,
      defaultClassBits,
      defaultMask,
      subnetMask: subnetMaskStr,
      wildcard: longToIp(wildcardLong),
      networkAddress: longToIp(networkLong),
      broadcastAddress: longToIp(broadcastLong),
      firstHost: usableHosts > 0 ? longToIp(firstHostLong) : 'None',
      lastHost: usableHosts > 0 ? longToIp(lastHostLong) : 'None',
      usableHosts,
      totalHosts,
      binaryMask,
      xBorrowed,
      yHostBits,
      subnetCount,
      activeMaskOctet,
      blockInterval,
      subnetRows,
    };
  }, [ipInput, cidr, isValidIp]);

  // Voice narration using Web Speech API
  const speakGuide = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Practice quiz handler
  const handleCheckPractice = (field: 'mask' | 'subnets' | 'network' | 'broadcast' | 'validRange', userVal: string, correctVal: string) => {
    if (userVal.trim().toLowerCase() === correctVal.trim().toLowerCase()) {
      setPracticeFeedback(`✅ Benar sekali! Jawaban: ${correctVal}`);
      confetti({ particleCount: 50, spread: 45 });
      if (practiceStep < 5) {
        setPracticeStep(practiceStep + 1);
      } else {
        setPracticeCompleted(true);
        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    } else {
      setPracticeFeedback(`❌ Kurang tepat. Coba periksa rumus di tab panduan dan ulangi lagi.`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-4 sm:p-6 space-y-6">
      {/* ============================================================== */}
      {/* 1. HEADER & MODE NAVIGATION TABS                               */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tealbrand-100 text-tealbrand-800 uppercase tracking-wide">
              Teknik Komputer &amp; Jaringan • SMK / Kuliah
            </span>
            <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Tutorial &amp; Kalkulator Interaktif
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Laboratorium Subnetting IPv4 &amp; Panduan Menghitung
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelajari cara menghitung Subnetting, Jumlah Subnet, IP Network, IP Broadcast, dan IP Valid secara tuntas langkah demi langkah!
          </p>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('kalkulator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'kalkulator'
                ? 'bg-tealbrand-600 text-white shadow-md shadow-tealbrand-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator Subnet</span>
          </button>

          <button
            onClick={() => setActiveTab('panduan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'panduan'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📖 Cara Menghitung (5 Elemen)</span>
          </button>

          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'cheatsheet'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabel Cheat Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('latihan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'latihan'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Latihan Mandiri</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB 1: KALKULATOR INTERAKTIF & TABEL SELURUH SUBNET         */}
      {/* ============================================================== */}
      {activeTab === 'kalkulator' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Alamat IPv4 Host:
              </label>
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value.trim())}
                placeholder="192.168.10.45"
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm border font-semibold outline-none transition-all ${
                  isValidIp
                    ? 'bg-white border-slate-300 focus:border-tealbrand-500 text-slate-900 shadow-sm'
                    : 'bg-rose-50 border-rose-400 text-rose-700'
                }`}
              />
              {!isValidIp && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Format IP salah! Masukkan 4 oktet desimal 0-255 (contoh: 192.168.10.45).
                </p>
              )}
            </div>

            <div className="md:col-span-6">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Prefix Panjang Subnet (CIDR):
                </label>
                <span className="font-mono text-sm font-extrabold text-tealbrand-700 bg-tealbrand-100 px-2.5 py-0.5 rounded-lg border border-tealbrand-300">
                  /{cidr} ({calculations?.subnetMask})
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
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>/8 (Class A)</span>
                <span>/16 (Class B)</span>
                <span>/24 (Class C)</span>
                <span>/26 (4 Subnet)</span>
                <span>/30 (P2P)</span>
              </div>
            </div>
          </div>

          {/* Binary Decomposition Visualizer */}
          {calculations && (
            <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl text-white space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Binary className="w-4 h-4 text-tealbrand-400" />
                  Dekomposisi Biner Netmask 32-Bit (CIDR /{cidr})
                </span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-tealbrand-400 inline-block"></span>
                    Bit Network ({cidr} bit bernilai 1)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    Bit Host ({32 - cidr} bit bernilai 0)
                  </span>
                </div>
              </div>

              {/* 4 Octets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center">
                {[0, 1, 2, 3].map((octetIdx) => {
                  const octetBits = calculations.binaryMask.slice(octetIdx * 8, (octetIdx + 1) * 8);
                  const maskVal = calculations.subnetMask.split('.')[octetIdx];
                  return (
                    <div key={octetIdx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase mb-1">
                        <span>Oktet {octetIdx + 1}</span>
                        <span className="font-bold text-tealbrand-300">{maskVal}</span>
                      </div>
                      <div className="flex justify-center gap-0.5 tracking-widest font-bold text-sm">
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

          {/* 5 Core Result Cards */}
          {calculations && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* Card 1: Subnet Mask */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-slate-600" />
                  1. Subnet Mask
                </span>
                <p className="font-mono text-base font-extrabold text-slate-900">
                  {calculations.subnetMask}
                </p>
                <p className="text-[10px] text-slate-500">CIDR: /{cidr} • Wildcard: {calculations.wildcard}</p>
              </div>

              {/* Card 2: Jumlah Subnet */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-1">
                <span className="text-[10px] font-bold text-indigo-800 uppercase flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  2. Jumlah Subnet (2ˣ)
                </span>
                <p className="font-mono text-base font-extrabold text-indigo-900">
                  {calculations.subnetCount.toLocaleString('id-ID')} Subnet
                </p>
                <p className="text-[10px] text-indigo-700">Rumus: 2^{calculations.xBorrowed} ({calculations.xBorrowed} bit pinjaman)</p>
              </div>

              {/* Card 3: IP Network */}
              <div className="p-4 bg-tealbrand-50 rounded-2xl border border-tealbrand-200 space-y-1">
                <span className="text-[10px] font-bold text-tealbrand-800 uppercase flex items-center gap-1">
                  <Network className="w-3.5 h-3.5 text-tealbrand-600" />
                  3. IP Network (ID)
                </span>
                <p className="font-mono text-base font-extrabold text-tealbrand-900">
                  {calculations.networkAddress}
                </p>
                <p className="text-[10px] text-tealbrand-700">Blok Interval: {calculations.blockInterval}</p>
              </div>

              {/* Card 4: IP Broadcast */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-amber-600" />
                  4. IP Broadcast
                </span>
                <p className="font-mono text-base font-extrabold text-amber-900">
                  {calculations.broadcastAddress}
                </p>
                <p className="text-[10px] text-amber-700">IP Terakhir di Subnet Ini</p>
              </div>

              {/* Card 5: IP Valid */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  5. IP Valid (Usable)
                </span>
                <p className="font-mono text-base font-extrabold text-emerald-900">
                  {calculations.usableHosts.toLocaleString('id-ID')} Host
                </p>
                <p className="text-[10px] text-emerald-700">Rumus: 2^{calculations.yHostBits} - 2</p>
              </div>

              {/* Full Width Valid Host Range Bar */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-5 p-4 bg-gradient-to-r from-tealbrand-50 via-emerald-50 to-indigo-50 rounded-2xl border border-tealbrand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-tealbrand-900 uppercase">
                    Rentang Alamat Host yang Valid (Dapat Dipasang ke Komputer):
                  </span>
                  <p className="font-mono text-base font-black text-slate-900 mt-0.5">
                    <span className="text-emerald-700 font-extrabold">{calculations.firstHost}</span>
                    <span className="text-slate-400 mx-2">—</span>
                    <span className="text-emerald-700 font-extrabold">{calculations.lastHost}</span>
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-sm">
                  Alamat IP input <strong>{ipInput}</strong> berada di subnet ini!
                </div>
              </div>
            </div>
          )}

          {/* Interactive Subnet Mapping Table */}
          {calculations && calculations.subnetRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-tealbrand-600" />
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Peta Pembagian Blok Subnet (Interval Kelipatan {calculations.blockInterval})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Menampilkan {calculations.subnetRows.length} dari total {calculations.subnetCount} subnet
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3">Subnet #</th>
                      <th className="py-2.5 px-3">IP Network (ID)</th>
                      <th className="py-2.5 px-3">Rentang Host Valid (Usable IP)</th>
                      <th className="py-2.5 px-3">IP Broadcast</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {calculations.subnetRows.map((row) => (
                      <tr
                        key={row.index}
                        className={`transition-colors ${
                          row.isCurrent
                            ? 'bg-tealbrand-50/90 font-bold text-tealbrand-950 border-l-4 border-l-tealbrand-600'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold">Subnet {row.index}</td>
                        <td className="py-2.5 px-3 text-brand-700 font-extrabold">{row.network}</td>
                        <td className="py-2.5 px-3 text-emerald-700">
                          {row.firstHost} — {row.lastHost}
                        </td>
                        <td className="py-2.5 px-3 text-amber-700 font-extrabold">{row.broadcast}</td>
                        <td className="py-2.5 px-3">
                          {row.isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tealbrand-600 text-white shadow-sm">
                              📍 Posisi IP Anda ({ipInput})
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Blok #{row.index}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB 2: PANDUAN CARA MENGHITUNG (5 ELEMEN SUBNETTING)        */}
      {/* ============================================================== */}
      {activeTab === 'panduan' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Guide Header Banner */}
          <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-tealbrand-300 font-bold uppercase tracking-wider">
                Panduan Edukatif Guru TKJ &amp; Jaringan
              </span>
              <h3 className="text-lg sm:text-xl font-black mt-1 text-white">
                5 Langkah Pasti Menghitung Subnetting IPv4
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Pahami konsep matematis di balik pembagian jaringan: cara mencari Subnet Mask, Jumlah Subnet, IP Network, IP Broadcast, dan Rentang IP Valid secara terstruktur!
              </p>
            </div>
            <button
              onClick={() =>
                speakGuide(
                  `Dalam subnetting, ada lima hal utama yang wajib dihitung. Pertama, Subnet Mask dari panjang prefix C I D R. Kedua, Jumlah Subnet dengan rumus dua pangkat x. Ketiga, IP Network menggunakan interval blok subnet dua ratus lima puluh enam dikurangi mask. Keempat, IP Broadcast yaitu alamat tertinggi di dalam subnet. Kelima, IP Valid yaitu rentang host yang bisa dipasang ke komputer dengan rumus dua pangkat y dikurangi dua.`
                )
              }
              className="px-4 py-2 rounded-xl bg-tealbrand-500 hover:bg-tealbrand-400 text-slate-950 text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-lg transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>🔊 Dengarkan Audio Panduan</span>
            </button>
          </div>

          {/* 5 Topic Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-2 border-b border-slate-200">
            {[
              { id: 1, title: '1. Subnetting & Mask', desc: 'Konversi CIDR & Biner' },
              { id: 2, title: '2. Jumlah Subnet', desc: 'Rumus 2ˣ (Bit Pinjaman)' },
              { id: 3, title: '3. IP Network', desc: 'Interval 256 - Mask' },
              { id: 4, title: '4. IP Broadcast', desc: 'Alamat Akhir Subnet' },
              { id: 5, title: '5. IP Valid (Host)', desc: 'Rumus 2ʸ - 2 & Rentang' },
            ].map((topic) => (
              <button
                key={topic.id}
                onClick={() => setGuideTopic(topic.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  guideTopic === topic.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-mono opacity-80 uppercase block">{topic.desc}</span>
                <h4 className="font-bold text-xs sm:text-sm mt-0.5">{topic.title}</h4>
              </button>
            ))}
          </div>

          {/* Topic 1: Subnetting & Subnet Mask */}
          {guideTopic === 1 && (
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 text-brand-700">
                <Hash className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Langkah 1: Memahami Subnetting &amp; Menghitung Subnet Mask
                </h3>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  <strong>Subnetting</strong> adalah teknik membagi satu jaringan besar (Network) menjadi beberapa sub-jaringan (Subnet) yang lebih kecil. Tujuannya adalah untuk menghemat pemborosan alamat IP, mengurangi lalu lintas *broadcast* yang berat, dan meningkatkan keamanan jaringan.
                </p>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-xs">Cara Menghitung Subnet Mask dari Prefix CIDR (Contoh /{cidr}):</h4>
                  <ol className="list-decimal list-inside space-y-1.5 pl-2">
                    <li>
                      <strong>Tuliskan angka biner 1 sebanyak nilai CIDR:</strong> Prefix /{cidr} berarti ada <strong>{cidr} bit bernilai 1</strong> dan sisanya ({32 - cidr} bit) bernilai 0.
                    </li>
                    <li>
                      <strong>Bagi menjadi 4 kelompok (oktet) beranggotakan 8 bit:</strong>
                      <div className="bg-slate-900 text-tealbrand-400 font-mono p-2.5 rounded-lg mt-1 text-[11px]">
                        {calculations?.binaryMask.slice(0, 8).join('')}.
                        {calculations?.binaryMask.slice(8, 16).join('')}.
                        {calculations?.binaryMask.slice(16, 24).join('')}.
                        {calculations?.binaryMask.slice(24, 32).join('')}
                      </div>
                    </li>
                    <li>
                      <strong>Konversikan setiap oktet 8-bit ke bilangan desimal:</strong>
                      <p className="mt-1">Gunakan bobot nilai 8-bit biner: <strong>128, 64, 32, 16, 8, 4, 2, 1</strong>.</p>
                      <div className="overflow-x-auto mt-2">
                        <table className="w-full text-center border text-[11px] font-mono">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="border p-1">Bit ke-</th>
                              <th className="border p-1">1</th>
                              <th className="border p-1">2</th>
                              <th className="border p-1">3</th>
                              <th className="border p-1">4</th>
                              <th className="border p-1">5</th>
                              <th className="border p-1">6</th>
                              <th className="border p-1">7</th>
                              <th className="border p-1">8</th>
                              <th className="border p-1 bg-tealbrand-100 text-tealbrand-900">Total Desimal</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border p-1 font-bold">Bobot Nilai</td>
                              <td className="border p-1 font-bold">128</td>
                              <td className="border p-1 font-bold">64</td>
                              <td className="border p-1 font-bold">32</td>
                              <td className="border p-1 font-bold">16</td>
                              <td className="border p-1 font-bold">8</td>
                              <td className="border p-1 font-bold">4</td>
                              <td className="border p-1 font-bold">2</td>
                              <td className="border p-1 font-bold">1</td>
                              <td className="border p-1 bg-tealbrand-50 font-black text-tealbrand-700">{calculations?.activeMaskOctet}</td>
                            </tr>
                            <tr>
                              <td className="border p-1 font-bold">Oktet 4 (/{cidr})</td>
                              {calculations?.binaryMask.slice(24, 32).map((b, i) => (
                                <td key={i} className={`border p-1 font-extrabold ${b === '1' ? 'text-tealbrand-600 bg-tealbrand-50' : 'text-slate-400'}`}>
                                  {b}
                                </td>
                              ))}
                              <td className="border p-1 font-bold bg-tealbrand-50 text-tealbrand-800">
                                {calculations?.activeMaskOctet}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </li>
                  </ol>
                  <p className="text-slate-800 font-bold mt-2">
                    Maka Subnet Mask untuk <strong>/{cidr}</strong> adalah: <span className="font-mono text-tealbrand-700 bg-tealbrand-100 px-2 py-0.5 rounded">{calculations?.subnetMask}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Topic 2: Jumlah Subnet (2^x) */}
          {guideTopic === 2 && (
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 text-indigo-700">
                <Layers className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Langkah 2: Menghitung Jumlah Subnet (Rumus 2ˣ)
                </h3>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-3">
                <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 shadow-md">
                  <p className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">Rumus Matematika Subnet:</p>
                  <p className="text-2xl font-black font-mono text-amber-300 my-1">
                    Jumlah Subnet = 2ˣ
                  </p>
                  <p className="text-xs text-indigo-200">
                    di mana <strong className="text-white">x</strong> adalah <strong>banyaknya bit biner 1 yang dipinjam</strong> dari porsi host kelas asalnya (pada oktet terakhir untuk Kelas C).
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-xs">Penerapan pada IP {ipInput}/{cidr}:</h4>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>
                      Alamat IP <strong>{ipInput}</strong> termasuk <strong>Kelas {calculations?.ipClass}</strong> (Default prefix: /{calculations?.defaultClassBits}).
                    </li>
                    <li>
                      Panjang prefix yang dipilih adalah <strong>/{cidr}</strong>.
                    </li>
                    <li>
                      Maka bit subnet yang dipinjam adalah:
                      <div className="font-mono bg-slate-100 p-2 rounded-lg text-slate-800 font-bold mt-1">
                        x = {cidr} - {calculations?.defaultClassBits} = {calculations?.xBorrowed} bit pinjaman
                      </div>
                    </li>
                    <li>
                      Masukkan ke rumus:
                      <div className="font-mono bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-800 font-black text-sm mt-1">
                        Jumlah Subnet = 2^{calculations?.xBorrowed} = {calculations?.subnetCount} Subnet
                      </div>
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-500">
                    Artinya, satu jaringan kelas {calculations?.ipClass} berhasil dipecah menjadi tepat <strong>{calculations?.subnetCount} kelompok sub-jaringan</strong> mandiri!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Topic 3: IP Network (256 - Mask) */}
          {guideTopic === 3 && (
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 text-tealbrand-700">
                <Network className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Langkah 3: Menghitung IP Network (Alamat Jaringan)
                </h3>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  <strong>IP Network (Network Address / Network ID)</strong> adalah alamat pertama dalam sebuah subnet yang bertindak sebagai nama pengenal segmen jaringan tersebut. IP Network <strong>tidak boleh</strong> dipasang pada perangkat komputer/host.
                </p>

                <div className="bg-tealbrand-950 text-white p-4 rounded-xl border border-tealbrand-900 shadow-md">
                  <p className="text-[11px] uppercase tracking-wider text-tealbrand-300 font-bold">Rumus Interval Blok Subnet:</p>
                  <p className="text-2xl font-black font-mono text-amber-300 my-1">
                    Blok Subnet = 256 - Nilai Oktet Subnet Mask
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-xs">Perhitungan Praktis:</h4>
                  <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>
                      Nilai oktet terakhir subnet mask /{cidr} adalah <strong>{calculations?.activeMaskOctet}</strong>.
                    </li>
                    <li>
                      Hitung jarak blok:
                      <div className="font-mono bg-slate-100 p-2 rounded-lg text-slate-800 font-bold">
                        Blok Interval = 256 - {calculations?.activeMaskOctet} = {calculations?.blockInterval}
                      </div>
                    </li>
                    <li>
                      Tuliskan kelipatan blok subnet mulai dari angka 0:
                      <div className="font-mono bg-slate-900 text-tealbrand-300 p-2.5 rounded-lg text-[11px] mt-1">
                        0, {calculations?.blockInterval}, {(calculations?.blockInterval || 0) * 2}, {(calculations?.blockInterval || 0) * 3}, ...
                      </div>
                    </li>
                    <li>
                      Cari di kelipatan manakah oktet ke-4 dari IP Anda (<strong>{ipInput.split('.')[3]}</strong>) berada:
                      <p className="mt-1">
                        Angka {ipInput.split('.')[3]} berada di dalam rentang blok{' '}
                        <strong>{calculations?.networkAddress.split('.')[3]}</strong> sampai{' '}
                        <strong>{calculations?.broadcastAddress.split('.')[3]}</strong>.
                      </p>
                    </li>
                  </ol>
                  <div className="p-3 bg-tealbrand-50 border border-tealbrand-200 rounded-xl font-bold text-tealbrand-900">
                    🎯 Jadi, IP Network untuk {ipInput}/{cidr} adalah: <span className="font-mono text-base font-black text-brand-700">{calculations?.networkAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Topic 4: IP Broadcast */}
          {guideTopic === 4 && (
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-700">
                <Radio className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Langkah 4: Menghitung IP Broadcast
                </h3>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  <strong>IP Broadcast (Broadcast Address)</strong> adalah alamat tertinggi/terakhir di dalam satu subnet. Alamat ini digunakan untuk mengirimkan pesan satu arah ke <em>seluruh komputer</em> di dalam subnet yang sama secara serentak (misalnya pesan pencarian ARP atau DHCP). IP Broadcast juga <strong>tidak boleh</strong> dipasang pada perangkat komputer.
                </p>

                <div className="bg-amber-950 text-white p-4 rounded-xl border border-amber-900 shadow-md">
                  <p className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Rumus Cepat IP Broadcast:</p>
                  <p className="text-xl font-black font-mono text-amber-200 my-1">
                    IP Broadcast = IP Network Subnet Berikutnya - 1
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-xs">Contoh Penerapan:</h4>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>
                      Subnet saat ini memiliki IP Network: <strong>{calculations?.networkAddress}</strong>.
                    </li>
                    <li>
                      Subnet berikutnya dimulai pada: <strong>{calculations?.networkAddress.split('.').slice(0, 3).join('.')}.{(parseInt(calculations?.networkAddress.split('.')[3] || '0') + (calculations?.blockInterval || 0))}</strong>.
                    </li>
                    <li>
                      Kurangkan 1 dari alamat network subnet berikutnya:
                      <div className="font-mono bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-900 font-bold text-sm mt-1">
                        IP Broadcast = {calculations?.broadcastAddress}
                      </div>
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-500">
                    Secara biner, IP Broadcast terbentuk ketika <strong>seluruh bit host bernilai 1</strong> (semuanya aktif).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Topic 5: IP Valid & Rentang Host */}
          {guideTopic === 5 && (
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Langkah 5 &amp; 6: Menghitung Jumlah Host &amp; Rentang IP Valid
                </h3>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  <strong>IP Valid (Usable IP / Host Valid)</strong> adalah rentang alamat IP yang benar-benar <strong>sah dan dapat dikonfigurasikan</strong> pada kartu jaringan (NIC) komputer klien, printer, smartphone, server, atau interface router.
                </p>

                <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-900 shadow-md">
                  <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Rumus Jumlah Host Valid Per Subnet:</p>
                  <p className="text-2xl font-black font-mono text-amber-300 my-1">
                    Jumlah Host Valid = 2ʸ - 2
                  </p>
                  <p className="text-xs text-emerald-200">
                    di mana <strong className="text-white">y</strong> adalah banyaknya bit 0 (bit host). Dikurangi 2 karena 1 IP untuk Network ID dan 1 IP untuk Broadcast ID.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-xs">Cara Menentukan Rentang Alamat Host:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">IP Host Pertama (First Host):</span>
                      <p className="font-mono text-sm font-black text-emerald-700 mt-1">
                        IP Network + 1
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {calculations?.networkAddress} + 1 = <strong>{calculations?.firstHost}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">IP Host Terakhir (Last Host):</span>
                      <p className="font-mono text-sm font-black text-emerald-700 mt-1">
                        IP Broadcast - 1
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {calculations?.broadcastAddress} - 1 = <strong>{calculations?.lastHost}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-emerald-900">
                      ✅ Rentang Lengkap IP Valid untuk {ipInput}/{cidr}:
                    </p>
                    <p className="font-mono text-base font-black text-emerald-800">
                      {calculations?.firstHost} s/d {calculations?.lastHost}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Total ada <strong>{calculations?.usableHosts} unit perangkat</strong> yang dapat saling terhubung di dalam subnet ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 3: CHEAT SHEET SUBNETTING KELAS C                       */}
      {/* ============================================================== */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600" />
                Tabel Cheat Sheet Subnetting IPv4 Kelas C (/24 hingga /30)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan tabel ringkas ini untuk menghafal pola subnetting dengan cepat saat ujian atau ujian kompetensi keahlian (UKK).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-indigo-950 text-white text-[11px]">
                <tr>
                  <th className="py-3 px-3">CIDR</th>
                  <th className="py-3 px-3">Subnet Mask</th>
                  <th className="py-3 px-3">Bit Pinjam (x)</th>
                  <th className="py-3 px-3">Subnet (2ˣ)</th>
                  <th className="py-3 px-3">Host Bit (y)</th>
                  <th className="py-3 px-3">Host Valid (2ʸ - 2)</th>
                  <th className="py-3 px-3">Interval Blok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {CIDR_CHEAT_SHEET.map((row) => (
                  <tr
                    key={row.cidr}
                    className={`hover:bg-indigo-50/50 transition-colors ${
                      cidr === row.cidr ? 'bg-indigo-50 font-bold border-l-4 border-l-indigo-600 text-indigo-950' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-3 font-extrabold text-indigo-700">/{row.cidr}</td>
                    <td className="py-3 px-3">{row.mask}</td>
                    <td className="py-3 px-3 text-slate-600">{row.x} bit</td>
                    <td className="py-3 px-3 text-brand-700 font-bold">{row.subnets}</td>
                    <td className="py-3 px-3 text-slate-600">{row.y} bit</td>
                    <td className="py-3 px-3 text-emerald-700 font-bold">{row.usableHosts} Host</td>
                    <td className="py-3 px-3 text-amber-700 font-extrabold">{row.block}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Trik Menghafal Cepat:
            </p>
            <p>
              • Setiap kali prefix CIDR bertambah 1 bit (misal dari /24 ke /25), jumlah subnet <strong>berkali lipat 2</strong> (1 jadi 2, 2 jadi 4, dst).
            </p>
            <p>
              • Sebaliknya, jumlah host valid akan <strong>terbelah dua</strong> (254 jadi 126, 126 jadi 62, 62 jadi 30, dst).
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB 4: LATIHAN MANDIRI STEP-BY-STEP                         */}
      {/* ============================================================== */}
      {activeTab === 'latihan' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">
                Studi Kasus Uji Pemahaman Mandiri
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                Hitung Soal Subnetting: <span className="font-mono text-brand-700">192.168.1.100 /27</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Ikuti langkah 1 sampai 5 untuk menguji apakah Anda sudah menguasai rumus subnetting!
              </p>
            </div>
            <button
              onClick={() => {
                setPracticeStep(1);
                setPracticeAnswers({});
                setPracticeFeedback(null);
                setPracticeCompleted(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1 self-start sm:self-auto shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Soal</span>
            </button>
          </div>

          {/* Step Progress Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap ${
                  practiceStep === s
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : practiceStep > s
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span>Langkah {s}</span>
                {practiceStep > s && <Check className="w-3 h-3" />}
              </div>
            ))}
          </div>

          {/* Interactive Steps Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            {/* Step 1 */}
            {practiceStep === 1 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Langkah 1: Berapakah Subnet Mask untuk prefix /27?
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['255.255.255.192', '255.255.255.224', '255.255.255.240', '255.255.255.248'].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleCheckPractice('mask', ans, '255.255.255.224')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-tealbrand-50 hover:border-tealbrand-500 border border-slate-200 font-mono font-bold text-slate-800 transition-all text-center"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {practiceStep === 2 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Langkah 2: Berapa Jumlah Subnet (2ˣ) yang terbentuk pada Kelas C prefix /27?
                </h4>
                <p className="text-xs text-slate-500">Petunjuk: Bit pinjaman x = 27 - 24 = 3 bit.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['4 Subnet', '8 Subnet', '16 Subnet', '32 Subnet'].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleCheckPractice('subnets', ans, '8 Subnet')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-tealbrand-50 hover:border-tealbrand-500 border border-slate-200 font-mono font-bold text-slate-800 transition-all text-center"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {practiceStep === 3 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Langkah 3: Berapakah IP Network untuk IP 192.168.1.100 /27?
                </h4>
                <p className="text-xs text-slate-500">
                  Petunjuk: Interval blok = 256 - 224 = 32. Kelipatan: 0, 32, 64, 96, 128... Angka 100 berada di blok mana?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['192.168.1.64', '192.168.1.96', '192.168.1.100', '192.168.1.128'].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleCheckPractice('network', ans, '192.168.1.96')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-tealbrand-50 hover:border-tealbrand-500 border border-slate-200 font-mono font-bold text-slate-800 transition-all text-center"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 */}
            {practiceStep === 4 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Langkah 4: Berapakah IP Broadcast untuk subnet tempat 192.168.1.100 berada?
                </h4>
                <p className="text-xs text-slate-500">
                  Petunjuk: Subnet berikutnya adalah 192.168.1.128. Maka Broadcast = 128 - 1.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['192.168.1.126', '192.168.1.127', '192.168.1.128', '192.168.1.255'].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleCheckPractice('broadcast', ans, '192.168.1.127')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-tealbrand-50 hover:border-tealbrand-500 border border-slate-200 font-mono font-bold text-slate-800 transition-all text-center"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 */}
            {practiceStep === 5 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Langkah 5: Berapakah rentang IP Valid (Usable Host) untuk subnet ini?
                </h4>
                <p className="text-xs text-slate-500">
                  Petunjuk: Dari IP Network + 1 sampai IP Broadcast - 1.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    '192.168.1.96 s/d 192.168.1.127',
                    '192.168.1.97 s/d 192.168.1.126',
                    '192.168.1.65 s/d 192.168.1.94',
                    '192.168.1.1 s/d 192.168.1.30',
                  ].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleCheckPractice('validRange', ans, '192.168.1.97 s/d 192.168.1.126')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-tealbrand-50 hover:border-tealbrand-500 border border-slate-200 font-mono font-bold text-slate-800 transition-all text-center"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Alert */}
            {practiceFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold animate-in fade-in ${
                  practiceFeedback.startsWith('✅')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {practiceFeedback}
              </div>
            )}

            {practiceCompleted && (
              <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>Selamat! Anda telah menguasai seluruh 5 langkah cara menghitung subnetting!</span>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-emerald-100">100% Selesai ⭐</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
