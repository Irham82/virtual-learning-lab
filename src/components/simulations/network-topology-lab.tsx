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
  Mail,
  Eye,
  FileText,
  ArrowRight,
  ShieldCheck,
  Clock,
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
  const [packetStage, setPacketStage] = useState<'idle' | 'creating' | 'outbound' | 'processing' | 'inbound' | 'delivered' | 'failed'>('idle');
  const [packetPos, setPacketPos] = useState<{ x: number; y: number; isReturn: boolean; currentHopName: string } | null>(null);
  const [activePathNodeIds, setActivePathNodeIds] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [isPduModalOpen, setIsPduModalOpen] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<'normal' | 'slow'>('normal');
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
  // SIMULASI ICMP PING / PDU TESTING (SURAT DIGITAL CISCO PACKET TRACER)
  // =========================================================================
  const findPathNodes = (
    startId: string,
    targetId: string,
    currentNodes: DeviceNode[],
    currentLinks: CableLink[]
  ): DeviceNode[] | null => {
    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const lastNodeId = path[path.length - 1];

      if (lastNodeId === targetId) {
        return path
          .map((id) => currentNodes.find((n) => n.id === id))
          .filter((n): n is DeviceNode => Boolean(n));
      }

      const neighbors: string[] = [];
      currentLinks.forEach((link) => {
        if (link.from === lastNodeId) neighbors.push(link.to);
        if (link.to === lastNodeId) neighbors.push(link.from);
      });

      for (const nId of neighbors) {
        const nodeObj = currentNodes.find((n) => n.id === nId);
        if (nodeObj && nodeObj.isOnline && !visited.has(nId)) {
          visited.add(nId);
          queue.push([...path, nId]);
        }
      }
    }

    return null;
  };

  const handleRunPingTest = () => {
    if (isSimulatingPing) return;

    const src = nodes.find((n) => n.id === pingSourceId);
    const dst = nodes.find((n) => n.id === pingDestId);

    if (!src || !dst) return;

    setIsSimulatingPing(true);
    setPacketProgress(0);
    setPacketStage('creating');
    setCurrentStepIndex(1);
    setCurrentStepText(`[Tahap 1: Enkapsulasi Surat] ${src.name} mengemas surat ICMP Echo Request (Type 8, Code 0, Data 32 Bytes).`);
    setPacketPos({ x: src.x, y: src.y, isReturn: false, currentHopName: src.name });

    setTerminalLogs([
      `Cisco Packet Tracer ICMP Simulation Engine`,
      `Membuat Surat Digital: Pengirim ${src.name} (${src.ip}) ➔ Tujuan ${dst.name} (${dst.ip}) [32 bytes]`,
    ]);

    // Validation checks
    if (!src.isOnline) {
      setPacketStage('failed');
      setCurrentStepIndex(1);
      setCurrentStepText(`❌ GAGAL: Perangkat pengirim (${src.name}) dalam status POWER OFF / MATI!`);
      setTerminalLogs((prev) => [
        ...prev,
        `❌ GAGAL: Perangkat pengirim (${src.name}) dalam status POWER OFF / MATI!`,
        `Status: Transmit failed. (100% loss)`,
      ]);
      setIsSimulatingPing(false);
      return;
    }

    if (!dst.isOnline) {
      setPacketStage('failed');
      setCurrentStepIndex(1);
      setCurrentStepText(`❌ Request timed out (RTO). Perangkat tujuan (${dst.name}) offline / tidak menyala.`);
      setTerminalLogs((prev) => [
        ...prev,
        `❌ Request timed out (RTO). Perangkat tujuan (${dst.name}) offline / tidak menyala.`,
        `Status: Destination unreachable. (100% loss)`,
      ]);
      setIsSimulatingPing(false);
      return;
    }

    const pathNodes = findPathNodes(src.id, dst.id, nodes, links);

    if (!pathNodes || pathNodes.length < 2) {
      setPacketStage('failed');
      setCurrentStepIndex(2);
      setCurrentStepText(`❌ Surat Gagal Terkirim: Tidak ada kabel yang menghubungkan ${src.name} ke ${dst.name}!`);
      setTerminalLogs((prev) => [
        ...prev,
        `❌ Destination Host Unreachable. Tidak ada kabel yang menghubungkan ${src.name} ke ${dst.name}.`,
        `Petunjuk: Sambungkan perangkat menggunakan Switch/Hub atau Kabel Crossover!`,
      ]);
      setIsSimulatingPing(false);
      return;
    }

    // Subnet checking
    const srcSubnet = src.ip.split('.').slice(0, 3).join('.');
    const dstSubnet = dst.ip.split('.').slice(0, 3).join('.');

    if (srcSubnet !== dstSubnet) {
      const hasOnlineRouter = pathNodes.some((n) => n.type === 'router' && n.isOnline);
      if (!hasOnlineRouter) {
        setPacketStage('failed');
        setCurrentStepIndex(2);
        setCurrentStepText(`❌ Beda Subnet (${srcSubnet}.x vs ${dstSubnet}.x). Membutuhkan Router Gateway untuk meneruskan surat antar-jaringan!`);
        setTerminalLogs((prev) => [
          ...prev,
          `❌ Beda Subnet (${srcSubnet}.x vs ${dstSubnet}.x). Membutuhkan Router Gateway untuk routing antar-jaringan!`,
        ]);
        setIsSimulatingPing(false);
        return;
      }
    }

    setActivePathNodeIds(pathNodes.map((n) => n.id));

    const stepInterval = simSpeed === 'slow' ? 50 : 32;
    let progress = 0;
    const segmentsCount = pathNodes.length - 1;
    const reversePathNodes = [...pathNodes].reverse();

    const timer = setInterval(() => {
      progress += 1;
      setPacketProgress(progress);

      if (progress <= 12) {
        // Stage 1: Creating envelope at source
        setPacketStage('creating');
        setCurrentStepIndex(1);
        setCurrentStepText(`[Tahap 1: Enkapsulasi] ${src.name} mengemas surat ICMP Echo Request (Type 8, Code 0, Data 32 Bytes).`);
        setPacketPos({ x: src.x, y: src.y, isReturn: false, currentHopName: src.name });
      } else if (progress > 12 && progress <= 50) {
        // Stage 2: Outbound traveling from source to destination
        setPacketStage('outbound');
        setCurrentStepIndex(2);
        const tOut = (progress - 12) / 38;
        const segIdx = Math.min(Math.floor(tOut * segmentsCount), segmentsCount - 1);
        const localT = (tOut * segmentsCount) - segIdx;
        const fromN = pathNodes[segIdx];
        const toN = pathNodes[segIdx + 1];
        const curX = fromN.x + localT * (toN.x - fromN.x);
        const curY = fromN.y + localT * (toN.y - fromN.y);
        setCurrentStepText(`[Tahap 2: Surat Meluncur di Kabel] Surat ICMP Request meluncur dari ${fromN.name} ➔ ${toN.name}.`);
        setPacketPos({ x: curX, y: curY, isReturn: false, currentHopName: toN.name });
      } else if (progress > 50 && progress <= 62) {
        // Stage 3: Destination receiving and opening letter
        setPacketStage('processing');
        setCurrentStepIndex(3);
        setCurrentStepText(`[Tahap 3: Surat Diterima] ${dst.name} membuka amplop ICMP Echo Request & membuat surat balasan (Echo Reply Type 0).`);
        setPacketPos({ x: dst.x, y: dst.y, isReturn: false, currentHopName: dst.name });
      } else if (progress > 62 && progress <= 95) {
        // Stage 4: Inbound traveling from destination back to source
        setPacketStage('inbound');
        setCurrentStepIndex(4);
        const tIn = (progress - 62) / 33;
        const segIdx = Math.min(Math.floor(tIn * segmentsCount), segmentsCount - 1);
        const localT = (tIn * segmentsCount) - segIdx;
        const fromN = reversePathNodes[segIdx];
        const toN = reversePathNodes[segIdx + 1];
        const curX = fromN.x + localT * (toN.x - fromN.x);
        const curY = fromN.y + localT * (toN.y - fromN.y);
        setCurrentStepText(`[Tahap 4: Surat Balasan Meluncur] Surat ICMP Reply meluncur balik dari ${fromN.name} ➔ ${toN.name}.`);
        setPacketPos({ x: curX, y: curY, isReturn: true, currentHopName: toN.name });
      } else if (progress > 95) {
        // Stage 5: Delivered back at source
        setPacketStage('delivered');
        setCurrentStepIndex(5);
        setCurrentStepText(`[Tahap 5: Surat Tiba di Pengirim] ${src.name} menerima surat balasan Echo Reply! Transmisi paket 100% SUKSES.`);
        setPacketPos({ x: src.x, y: src.y, isReturn: true, currentHopName: src.name });
      }

      if (progress >= 100) {
        clearInterval(timer);
        setIsSimulatingPing(false);
        confetti({ particleCount: 75, spread: 65 });
        setTerminalLogs((prev) => [
          ...prev,
          `✅ [Tahap 1] Surat ICMP Request dibuat oleh ${src.name} (${src.ip}).`,
          `✅ [Tahap 2] Jalur perjalanan surat: ${pathNodes.map((n) => n.name).join(' ➔ ')}.`,
          `✅ [Tahap 3] Surat diterima ${dst.name} (${dst.ip}), balasan disiapkan.`,
          `✅ [Tahap 4] Surat balasan Echo Reply meluncur kembali ke ${src.name}.`,
          `✅ [Tahap 5] Balasan ICMP dari ${dst.ip}: bytes=32 waktu=1.2ms TTL=128`,
          `✅ Status: SUCCESSFUL! Surat ICMP berhasil bolak-balik tanpa packet loss.`,
        ]);

        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    }, stepInterval);
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
                const isCableInActivePath =
                  activePathNodeIds.includes(link.from) && activePathNodeIds.includes(link.to);

                return (
                  <g key={link.id}>
                    {/* Glowing active cable effect when letter is traveling */}
                    {isSimulatingPing && isCableInActivePath && (
                      <line
                        x1={nFrom.x}
                        y1={nFrom.y}
                        x2={nTo.x}
                        y2={nTo.y}
                        stroke={packetPos?.isReturn ? '#38bdf8' : '#fbbf24'}
                        strokeWidth="8"
                        opacity="0.55"
                        className="animate-pulse"
                      />
                    )}
                    <line
                      x1={nFrom.x}
                      y1={nFrom.y}
                      x2={nTo.x}
                      y2={nTo.y}
                      stroke={
                        isSimulatingPing && isCableInActivePath
                          ? packetPos?.isReturn
                            ? '#38bdf8'
                            : '#fbbf24'
                          : isLinkActive
                          ? isStraight
                            ? '#38bdf8'
                            : '#f59e0b'
                          : '#475569'
                      }
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

              {/* Animated Envelope / Surat ICMP Packet */}
              {isSimulatingPing && packetPos && (
                <g
                  transform={`translate(${packetPos.x}, ${packetPos.y})`}
                  className="z-30 pointer-events-none transition-transform duration-75"
                >
                  {/* Pulsing Ripple Effect */}
                  <circle
                    r="24"
                    fill={packetStage === 'failed' ? '#ef4444' : packetPos.isReturn ? '#38bdf8' : '#f59e0b'}
                    opacity="0.3"
                    className="animate-ping"
                  />
                  <circle
                    r="16"
                    fill={packetStage === 'failed' ? '#ef4444' : packetPos.isReturn ? '#0284c7' : '#d97706'}
                    opacity="0.25"
                  />

                  {/* Envelope drop shadow */}
                  <rect x="-19" y="-13" width="38" height="26" rx="4" fill="#000000" opacity="0.6" />

                  {/* Envelope Body */}
                  <rect
                    x="-17"
                    y="-12"
                    width="34"
                    height="24"
                    rx="3"
                    fill={packetStage === 'failed' ? '#991b1b' : packetPos.isReturn ? '#0284c7' : '#d97706'}
                    stroke={packetStage === 'failed' ? '#f87171' : packetPos.isReturn ? '#bae6fd' : '#fef08a'}
                    strokeWidth="2"
                  />

                  {/* Envelope Flap Fold Lines */}
                  <path
                    d="M -17 -12 L 0 2 L 17 -12"
                    fill="none"
                    stroke={packetStage === 'failed' ? '#f87171' : packetPos.isReturn ? '#bae6fd' : '#fef08a'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M -17 12 L -6 0 M 17 12 L 6 0"
                    fill="none"
                    stroke={packetStage === 'failed' ? '#fca5a5' : packetPos.isReturn ? '#7dd3fc' : '#fde047'}
                    strokeWidth="1.2"
                    opacity="0.75"
                  />

                  {/* Stamp / Seal in Center */}
                  <circle
                    cx="0"
                    cy="2"
                    r="3.5"
                    fill={packetStage === 'failed' ? '#ef4444' : '#ffffff'}
                  />

                  {/* Floating Badge above Envelope */}
                  <g transform="translate(0, -26)">
                    <rect
                      x="-70"
                      y="-11"
                      width="140"
                      height="20"
                      rx="10"
                      fill="#0f172a"
                      stroke={packetStage === 'failed' ? '#ef4444' : packetPos.isReturn ? '#38bdf8' : '#f59e0b'}
                      strokeWidth="1.5"
                      className="filter drop-shadow-md"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {packetStage === 'failed'
                        ? '❌ PAKET DROPPED'
                        : packetPos.isReturn
                        ? '✉️ ICMP Echo Reply'
                        : '✉️ ICMP Echo Request'}
                    </text>
                  </g>
                </g>
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

              {/* Simulation Speed Controls */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 pb-0.5">
                <span>Kecepatan Surat:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSimSpeed('normal')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      simSpeed === 'normal'
                        ? 'bg-tealbrand-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    1x (Normal)
                  </button>
                  <button
                    onClick={() => setSimSpeed('slow')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      simSpeed === 'slow'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    0.5x (Lambat)
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunPingTest}
                disabled={isSimulatingPing || nodes.length < 2}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isSimulatingPing
                    ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                    : 'bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 hover:from-tealbrand-500 hover:to-tealbrand-400 text-white shadow-tealbrand-500/20 active:scale-95'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isSimulatingPing ? 'Surat Sedang Meluncur...' : 'Kirim Paket ICMP Ping (✉️ Surat)'}</span>
              </button>

              <button
                onClick={() => setIsPduModalOpen(true)}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-tealbrand-300 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-tealbrand-400" />
                <span>Intip Isi Surat (PDU Inspector)</span>
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
      {/* 3b. PELACAK PERJALANAN SURAT ICMP (PDU PACKET TRACKER)         */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>📬 Alur Perjalanan Surat ICMP (Proses Pengiriman PDU)</span>
                {isSimulatingPing && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-mono font-bold">
                    ✉️ Surat Sedang Bergerak...
                  </span>
                )}
                {packetStage === 'delivered' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                    ✅ Surat Sukses Diterima
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400">
                Memvisualisasikan proses pengiriman paket data digital (PDU) dari perangkat sumber ke perangkat tujuan seperti di Cisco Packet Tracer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPduModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-tealbrand-950 hover:bg-tealbrand-900 text-tealbrand-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-tealbrand-500/40 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Intip Amplop Surat (PDU)</span>
            </button>
          </div>
        </div>

        {/* Current Stage Status Banner */}
        {currentStepText ? (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
              packetStage === 'failed'
                ? 'bg-rose-950/60 border-rose-600/60 text-rose-200'
                : packetStage === 'delivered'
                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200 shadow-md shadow-emerald-500/10'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/10'
            }`}
          >
            <span className="text-lg">
              {packetStage === 'failed' ? '❌' : packetStage === 'delivered' ? '🎉' : '✉️'}
            </span>
            <div className="flex-1">
              <p className="font-bold">{currentStepText}</p>
              {packetPos && (
                <p className="text-[11px] opacity-80 mt-0.5">
                  Posisi saat ini: Melalui kabel menuju node <span className="font-mono underline font-bold">{packetPos.currentHopName}</span> ({packetPos.isReturn ? 'Arah Balik: Echo Reply' : 'Arah Pergi: Echo Request'})
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-tealbrand-400 shrink-0" />
            <span>
              Tekan tombol <span className="text-tealbrand-300 font-bold">&quot;Kirim Paket ICMP Ping (✉️ Surat)&quot;</span> di panel samping untuk melihat surat digital bergerak dari perangkat asal menuju perangkat tujuan.
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Progres Perjalanan Surat (PDU Progress):</span>
            <span className="font-bold text-tealbrand-400">{packetProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                packetStage === 'failed'
                  ? 'bg-rose-500'
                  : packetStage === 'delivered'
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 via-tealbrand-400 to-indigo-500'
              }`}
              style={{ width: `${packetProgress}%` }}
            ></div>
          </div>
        </div>

        {/* 5 Step Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            {
              step: 1,
              title: '1. Buat Surat (Enkapsulasi)',
              desc: 'Pengirim mengemas pesan 32 bytes ke dalam paket ICMP Type 8 (Echo Request).',
              icon: '✉️',
            },
            {
              step: 2,
              title: '2. Meluncur di Kabel',
              desc: 'Surat mengalir via Switch / Router perantara yang membaca alamat MAC & IP.',
              icon: '🔀',
            },
            {
              step: 3,
              title: '3. Tiba di Tujuan',
              desc: 'Perangkat tujuan membuka surat, mencatat waktu tiba, dan menyiapkan jawaban.',
              icon: '🎯',
            },
            {
              step: 4,
              title: '4. Mengirim Balasan',
              desc: 'Surat balasan ICMP Type 0 (Echo Reply) meluncur balik ke perangkat pengirim.',
              icon: '🔄',
            },
            {
              step: 5,
              title: '5. Selesai (Sukses)',
              desc: 'Pengirim menerima balasan. Waktu Round Trip (RTT) 1.2ms & 0% packet loss.',
              icon: '✅',
            },
          ].map((item) => {
            const isCurrent = currentStepIndex === item.step;
            const isPast = currentStepIndex > item.step || packetStage === 'delivered';

            return (
              <div
                key={item.step}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-1.5 transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 text-amber-200 ring-2 ring-amber-500/30 shadow-md'
                    : isPast
                    ? 'bg-slate-950/80 border-emerald-500/50 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{item.icon}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    Step {item.step}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[11px] leading-tight text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                </div>
              </div>
            );
          })}
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

      {/* ============================================================== */}
      {/* 6. MODAL INSPECTOR SURAT ICMP (PDU ENVELOPE DETAILS)           */}
      {/* ============================================================== */}
      {isPduModalOpen && (() => {
        const srcNode = nodes.find((n) => n.id === pingSourceId) || nodes[0];
        const dstNode = nodes.find((n) => n.id === pingDestId) || nodes[1];

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-2xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Anatomi Surat Digital ICMP (PDU Inspector)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-tealbrand-500/20 text-tealbrand-300 font-mono font-bold">
                        Cisco PDU Frame
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Struktur amplop dan isi surat yang mengalir di jaringan komputer saat perintah Ping dijalankan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPduModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Envelope Visual Presentation Card */}
              <div className="relative rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-xl">
                <div className="bg-slate-950 rounded-[15px] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✉️</span>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                          Amplop Surat Digital PDU
                        </span>
                        <h4 className="font-bold text-sm text-white">
                          ICMP Packet (Internet Control Message Protocol)
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
                        Total Size: 64 Bytes (32B Data)
                      </span>
                    </div>
                  </div>

                  {/* Postal Header Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        📬 Pengirim (Sender / Source):
                      </p>
                      <p className="font-bold text-sm text-tealbrand-300">
                        {srcNode ? srcNode.name : 'PC-1'}
                      </p>
                      <p className="font-mono text-[11px] text-slate-300">
                        IP: {srcNode ? srcNode.ip : '192.168.1.10'}
                      </p>
                      <p className="font-mono text-[10px] text-slate-500">
                        MAC: 00:50:79:66:{srcNode ? srcNode.id.slice(-2) : '01'}:AA
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        🎯 Penerima (Recipient / Dest):
                      </p>
                      <p className="font-bold text-sm text-amber-300">
                        {dstNode ? dstNode.name : 'Web-Server'}
                      </p>
                      <p className="font-mono text-[11px] text-slate-300">
                        IP: {dstNode ? dstNode.ip : '192.168.1.100'}
                      </p>
                      <p className="font-mono text-[10px] text-slate-500">
                        MAC: 00:50:79:88:{dstNode ? dstNode.id.slice(-2) : 'FF'}:BB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 OSI Layers Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-tealbrand-400" />
                  <span>3 Lapisan Enkapsulasi Surat (OSI Model Layers):</span>
                </h4>

                {/* Layer 2: Data Link */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      1. Lapisan Fisik &amp; Data Link (Layer 2 - Ethernet Frame)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Kabel &amp; MAC</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Amplop fisik yang ditempeli alamat MAC pengirim dan penerima. Digunakan oleh <strong className="text-slate-200">HUB dan Switch</strong> untuk meneruskan frame ke port tujuan yang tepat tanpa perlu memahami alamat IP.
                  </p>
                </div>

                {/* Layer 3: Network IP */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-tealbrand-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-tealbrand-400"></span>
                      2. Lapisan Jaringan (Layer 3 - IPv4 Packet Header)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">TTL = 128 • Protocol = 1</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Kepala surat berisi alamat IP global. Dilengkapi nilai <strong className="text-slate-200">TTL (Time to Live = 128)</strong> yang berkurang 1 setiap kali melewati router, mencegah surat berputar selamanya di jaringan jika terjadi rute loop.
                  </p>
                </div>

                {/* Layer 4: ICMP Message Body */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      3. Isi Surat (ICMP Message Payload)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Type 8 / Type 0</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 space-y-1 border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ICMP Type:</span>
                      <span className="text-amber-300 font-bold">8 (Echo Request saat pergi) / 0 (Echo Reply saat balik)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data Payload:</span>
                      <span className="text-emerald-400">&quot;abcdefghijklmnopqrstuvwabcdefghi&quot; (32 bytes)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pesan Pedagogis:</span>
                      <span className="text-slate-300">&quot;Halo host tujuan, apakah kamu aktif dan bisa menjawab?&quot;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsPduModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Tutup PDU Inspector
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
