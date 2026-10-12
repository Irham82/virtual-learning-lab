'use client';

import React, { useState } from 'react';
import { Network, Laptop, Server, Router, Radio, Play, RotateCcw, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

interface DeviceNode {
  id: string;
  name: string;
  type: 'pc' | 'switch' | 'server' | 'router';
  ip: string;
  x: number;
  y: number;
  isOnline: boolean;
}

interface ConnectionLink {
  from: string;
  to: string;
}

const INITIAL_NODES: DeviceNode[] = [
  { id: 'sw1', name: 'Switch-Pusat', type: 'switch', ip: '192.168.1.1', x: 350, y: 180, isOnline: true },
  { id: 'pc1', name: 'PC-Klien 1', type: 'pc', ip: '192.168.1.10', x: 140, y: 90, isOnline: true },
  { id: 'pc2', name: 'PC-Klien 2', type: 'pc', ip: '192.168.1.11', x: 140, y: 260, isOnline: true },
  { id: 'pc3', name: 'PC-Klien 3', type: 'pc', ip: '192.168.1.12', x: 350, y: 320, isOnline: true },
  { id: 'srv1', name: 'Server-Web', type: 'server', ip: '192.168.1.100', x: 560, y: 90, isOnline: true },
  { id: 'rt1', name: 'Router-GW', type: 'router', ip: '192.168.1.254', x: 560, y: 260, isOnline: true },
];

const INITIAL_LINKS: ConnectionLink[] = [
  { from: 'pc1', to: 'sw1' },
  { from: 'pc2', to: 'sw1' },
  { from: 'pc3', to: 'sw1' },
  { from: 'srv1', to: 'sw1' },
  { from: 'rt1', to: 'sw1' },
];

export function NetworkTopologyLab({ onProgressUpdate }: { onProgressUpdate?: () => void }) {
  const [nodes, setNodes] = useState<DeviceNode[]>(INITIAL_NODES);
  const [links, setLinks] = useState<ConnectionLink[]>(INITIAL_LINKS);
  const [selectedSource, setSelectedSource] = useState<string>('pc1');
  const [selectedDest, setSelectedDest] = useState<string>('srv1');
  const [isSimulatingPing, setIsSimulatingPing] = useState<boolean>(false);
  const [pingConsoleLogs, setPingConsoleLogs] = useState<string[]>([
    'Virtual Network Terminal Siap. Pilih pengirim dan tujuan lalu klik "Kirim Tes Ping".',
  ]);
  const [packetProgress, setPacketProgress] = useState<number>(0);

  const toggleNodeStatus = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isOnline: !n.isOnline } : n))
    );
  };

  const handleRunPing = () => {
    if (isSimulatingPing) return;

    const srcNode = nodes.find((n) => n.id === selectedSource);
    const dstNode = nodes.find((n) => n.id === selectedDest);
    const switchNode = nodes.find((n) => n.id === 'sw1');

    if (!srcNode || !dstNode) return;

    setIsSimulatingPing(true);
    setPacketProgress(0);

    const newLogs = [
      `PING ${dstNode.ip} (${dstNode.name}) dari ${srcNode.ip} (${srcNode.name}): 32 bytes of data.`,
    ];
    setPingConsoleLogs(newLogs);

    // Simulate animated packet progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setPacketProgress(prog);

      if (prog >= 100) {
        clearInterval(interval);
        setIsSimulatingPing(false);

        // Check if communication succeeds
        const isSrcConnected = links.some(
          (l) => (l.from === srcNode.id && l.to === 'sw1') || (l.to === srcNode.id && l.from === 'sw1')
        );
        const isDstConnected = links.some(
          (l) => (l.from === dstNode.id && l.to === 'sw1') || (l.to === dstNode.id && l.from === 'sw1')
        );

        if (!srcNode.isOnline) {
          setPingConsoleLogs((prev) => [
            ...prev,
            `Gagal: Perangkat pengirim (${srcNode.name}) dalam kondisi offline/mati!`,
            '100% packet loss.',
          ]);
        } else if (!switchNode?.isOnline) {
          setPingConsoleLogs((prev) => [
            ...prev,
            'Request timed out (RTO). Switch Konsentrator mati (Single Point of Failure)!',
            'Paket ICMP hilang di perjalanan. 100% packet loss.',
          ]);
        } else if (!dstNode.isOnline) {
          setPingConsoleLogs((prev) => [
            ...prev,
            `Request timed out (RTO). Tujuan ${dstNode.ip} tidak merespons (Offline).`,
            '100% packet loss.',
          ]);
        } else if (!isSrcConnected || !isDstConnected) {
          setPingConsoleLogs((prev) => [
            ...prev,
            'Destination Host Unreachable. Kabel jaringan tidak terhubung ke konsentrator switch.',
            '100% packet loss.',
          ]);
        } else {
          setPingConsoleLogs((prev) => [
            ...prev,
            `Balasan dari ${dstNode.ip}: bytes=32 waktu=1.8ms TTL=64`,
            `Balasan dari ${dstNode.ip}: bytes=32 waktu=1.6ms TTL=64`,
            `Status: Sukses! Paket berhasil dikirim dan diterima kembali (0% loss).`,
          ]);
          if (onProgressUpdate) {
            onProgressUpdate();
          }
        }
      }
    }, 120);
  };

  const getNodeIcon = (type: string, isOnline: boolean) => {
    const colorClass = isOnline ? 'text-tealbrand-400' : 'text-slate-500';
    switch (type) {
      case 'pc':
        return <Laptop className={`w-6 h-6 ${colorClass}`} />;
      case 'server':
        return <Server className={`w-6 h-6 ${colorClass}`} />;
      case 'router':
        return <Router className={`w-6 h-6 ${colorClass}`} />;
      case 'switch':
        return <Radio className={`w-7 h-7 ${isOnline ? 'text-amber-400' : 'text-slate-500'}`} />;
      default:
        return <Laptop className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Network className="w-5 h-5 text-tealbrand-400" />
            Simulator Topologi Jaringan &amp; Paket ICMP Ping
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Rancang topologi star, uji konektivitas paket data, dan simulasikan dampak kegagalan perangkat (Single Point of Failure).
          </p>
        </div>

        <button
          onClick={() => {
            setNodes(INITIAL_NODES);
            setLinks(INITIAL_LINKS);
            setPingConsoleLogs(['Jaringan di-reset ke kondisi awal. Semua perangkat online.']);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Topologi
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-slate-800/80">
            <span>Kanvas Topologi Bintang (Star Topology)</span>
            <span className="text-[11px] text-tealbrand-400 font-mono">Status: LIVE SIMULATION</span>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-950/80 rounded-lg overflow-hidden border border-slate-900 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Draw link lines */}
              {links.map((link, idx) => {
                const nFrom = nodes.find((n) => n.id === link.from);
                const nTo = nodes.find((n) => n.id === link.to);
                if (!nFrom || !nTo) return null;

                const isLinkActive = nFrom.isOnline && nTo.isOnline;
                return (
                  <line
                    key={`line-${idx}`}
                    x1={`${(nFrom.x / 700) * 100}%`}
                    y1={`${(nFrom.y / 400) * 100}%`}
                    x2={`${(nTo.x / 700) * 100}%`}
                    y2={`${(nTo.y / 400) * 100}%`}
                    stroke={isLinkActive ? '#38bdf8' : '#475569'}
                    strokeWidth="2.5"
                    strokeDasharray={isLinkActive ? 'none' : '4,4'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Animated ping packet dot if simulating */}
              {isSimulatingPing && (
                <circle
                  cx={`${(350 / 700) * 100}%`}
                  cy={`${(180 / 400) * 100}%`}
                  r="6"
                  fill="#fbbf24"
                  className="animate-ping"
                />
              )}
            </svg>

            {/* Render Nodes as Interactive Buttons */}
            {nodes.map((node) => {
              const leftPct = (node.x / 700) * 100;
              const topPct = (node.y / 400) * 100;

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="flex flex-col items-center group z-10"
                >
                  <button
                    onClick={() => toggleNodeStatus(node.id)}
                    title={`Klik untuk mematikan/menghidupkan ${node.name}`}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border-2 ${
                      node.isOnline
                        ? 'bg-slate-900 border-tealbrand-500/80 hover:border-tealbrand-400 hover:scale-110 shadow-tealbrand-500/20'
                        : 'bg-slate-950 border-rose-600/70 opacity-60'
                    }`}
                  >
                    {getNodeIcon(node.type, node.isOnline)}
                  </button>

                  <div className="mt-1.5 text-center pointer-events-none">
                    <p className="text-[11px] font-bold text-slate-200 tracking-tight">{node.name}</p>
                    <p className="text-[9px] font-mono text-slate-400">{node.ip}</p>
                    <span
                      className={`text-[9px] px-1 rounded font-bold ${
                        node.isOnline ? 'text-tealbrand-400 bg-tealbrand-950/70' : 'text-rose-400 bg-rose-950/70'
                      }`}
                    >
                      {node.isOnline ? 'Online' : 'Mati'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            💡 <em>Klik ikon perangkat mana pun untuk mematikan / menghidupkannya dan menguji redundansi jaringan.</em>
          </p>
        </div>

        {/* Ping Controller & Console (4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Controls */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Uji Komunikasi ICMP (Ping)
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Pengirim (Source):</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  {nodes
                    .filter((n) => n.type === 'pc')
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.ip})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tujuan (Destination):</label>
                <select
                  value={selectedDest}
                  onChange={(e) => setSelectedDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  {nodes
                    .filter((n) => n.id !== selectedSource)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.ip})
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={handleRunPing}
                disabled={isSimulatingPing}
                className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isSimulatingPing
                    ? 'bg-amber-600 text-white cursor-wait'
                    : 'bg-brand-600 hover:bg-brand-500 text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSimulatingPing ? 'Mengirim Paket...' : 'Kirim Tes Ping'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Console */}
          <div className="bg-black/90 p-3.5 rounded-xl border border-slate-800 font-mono text-xs flex-1 flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span>Terminal Jaringan</span>
              <span className="w-2 h-2 rounded-full bg-tealbrand-400 animate-pulse"></span>
            </div>

            <div className="space-y-1.5 my-2 overflow-y-auto max-h-[130px] text-slate-300 text-[11px] leading-relaxed">
              {pingConsoleLogs.map((log, i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="text-tealbrand-500">$</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-600 border-t border-slate-800/80 pt-1">
              Virtual Packet Flow Engine v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
