'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Network,
  Laptop,
  Server,
  Router,
  Radio,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Settings,
  Zap,
  Cable,
  Sparkles,
  Layers,
  X,
  Power,
  Info,
  Check,
  MousePointer,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type DeviceType = 'pc' | 'switch' | 'server' | 'router';
export type CableType = 'straight' | 'cross';

export interface DeviceNode {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  mask: string;
  gateway: string;
  x: number;
  y: number;
  isOnline: boolean;
}

export interface CableLink {
  id: string;
  from: string;
  to: string;
  cableType: CableType;
}

const DEFAULT_DEVICES: DeviceNode[] = [
  { id: 'sw1', name: 'Switch-Pusat', type: 'switch', ip: '192.168.1.1', mask: '255.255.255.0', gateway: '', x: 380, y: 190, isOnline: true },
  { id: 'pc1', name: 'PC-1', type: 'pc', ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.254', x: 160, y: 100, isOnline: true },
  { id: 'pc2', name: 'PC-2', type: 'pc', ip: '192.168.1.11', mask: '255.255.255.0', gateway: '192.168.1.254', x: 160, y: 280, isOnline: true },
  { id: 'srv1', name: 'Web-Server', type: 'server', ip: '192.168.1.100', mask: '255.255.255.0', gateway: '192.168.1.254', x: 600, y: 100, isOnline: true },
  { id: 'rt1', name: 'Router-GW', type: 'router', ip: '192.168.1.254', mask: '255.255.255.0', gateway: '0.0.0.0', x: 600, y: 280, isOnline: true },
];

const DEFAULT_LINKS: CableLink[] = [
  { id: 'link-1', from: 'pc1', to: 'sw1', cableType: 'straight' },
  { id: 'link-2', from: 'pc2', to: 'sw1', cableType: 'straight' },
  { id: 'link-3', from: 'srv1', to: 'sw1', cableType: 'straight' },
  { id: 'link-4', from: 'rt1', to: 'sw1', cableType: 'straight' },
];

export function NetworkTopologyLab({ onProgressUpdate }: { onProgressUpdate?: () => void }) {
  // Main view mode: 'studio' (Packet Tracer builder) | 'simulation' (ICMP Ping test) | 'templates' (Topology Gallery)
  const [viewMode, setViewMode] = useState<'studio' | 'simulation' | 'templates'>('studio');

  // Network State
  const [nodes, setNodes] = useState<DeviceNode[]>(DEFAULT_DEVICES);
  const [links, setLinks] = useState<CableLink[]>(DEFAULT_LINKS);

  // Selected tool in builder: 'select' | 'pc' | 'switch' | 'server' | 'router' | 'cable-straight' | 'cable-cross' | 'delete'
  const [activeTool, setActiveTool] = useState<string>('select');

  // Cable wiring state: first node selected when linking
  const [cableSourceNodeId, setCableSourceNodeId] = useState<string | null>(null);

  // Device configuration modal
  const [editingNode, setEditingNode] = useState<DeviceNode | null>(null);

  // Dragging node on canvas
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Ping / Packet Simulation State
  const [pingSourceId, setPingSourceId] = useState<string>('pc1');
  const [pingDestId, setPingDestId] = useState<string>('srv1');
  const [isSimulatingPing, setIsSimulatingPing] = useState<boolean>(false);
  const [packetProgress, setPacketProgress] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Cisco Packet Tracer Virtual Engine Siap. Rancang topologi atau kirim paket ICMP Ping.',
  ]);

  // Cable verification message
  const [cableFeedback, setCableFeedback] = useState<string | null>(null);

  // =========================================================================
  // DRAG & DROP ON CANVAS
  // =========================================================================
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If user clicked canvas with an insertion tool, place device
    if (['pc', 'switch', 'server', 'router'].includes(activeTool) && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Bound within canvas
      const boundedX = Math.max(50, Math.min(rect.width - 50, clickX));
      const boundedY = Math.max(50, Math.min(rect.height - 50, clickY));

      const type = activeTool as DeviceType;
      const count = nodes.filter((n) => n.type === type).length + 1;
      const newId = `${type}-${Date.now().toString().slice(-4)}`;

      let defaultName = `PC-${count}`;
      let defaultIp = `192.168.1.${20 + count}`;
      if (type === 'switch') {
        defaultName = `Switch-${count}`;
        defaultIp = `192.168.1.${count}`;
      } else if (type === 'server') {
        defaultName = `Server-${count}`;
        defaultIp = `192.168.1.${100 + count}`;
      } else if (type === 'router') {
        defaultName = `Router-${count}`;
        defaultIp = `192.168.1.${250 + count}`;
      }

      const newNode: DeviceNode = {
        id: newId,
        name: defaultName,
        type,
        ip: defaultIp,
        mask: '255.255.255.0',
        gateway: '192.168.1.254',
        x: boundedX,
        y: boundedY,
        isOnline: true,
      };

      setNodes((prev) => [...prev, newNode]);
      setActiveTool('select');
      setTerminalLogs((prev) => [
        ...prev,
        `[DEVICE ADDED] ${newNode.name} (${newNode.ip}) ditambahkan ke kanvas di koordinat (${Math.round(boundedX)}, ${Math.round(boundedY)}).`,
      ]);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    if (activeTool === 'delete') {
      // Delete device & its links
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setLinks((prev) => prev.filter((l) => l.from !== id && l.to !== id));
      setTerminalLogs((prev) => [...prev, `[DEVICE DELETED] Perangkat dengan ID ${id} dihapus.`]);
      return;
    }

    if (activeTool === 'cable-straight' || activeTool === 'cable-cross') {
      const cType: CableType = activeTool === 'cable-straight' ? 'straight' : 'cross';

      if (!cableSourceNodeId) {
        // Step 1: select source node
        setCableSourceNodeId(id);
        const srcNode = nodes.find((n) => n.id === id);
        setCableFeedback(`Memilih ${srcNode?.name}. Sekarang klik perangkat tujuan untuk menyambungkan kabel.`);
      } else {
        // Step 2: connect to destination node
        if (cableSourceNodeId === id) {
          setCableFeedback('Kabel tidak dapat dihubungkan ke perangkat yang sama!');
          setCableSourceNodeId(null);
          return;
        }

        const src = nodes.find((n) => n.id === cableSourceNodeId);
        const dst = nodes.find((n) => n.id === id);

        if (!src || !dst) return;

        // Check if connection already exists
        const exists = links.some(
          (l) => (l.from === src.id && l.to === dst.id) || (l.from === dst.id && l.to === src.id)
        );

        if (exists) {
          setCableFeedback(`Peringatan: ${src.name} dan ${dst.name} sudah terhubung oleh kabel lain!`);
          setCableSourceNodeId(null);
          return;
        }

        // Verify cable rule (Straight vs Cross)
        // Straight: Different type device (PC - Switch, Server - Switch, Switch - Router)
        // Cross: Same type device (PC - PC, Switch - Switch, Router - Router, PC - Router)
        const isSameTypeHierarchy =
          (src.type === 'pc' && dst.type === 'pc') ||
          (src.type === 'switch' && dst.type === 'switch') ||
          (src.type === 'router' && dst.type === 'router') ||
          (src.type === 'pc' && dst.type === 'router') ||
          (src.type === 'router' && dst.type === 'pc');

        const idealCable: CableType = isSameTypeHierarchy ? 'cross' : 'straight';

        const newLink: CableLink = {
          id: `link-${Date.now()}`,
          from: src.id,
          to: dst.id,
          cableType: cType,
        };

        setLinks((prev) => [...prev, newLink]);
        setCableSourceNodeId(null);

        if (cType === idealCable) {
          setCableFeedback(`✅ Kabel ${cType.toUpperCase()} berhasil disambungkan antara ${src.name} dan ${dst.name} (Tepat & Sesuai Kaidah Jaringan)!`);
          confetti({ particleCount: 30, spread: 40 });
        } else {
          setCableFeedback(
            `⚠️ Kabel terpasang (${cType.toUpperCase()}), namun kaidah standar merekomendasikan kabel ${idealCable.toUpperCase()} untuk menghubungkan ${src.name} (${src.type}) ke ${dst.name} (${dst.type})!`
          );
        }

        setTerminalLogs((prev) => [
          ...prev,
          `[LINK ESTABLISHED] Kabel ${cType} menghubungkan ${src.name} ke ${dst.name}.`,
        ]);
      }
      return;
    }

    // Default drag mode
    setDraggingNodeId(id);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingNodeId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(40, Math.min(rect.width - 40, e.clientX - rect.left));
    const newY = Math.max(40, Math.min(rect.height - 40, e.clientY - rect.top));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  // =========================================================================
  // SIMULASI ICMP PING / PDU TESTING
  // =========================================================================
  const handleRunPingTest = () => {
    if (isSimulatingPing) return;

    const src = nodes.find((n) => n.id === pingSourceId);
    const dst = nodes.find((n) => n.id === pingDestId);

    if (!src || !dst) return;

    setIsSimulatingPing(true);
    setPacketProgress(0);

    setTerminalLogs([
      `Cisco Packet Tracer ICMP Ping Simulation Engine`,
      `PING ${dst.ip} (${dst.name}) dari ${src.ip} (${src.name}) dengan 32 bytes data...`,
    ]);

    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      setPacketProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);
        setIsSimulatingPing(false);

        // Verification checks
        if (!src.isOnline) {
          setTerminalLogs((prev) => [
            ...prev,
            `❌ GAGAL: Perangkat pengirim (${src.name}) dalam status POWER OFF / MATI!`,
            `Status: Transmit failed. (100% loss)`,
          ]);
          return;
        }

        if (!dst.isOnline) {
          setTerminalLogs((prev) => [
            ...prev,
            `❌ Request timed out (RTO). Perangkat tujuan (${dst.name}) offline / tidak menyala.`,
            `Status: Destination unreachable. (100% loss)`,
          ]);
          return;
        }

        // Check if there is an active path via cables
        // Simple BFS pathfinder on links
        const isConnected = checkPathExists(src.id, dst.id, nodes, links);

        if (!isConnected) {
          setTerminalLogs((prev) => [
            ...prev,
            `❌ Destination Host Unreachable. Tidak ada kabel yang menghubungkan ${src.name} ke ${dst.name}.`,
            `Petunjuk: Sambungkan perangkat menggunakan Switch/Hub atau Kabel Crossover!`,
          ]);
          return;
        }

        // Check subnet compatibility
        const srcSubnet = src.ip.split('.').slice(0, 3).join('.');
        const dstSubnet = dst.ip.split('.').slice(0, 3).join('.');

        if (srcSubnet !== dstSubnet) {
          // Different subnet requires a router online in the network
          const hasOnlineRouter = nodes.some((n) => n.type === 'router' && n.isOnline);
          if (!hasOnlineRouter) {
            setTerminalLogs((prev) => [
              ...prev,
              `❌ Beda Subnet (${srcSubnet}.x vs ${dstSubnet}.x). Membutuhkan Router Gateway untuk routing antar-jaringan!`,
            ]);
            return;
          }
        }

        // Success!
        confetti({ particleCount: 70, spread: 60 });
        setTerminalLogs((prev) => [
          ...prev,
          `✅ Balasan ICMP dari ${dst.ip}: bytes=32 waktu=1.2ms TTL=128`,
          `✅ Balasan ICMP dari ${dst.ip}: bytes=32 waktu=1.0ms TTL=128`,
          `✅ Status: SUCCESSFUL! Paket ICMP berhasil terkirim bolak-balik tanpa packet loss.`,
        ]);

        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    }, 120);
  };

  // Helper BFS graph traversal
  const checkPathExists = (
    startId: string,
    targetId: string,
    currentNodes: DeviceNode[],
    currentLinks: CableLink[]
  ): boolean => {
    const queue = [startId];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === targetId) return true;

      // Find all neighbors connected via links where intermediary node is online
      const neighbors: string[] = [];
      currentLinks.forEach((link) => {
        if (link.from === current) neighbors.push(link.to);
        if (link.to === current) neighbors.push(link.from);
      });

      for (const nId of neighbors) {
        const nodeObj = currentNodes.find((n) => n.id === nId);
        if (nodeObj && nodeObj.isOnline && !visited.has(nId)) {
          visited.add(nId);
          queue.push(nId);
        }
      }
    }

    return false;
  };

  // Topology template loader
  const loadTemplate = (type: 'star' | 'bus' | 'ring' | 'mesh' | 'tree') => {
    let tNodes: DeviceNode[] = [];
    let tLinks: CableLink[] = [];

    if (type === 'star') {
      tNodes = [
        { id: 'sw-c', name: 'Switch-Core', type: 'switch', ip: '192.168.1.1', mask: '255.255.255.0', gateway: '', x: 380, y: 190, isOnline: true },
        { id: 'pc-1', name: 'PC-Finance', type: 'pc', ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.254', x: 180, y: 90, isOnline: true },
        { id: 'pc-2', name: 'PC-Marketing', type: 'pc', ip: '192.168.1.11', mask: '255.255.255.0', gateway: '192.168.1.254', x: 180, y: 290, isOnline: true },
        { id: 'srv-1', name: 'Web-Server', type: 'server', ip: '192.168.1.100', mask: '255.255.255.0', gateway: '192.168.1.254', x: 580, y: 90, isOnline: true },
        { id: 'rt-1', name: 'Router-GW', type: 'router', ip: '192.168.1.254', mask: '255.255.255.0', gateway: '', x: 580, y: 290, isOnline: true },
      ];
      tLinks = [
        { id: 'l1', from: 'pc-1', to: 'sw-c', cableType: 'straight' },
        { id: 'l2', from: 'pc-2', to: 'sw-c', cableType: 'straight' },
        { id: 'l3', from: 'srv-1', to: 'sw-c', cableType: 'straight' },
        { id: 'l4', from: 'rt-1', to: 'sw-c', cableType: 'straight' },
      ];
    } else if (type === 'bus') {
      tNodes = [
        { id: 'pc-1', name: 'PC-1', type: 'pc', ip: '192.168.1.10', mask: '255.255.255.0', gateway: '', x: 120, y: 180, isOnline: true },
        { id: 'sw-1', name: 'Hub-1', type: 'switch', ip: '192.168.1.1', mask: '255.255.255.0', gateway: '', x: 260, y: 180, isOnline: true },
        { id: 'sw-2', name: 'Hub-2', type: 'switch', ip: '192.168.1.2', mask: '255.255.255.0', gateway: '', x: 440, y: 180, isOnline: true },
        { id: 'sw-3', name: 'Hub-3', type: 'switch', ip: '192.168.1.3', mask: '255.255.255.0', gateway: '', x: 620, y: 180, isOnline: true },
        { id: 'srv-1', name: 'Server', type: 'server', ip: '192.168.1.100', mask: '255.255.255.0', gateway: '', x: 440, y: 300, isOnline: true },
      ];
      tLinks = [
        { id: 'l1', from: 'pc-1', to: 'sw-1', cableType: 'straight' },
        { id: 'l2', from: 'sw-1', to: 'sw-2', cableType: 'cross' },
        { id: 'l3', from: 'sw-2', to: 'sw-3', cableType: 'cross' },
        { id: 'l4', from: 'srv-1', to: 'sw-2', cableType: 'straight' },
      ];
    } else if (type === 'ring') {
      tNodes = [
        { id: 'rt-1', name: 'Node-Router 1', type: 'router', ip: '192.168.1.1', mask: '255.255.255.0', gateway: '', x: 380, y: 80, isOnline: true },
        { id: 'sw-2', name: 'Node-Switch 2', type: 'switch', ip: '192.168.1.2', mask: '255.255.255.0', gateway: '', x: 580, y: 190, isOnline: true },
        { id: 'srv-3', name: 'Node-Server 3', type: 'server', ip: '192.168.1.3', mask: '255.255.255.0', gateway: '', x: 480, y: 310, isOnline: true },
        { id: 'pc-4', name: 'Node-PC 4', type: 'pc', ip: '192.168.1.4', mask: '255.255.255.0', gateway: '', x: 280, y: 310, isOnline: true },
        { id: 'sw-5', name: 'Node-Switch 5', type: 'switch', ip: '192.168.1.5', mask: '255.255.255.0', gateway: '', x: 180, y: 190, isOnline: true },
      ];
      tLinks = [
        { id: 'l1', from: 'rt-1', to: 'sw-2', cableType: 'cross' },
        { id: 'l2', from: 'sw-2', to: 'srv-3', cableType: 'straight' },
        { id: 'l3', from: 'srv-3', to: 'pc-4', cableType: 'cross' },
        { id: 'l4', from: 'pc-4', to: 'sw-5', cableType: 'straight' },
        { id: 'l5', from: 'sw-5', to: 'rt-1', cableType: 'cross' },
      ];
    } else if (type === 'mesh') {
      tNodes = [
        { id: 'rt-1', name: 'Router-A', type: 'router', ip: '192.168.1.1', mask: '255.255.255.0', gateway: '', x: 250, y: 100, isOnline: true },
        { id: 'rt-2', name: 'Router-B', type: 'router', ip: '192.168.1.2', mask: '255.255.255.0', gateway: '', x: 520, y: 100, isOnline: true },
        { id: 'rt-3', name: 'Router-C', type: 'router', ip: '192.168.1.3', mask: '255.255.255.0', gateway: '', x: 520, y: 280, isOnline: true },
        { id: 'rt-4', name: 'Router-D', type: 'router', ip: '192.168.1.4', mask: '255.255.255.0', gateway: '', x: 250, y: 280, isOnline: true },
      ];
      tLinks = [
        { id: 'l1', from: 'rt-1', to: 'rt-2', cableType: 'cross' },
        { id: 'l2', from: 'rt-2', to: 'rt-3', cableType: 'cross' },
        { id: 'l3', from: 'rt-3', to: 'rt-4', cableType: 'cross' },
        { id: 'l4', from: 'rt-4', to: 'rt-1', cableType: 'cross' },
        { id: 'l5', from: 'rt-1', to: 'rt-3', cableType: 'cross' },
        { id: 'l6', from: 'rt-2', to: 'rt-4', cableType: 'cross' },
      ];
    } else if (type === 'tree') {
      tNodes = [
        { id: 'rt-gw', name: 'Core-Router', type: 'router', ip: '192.168.1.254', mask: '255.255.255.0', gateway: '', x: 380, y: 60, isOnline: true },
        { id: 'sw-1', name: 'Switch-GedungA', type: 'switch', ip: '192.168.1.1', mask: '255.255.255.0', gateway: '', x: 240, y: 170, isOnline: true },
        { id: 'sw-2', name: 'Switch-GedungB', type: 'switch', ip: '192.168.1.2', mask: '255.255.255.0', gateway: '', x: 520, y: 170, isOnline: true },
        { id: 'pc-1', name: 'PC-Lab1', type: 'pc', ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.254', x: 160, y: 290, isOnline: true },
        { id: 'pc-2', name: 'PC-Lab2', type: 'pc', ip: '192.168.1.11', mask: '255.255.255.0', gateway: '192.168.1.254', x: 290, y: 290, isOnline: true },
        { id: 'srv-1', name: 'Server-Database', type: 'server', ip: '192.168.1.100', mask: '255.255.255.0', gateway: '192.168.1.254', x: 460, y: 290, isOnline: true },
        { id: 'pc-3', name: 'PC-Staff', type: 'pc', ip: '192.168.1.12', mask: '255.255.255.0', gateway: '192.168.1.254', x: 590, y: 290, isOnline: true },
      ];
      tLinks = [
        { id: 'l1', from: 'rt-gw', to: 'sw-1', cableType: 'straight' },
        { id: 'l2', from: 'rt-gw', to: 'sw-2', cableType: 'straight' },
        { id: 'l3', from: 'pc-1', to: 'sw-1', cableType: 'straight' },
        { id: 'l4', from: 'pc-2', to: 'sw-1', cableType: 'straight' },
        { id: 'l5', from: 'srv-1', to: 'sw-2', cableType: 'straight' },
        { id: 'l6', from: 'pc-3', to: 'sw-2', cableType: 'straight' },
      ];
    }

    setNodes(tNodes);
    setLinks(tLinks);
    setViewMode('studio');
    setTerminalLogs((prev) => [...prev, `[TEMPLATE LOADED] Topologi ${type.toUpperCase()} berhasil dimuat ke kanvas.`]);
    confetti({ particleCount: 50, spread: 50 });
  };

  const getDeviceIcon = (type: DeviceType, isOnline: boolean) => {
    const color = isOnline ? 'text-tealbrand-400' : 'text-slate-500';
    switch (type) {
      case 'pc':
        return <Laptop className={`w-5 h-5 ${color}`} />;
      case 'server':
        return <Server className={`w-5 h-5 ${color}`} />;
      case 'router':
        return <Router className={`w-5 h-5 ${color}`} />;
      case 'switch':
        return <Radio className={`w-5 h-5 ${isOnline ? 'text-amber-400' : 'text-slate-500'}`} />;
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* ============================================================== */}
      {/* 1. HEADER & MODE SWITCHER TABS                                 */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              Simulasi Cisco Packet Tracer
            </span>
            <span className="text-xs text-tealbrand-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Laboratorium Topologi Komputer
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Studio Perancang Topologi Jaringan (Drag &amp; Drop)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bangun topologi jaringan mandiri: tarik Komputer, Switch, Server, Router, hubungkan dengan Kabel Straight / Cross, dan simulasikan kirim paket ICMP!
          </p>
        </div>

        {/* 3 Top Modes */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setViewMode('studio')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'studio'
                ? 'bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 text-white shadow-lg shadow-tealbrand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>🛠️ Studio Packet Tracer (Drag &amp; Drop)</span>
          </button>

          <button
            onClick={() => setViewMode('simulation')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'simulation'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>✉️ Uji Kirim Paket (Ping)</span>
          </button>

          <button
            onClick={() => setViewMode('templates')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === 'templates'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>📐 Galeri Template Topologi</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CISCO PACKET TRACER TOOLBOX RIBBON                          */}
      {/* ============================================================== */}
      {viewMode === 'studio' && (
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Left Toolbox: Devices & Cables */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold mr-1">
              Perangkat:
            </span>

            {/* Select/Move tool */}
            <button
              onClick={() => {
                setActiveTool('select');
                setCableSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTool === 'select'
                  ? 'bg-tealbrand-600 text-white border-tealbrand-500 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Pilih / Geser</span>
            </button>

            {/* 1. Komputer */}
            <button
              onClick={() => {
                setActiveTool('pc');
                setCableSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTool === 'pc'
                  ? 'bg-tealbrand-600 text-white border-tealbrand-500 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-tealbrand-400" />
              <span>+ 1. Komputer (PC)</span>
            </button>

            {/* 2. HUB / Switch */}
            <button
              onClick={() => {
                setActiveTool('switch');
                setCableSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTool === 'switch'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>+ 2. HUB / Switch</span>
            </button>

            {/* 3. Server */}
            <button
              onClick={() => {
                setActiveTool('server');
                setCableSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTool === 'server'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>+ 3. Server</span>
            </button>

            {/* 5. Router */}
            <button
              onClick={() => {
                setActiveTool('router');
                setCableSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTool === 'router'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Router className="w-3.5 h-3.5 text-purple-400" />
              <span>+ 5. Router</span>
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            {/* 4. Kabel Straight */}
            <button
              onClick={() => {
                setActiveTool('cable-straight');
                setCableSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTool === 'cable-straight'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="w-3.5 h-0.5 bg-sky-400 inline-block"></span>
              <span>4a. Kabel Straight (—)</span>
            </button>

            {/* 4. Kabel Cross */}
            <button
              onClick={() => {
                setActiveTool('cable-cross');
                setCableSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTool === 'cable-cross'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="w-3.5 h-0.5 border-b border-dashed border-amber-400 inline-block"></span>
              <span>4b. Kabel Cross (- -)</span>
            </button>

            {/* Delete tool */}
            <button
              onClick={() => {
                setActiveTool('delete');
                setCableSourceNodeId(null);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border ${
                activeTool === 'delete'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : 'bg-slate-950 text-rose-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNodes(DEFAULT_DEVICES);
                setLinks(DEFAULT_LINKS);
                setCableFeedback(null);
                setTerminalLogs(['Topologi di-reset ke konfigurasi awal standar.']);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => {
                setNodes([]);
                setLinks([]);
                setCableFeedback(null);
                setTerminalLogs(['Kanvas dikosongkan. Siap merancang dari nol.']);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-rose-400 text-xs font-semibold border border-slate-800 transition-all"
            >
              Bersihkan Kanvas
            </button>
          </div>
        </div>
      )}

      {/* Helpful Wiring Banner */}
      {cableFeedback && (
        <div className="p-3 rounded-xl bg-slate-900 border border-tealbrand-500/50 text-xs flex items-center justify-between animate-in fade-in">
          <span className="text-tealbrand-200">{cableFeedback}</span>
          <button onClick={() => setCableFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN WORKBENCH CANVAS & INTERACTION                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Diagram Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-2">
          {/* Active Tool Help Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1.5 text-tealbrand-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              {activeTool === 'select' && 'Mode Pilih / Geser: Klik & tahan untuk memindahkan posisi perangkat.'}
              {activeTool === 'pc' && 'Mode Tambah PC: Klik di area kanvas untuk menempatkan Komputer baru.'}
              {activeTool === 'switch' && 'Mode Tambah Switch: Klik di area kanvas untuk menempatkan Switch baru.'}
              {activeTool === 'server' && 'Mode Tambah Server: Klik di area kanvas untuk menempatkan Server baru.'}
              {activeTool === 'router' && 'Mode Tambah Router: Klik di area kanvas untuk menempatkan Router baru.'}
              {activeTool === 'cable-straight' && 'Mode Kabel Straight: Klik perangkat asal lalu klik perangkat tujuan.'}
              {activeTool === 'cable-cross' && 'Mode Kabel Cross: Klik perangkat asal lalu klik perangkat tujuan.'}
              {activeTool === 'delete' && 'Mode Hapus: Klik perangkat mana pun untuk menghapusnya dari jaringan.'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {nodes.length} Perangkat • {links.length} Kabel
            </span>
          </div>

          {/* Interactive Canvas */}
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="relative w-full h-[420px] sm:h-[460px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl cursor-crosshair select-none"
            style={{
              backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* SVG Connecting Cables */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {links.map((link) => {
                const nFrom = nodes.find((n) => n.id === link.from);
                const nTo = nodes.find((n) => n.id === link.to);
                if (!nFrom || !nTo) return null;

                const isStraight = link.cableType === 'straight';
                const isLinkActive = nFrom.isOnline && nTo.isOnline;

                return (
                  <g key={link.id}>
                    <line
                      x1={nFrom.x}
                      y1={nFrom.y}
                      x2={nTo.x}
                      y2={nTo.y}
                      stroke={isLinkActive ? (isStraight ? '#38bdf8' : '#f59e0b') : '#475569'}
                      strokeWidth={isStraight ? '3' : '2.5'}
                      strokeDasharray={isStraight ? 'none' : '6,4'}
                      className="transition-all duration-75"
                    />
                    {/* Cable Type Badge */}
                    <text
                      x={(nFrom.x + nTo.x) / 2}
                      y={(nFrom.y + nTo.y) / 2 - 6}
                      fill={isStraight ? '#7dd3fc' : '#fde047'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none font-bold select-none"
                    >
                      {link.cableType.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* Animated ping packet dot if simulating */}
              {isSimulatingPing && (
                <circle
                  cx={380}
                  cy={190}
                  r="7"
                  fill="#fbbf24"
                  className="animate-ping"
                />
              )}
            </svg>

            {/* Empty Canvas Prompt */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none text-slate-500 space-y-2">
                <Network className="w-12 h-12 text-slate-700" />
                <p className="text-sm font-bold text-slate-400">Kanvas Masih Kosong</p>
                <p className="text-xs max-w-sm">
                  Pilih perangkat pada toolbox di atas (+ Komputer, + Switch, + Server, + Router) lalu klik pada kanvas untuk mulai merancang topologi!
                </p>
              </div>
            )}

            {/* Render Nodes as Interactive Draggable Objects */}
            {nodes.map((node) => {
              const isCableSource = cableSourceNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="flex flex-col items-center group cursor-grab active:cursor-grabbing z-20"
                >
                  <div
                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xl border-2 ${
                      isCableSource
                        ? 'bg-amber-500/30 border-amber-400 ring-4 ring-amber-500/40 scale-110'
                        : node.isOnline
                        ? 'bg-slate-900 border-tealbrand-500/80 hover:border-tealbrand-400 hover:scale-105 shadow-tealbrand-500/20'
                        : 'bg-slate-950 border-rose-600/60 opacity-60'
                    }`}
                  >
                    {/* Device Icon */}
                    {getDeviceIcon(node.type, node.isOnline)}

                    {/* Power LED Indicator */}
                    <span
                      className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                        node.isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500'
                      }`}
                    ></span>

                    {/* Quick Config Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNode(node);
                      }}
                      title="Buka Konfigurasi Perangkat (IP / Mask / Gateway)"
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 hover:bg-brand-600 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Device Labels */}
                  <div className="mt-1 text-center pointer-events-none select-none">
                    <p className="text-[11px] font-bold text-slate-200 tracking-tight leading-none">
                      {node.name}
                    </p>
                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">{node.ip}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 cols: Cisco Packet Tracer Console & Controls */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* ICMP Ping Testing Box */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-tealbrand-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Uji Pengiriman Paket (Ping PDU)
              </h4>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                ICMP
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  1. Perangkat Sumber (Source):
                </label>
                <select
                  value={pingSourceId}
                  onChange={(e) => setPingSourceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-tealbrand-500"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.ip}) - {n.type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  2. Perangkat Tujuan (Destination):
                </label>
                <select
                  value={pingDestId}
                  onChange={(e) => setPingDestId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-tealbrand-500"
                >
                  {nodes
                    .filter((n) => n.id !== pingSourceId)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.ip}) - {n.type.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={handleRunPingTest}
                disabled={isSimulatingPing || nodes.length < 2}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isSimulatingPing
                    ? 'bg-amber-600 text-white cursor-wait'
                    : 'bg-tealbrand-600 hover:bg-tealbrand-500 text-white shadow-tealbrand-500/20 active:scale-95'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSimulatingPing ? 'Mengirimkan Paket...' : 'Kirim Paket ICMP Ping'}</span>
              </button>
            </div>
          </div>

          {/* Cisco CLI Terminal Output */}
          <div className="bg-black p-4 rounded-2xl border border-slate-800 font-mono text-xs flex-1 flex flex-col justify-between min-h-[200px] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5 text-tealbrand-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-tealbrand-400 animate-pulse"></span>
                Terminal Paket Jaringan
              </span>
              <span>Cisco IOS Simulation</span>
            </div>

            <div className="space-y-1.5 my-2 overflow-y-auto max-h-[160px] text-slate-300 text-[11px] leading-relaxed">
              {terminalLogs.map((log, i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="text-tealbrand-400 font-bold">$</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-1 flex justify-between">
              <span>Status: READY</span>
              <span>Port Auto-MDIX: Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. TEMPLATE GALLERY VIEW                                       */}
      {/* ============================================================== */}
      {viewMode === 'templates' && (
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Pilih Template Topologi Standar Industri
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik salah satu template di bawah untuk memuat desain arsitektur jaringan secara otomatis ke kanvas:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                id: 'star',
                title: 'Topologi Star',
                desc: 'Pusat konsentrator Switch menghubungkan PC, Server, dan Router.',
                badge: 'Paling Populer',
                color: 'border-tealbrand-500/40 text-tealbrand-300',
              },
              {
                id: 'bus',
                title: 'Topologi Bus',
                desc: 'Jalur kabel backbone serial dengan terminator ujung.',
                badge: 'Tradisional',
                color: 'border-amber-500/40 text-amber-300',
              },
              {
                id: 'ring',
                title: 'Topologi Ring',
                desc: 'Koneksi cincin tertutup token passing berantai.',
                badge: 'Loop Cincin',
                color: 'border-indigo-500/40 text-indigo-300',
              },
              {
                id: 'mesh',
                title: 'Topologi Mesh',
                desc: 'Router saling terhubung penuh dengan redundansi maksimal.',
                badge: 'Redundan Tinggi',
                color: 'border-rose-500/40 text-rose-300',
              },
              {
                id: 'tree',
                title: 'Topologi Tree',
                desc: 'Hirarki Core Router membawahi beberapa Switch gedung.',
                badge: 'Enterprise Lab',
                color: 'border-purple-500/40 text-purple-300',
              },
            ].map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      {tmpl.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 mt-2">{tmpl.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.desc}</p>
                </div>
                <button
                  onClick={() => loadTemplate(tmpl.id as any)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-bold transition-all shadow"
                >
                  Muat ke Kanvas
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CISCO CONFIGURATION MODAL DIALOG                            */}
      {/* ============================================================== */}
      {editingNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-tealbrand-400" />
                <h3 className="font-bold text-base text-white">
                  Konfigurasi: {editingNode.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingNode(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nama Perangkat (Host):</label>
                <input
                  type="text"
                  value={editingNode.name}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-tealbrand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">IPv4 Address:</label>
                <input
                  type="text"
                  value={editingNode.ip}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, ip: e.target.value.trim() })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-tealbrand-300 font-mono font-bold outline-none focus:border-tealbrand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subnet Mask:</label>
                <input
                  type="text"
                  value={editingNode.mask}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, mask: e.target.value.trim() })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono outline-none focus:border-tealbrand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Default Gateway:</label>
                <input
                  type="text"
                  value={editingNode.gateway}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, gateway: e.target.value.trim() })
                  }
                  placeholder="192.168.1.254"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono outline-none focus:border-tealbrand-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-300">Status Daya (Power State):</span>
                <button
                  onClick={() =>
                    setEditingNode({ ...editingNode, isOnline: !editingNode.isOnline })
                  }
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                    editingNode.isOnline
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{editingNode.isOnline ? 'Online (Menyala)' : 'Offline (Mati)'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setNodes((prev) => prev.filter((n) => n.id !== editingNode.id));
                  setLinks((prev) =>
                    prev.filter((l) => l.from !== editingNode.id && l.to !== editingNode.id)
                  );
                  setEditingNode(null);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Node</span>
              </button>

              <button
                onClick={() => {
                  setNodes((prev) =>
                    prev.map((n) => (n.id === editingNode.id ? editingNode : n))
                  );
                  setEditingNode(null);
                }}
                className="px-5 py-2 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
