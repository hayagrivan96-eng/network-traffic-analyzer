import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PackageSearch, Play, Pause, Filter, Download, ChevronRight, ArrowRight, RefreshCw, Wifi, Server, Monitor, Globe, ShieldAlert, Cpu } from 'lucide-react';
import { mockPackets, mockDevices, type PacketEntry } from '../data/mockData';
import { format } from 'date-fns';

export default function PacketTrackerPage() {
  const [interfaceName, setInterfaceName] = useState('eth0 (192.168.1.x)');
  const [bpfFilter, setBpfFilter] = useState('');
  const [isCapturing, setIsCapturing] = useState(true);
  
  const [packets, setPackets] = useState<PacketEntry[]>([]);
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);
  
  const packetListEndRef = useRef<HTMLDivElement>(null);
  const nextPacketIdRef = useRef(1);

  // Load initial mock packets
  useEffect(() => {
    const initial = mockPackets.map((p, i) => ({
      ...p,
      id: `p-${i + 1}`
    }));
    setPackets(initial);
    nextPacketIdRef.current = initial.length + 1;
    if (initial.length > 0) {
      setSelectedPacketId(initial[0].id);
    }
  }, []);

  // Simulate packet capturing
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      // Pick a random packet from mockPackets as template
      const template = mockPackets[Math.floor(Math.random() * mockPackets.length)];
      
      // Jitter IP/ports slightly for variety
      const srcJitter = Math.random() > 0.6 ? `192.168.1.${Math.floor(2 + Math.random() * 253)}` : template.src;
      const sizeJitter = Math.floor(64 + Math.random() * 1400);
      const latencyJitter = Math.floor(2 + Math.random() * 80);

      const newPacket: PacketEntry = {
        ...template,
        id: `p-${nextPacketIdRef.current++}`,
        src: srcJitter,
        size: sizeJitter,
        latency: latencyJitter,
        timestamp: new Date().toISOString()
      };

      setPackets(prev => {
        const next = [...prev, newPacket];
        // Keep last 100 packets
        if (next.length > 100) return next.slice(next.length - 100);
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isCapturing]);

  // Auto-scroll to newest packet when capturing is active
  useEffect(() => {
    if (isCapturing) {
      packetListEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [packets, isCapturing]);

  const selectedPacket = useMemo(() => {
    return packets.find(p => p.id === selectedPacketId) || null;
  }, [packets, selectedPacketId]);

  // Hex dump helper generator
  const hexDump = useMemo(() => {
    if (!selectedPacket) return '';
    const bytes = Array.from({ length: selectedPacket.size }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    );
    
    // Format into rows of 16 bytes
    let result = '';
    for (let i = 0; i < Math.min(bytes.length, 128); i += 16) {
      const offset = i.toString(16).padStart(4, '0').toUpperCase();
      const chunk = bytes.slice(i, i + 16);
      const hexPart = chunk.join(' ');
      const asciiPart = chunk.map(b => {
        const code = parseInt(b, 16);
        return code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
      }).join('');
      result += `${offset}  ${hexPart.padEnd(47, ' ')}  |${asciiPart}|\n`;
    }
    if (selectedPacket.size > 128) {
      result += `... (truncated ${selectedPacket.size - 128} bytes of packet payload) ...`;
    }
    return result;
  }, [selectedPacket]);

  const handleClear = () => {
    setPackets([]);
    setSelectedPacketId(null);
  };

  const handleExport = () => {
    alert('Downloading PCAP file...');
  };

  // Node Icon helper for SVG flow
  const getNodeIconType = (nodeName: string) => {
    const lower = nodeName.toLowerCase();
    if (lower.includes('laptop')) return 'laptop';
    if (lower.includes('pc') || lower.includes('workstation')) return 'pc';
    if (lower.includes('server')) return 'server';
    if (lower.includes('switch')) return 'switch';
    if (lower.includes('ap') || lower.includes('wifi')) return 'wifi';
    if (lower.includes('router') || lower.includes('gateway')) return 'router';
    return 'globe';
  };

  // SVG Render Helper for Flow Path
  const flowPath = useMemo(() => {
    if (!selectedPacket) return [];
    
    const rawRoute = selectedPacket.route || [];
    
    // Map raw hops to visual objects
    return rawRoute.map((hop, i) => {
      const deviceObj = mockDevices.find(d => d.name === hop || d.hostname === hop);
      const ipAddress = deviceObj ? deviceObj.ip : (hop === 'Internet' ? selectedPacket.dst : '192.168.1.x');
      const icon = getNodeIconType(hop);
      
      let colorClass = 'blue';
      if (hop === 'Internet' || hop.includes('Google') || hop.includes('Apple') || hop.includes('Microsoft') || hop.includes('Azure')) {
        colorClass = 'green';
      } else if (hop.includes('Switch') || hop.includes('AP') || hop.includes('Router')) {
        colorClass = 'gray';
      } else if (hop.includes('Unknown') || hop.includes('Suspicious')) {
        colorClass = 'orange';
      }

      return {
        name: hop,
        ip: ipAddress,
        icon,
        colorClass,
        y: 40 + i * 90 // Visual Y placement
      };
    });
  }, [selectedPacket]);

  // Color mapping for protocol badges
  const getProtocolColor = (proto: string) => {
    switch (proto.toUpperCase()) {
      case 'TCP': return 'badge-info';
      case 'UDP': return 'badge-success';
      case 'DNS': return 'badge-info';
      case 'ICMP': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* Dynamic keyframe CSS injecting for the traveling dot */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes pulseDot {
          0% { r: 5; opacity: 1; }
          50% { r: 8; opacity: 0.7; }
          100% { r: 5; opacity: 1; }
        }
        .flow-line {
          stroke-dasharray: 5,5;
          animation: dash 1.5s linear infinite;
        }
        .packet-dot {
          animation: pulseDot 1s ease-in-out infinite;
        }
      `}} />

      {/* ── HEADER ────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Packet Tracker</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Monitor real-time packet flow across your network
        </p>
      </div>

      {/* ── CAPTURE CONTROLS BAR ──────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <select
            className="form-control"
            value={interfaceName}
            onChange={(e) => setInterfaceName(e.target.value)}
            style={{ width: '200px', padding: '6px 12px' }}
          >
            <option value="eth0 (192.168.1.x)">eth0 (192.168.1.x)</option>
            <option value="wlan0 (WiFi)">wlan0 (WiFi)</option>
            <option value="docker0 (172.17.x.x)">docker0 (172.17.x.x)</option>
          </select>

          <div style={{ position: 'relative', width: '220px' }}>
            <Filter size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="e.g. tcp port 443"
              value={bpfFilter}
              onChange={(e) => setBpfFilter(e.target.value)}
              style={{ paddingLeft: '30px', width: '100%', fontSize: 'var(--text-xs)' }}
            />
          </div>

          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={`btn ${isCapturing ? 'btn-danger' : 'btn-primary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            {isCapturing ? <Pause size={14} /> : <Play size={14} />}
            {isCapturing ? 'Stop Capture' : 'Start Capture'}
          </button>
          
          <button onClick={handleClear} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
            Clear
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className={`status-dot ${isCapturing ? 'online pulse' : 'offline'}`} style={{ width: 8, height: 8 }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
              {isCapturing ? 'Capturing...' : 'Stopped'}
            </span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', background: 'var(--bg-surface-2)', padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <strong>{packets.length}</strong> packets captured
          </span>
          <button onClick={handleExport} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* ── MAIN AREA: SPLIT LAYOUT ───────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', flex: '1', minHeight: '380px' }}>
        
        {/* LEFT PANEL: PACKET FLOW VISUALIZATION (55%) */}
        <div className="stat-card" style={{ flex: '0 0 55%', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <PackageSearch size={16} className="text-primary" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Packet Flow Trace</h3>
          </div>

          <div style={{ flex: 1, position: 'relative', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', minHeight: '320px' }}>
            {selectedPacket ? (
              <svg width="100%" height="100%" style={{ minHeight: '320px' }}>
                {/* DRAW ROUTE LINES */}
                {flowPath.slice(0, -1).map((hop, idx) => {
                  const nextHop = flowPath[idx + 1];
                  return (
                    <g key={`line-${idx}`}>
                      <line
                        x1="50%"
                        y1={hop.y + 16}
                        x2="50%"
                        y2={nextHop.y - 16}
                        stroke={selectedPacket.status === 'dropped' && idx === flowPath.length - 2 ? 'var(--color-danger)' : 'var(--color-primary-500)'}
                        strokeWidth="2"
                        className="flow-line"
                        style={{ opacity: 0.6 }}
                      />
                      {/* Animated packet dot */}
                      {isCapturing && (
                        <circle
                          cx="50%"
                          cy={hop.y + 16}
                          r={6}
                          fill={selectedPacket.status === 'dropped' && idx === flowPath.length - 2 ? 'var(--color-danger)' : '#16a34a'}
                          className="packet-dot"
                        >
                          <animate
                            attributeName="cy"
                            from={hop.y + 16}
                            to={nextHop.y - 16}
                            dur="1.2s"
                            repeatCount="indefinite"
                            begin={`${idx * 0.4}s`}
                          />
                        </circle>
                      )}
                      {/* Packet Info text on hover line */}
                      <text
                        x="53%"
                        y={(hop.y + nextHop.y) / 2}
                        fill="var(--text-tertiary)"
                        fontSize="9"
                        fontFamily="var(--font-mono)"
                      >
                        {selectedPacket.protocol} ({selectedPacket.latency}ms)
                      </text>
                    </g>
                  );
                })}

                {/* DRAW HOP NODES */}
                {flowPath.map((hop, idx) => {
                  let colorCode = '#3b82f6'; // blue
                  if (hop.colorClass === 'green') colorCode = '#16a34a';
                  if (hop.colorClass === 'gray') colorCode = '#64748b';
                  if (hop.colorClass === 'orange') colorCode = '#f97316';

                  return (
                    <g key={`node-${idx}`} transform={`translate(0, 0)`}>
                      {/* Rounded rect boundary */}
                      <rect
                        x="20%"
                        y={hop.y - 16}
                        width="60%"
                        height="32"
                        rx="6"
                        fill="var(--bg-surface)"
                        stroke={colorCode}
                        strokeWidth="1.5"
                      />
                      {/* Device name */}
                      <text
                        x="30%"
                        y={hop.y + 4}
                        fill="var(--text-primary)"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {hop.name}
                      </text>
                      {/* IP details */}
                      <text
                        x="78%"
                        y={hop.y + 4}
                        fill="var(--text-secondary)"
                        fontSize="9"
                        fontFamily="var(--font-mono)"
                        textAnchor="end"
                      >
                        {hop.ip}
                      </text>
                      {/* Custom Icon replacement inside SVG using simple drawing */}
                      <circle
                        cx="25%"
                        cy={hop.y}
                        r="8"
                        fill="var(--bg-surface-2)"
                        stroke={colorCode}
                        strokeWidth="1"
                      />
                      <circle
                        cx="25%"
                        cy={hop.y}
                        r="3"
                        fill={colorCode}
                      />
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="no-data" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Please capture or select a packet to trace path
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: PACKET LIST (45%) */}
        <div className="stat-card" style={{ flex: '1', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <PackageSearch size={16} style={{ color: 'var(--color-primary-500)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Live Capture Stream</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px var(--space-2)' }}>#</th>
                  <th style={{ padding: '8px var(--space-2)' }}>Protocol</th>
                  <th style={{ padding: '8px var(--space-2)' }}>Source</th>
                  <th style={{ padding: '8px var(--space-2)' }}>Dest</th>
                  <th style={{ padding: '8px var(--space-2)', textAlign: 'right' }}>Size</th>
                </tr>
              </thead>
              <tbody>
                {packets.map(p => {
                  const isSelected = p.id === selectedPacketId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPacketId(p.id)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--bg-selected)' : 'transparent',
                        transition: 'background var(--transition-fast)'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '8px var(--space-2)', fontFamily: 'var(--font-mono)' }}>
                        {p.id.split('-')[1]}
                      </td>
                      <td style={{ padding: '8px var(--space-2)' }}>
                        <span className={`badge ${getProtocolColor(p.protocol)}`} style={{ fontSize: '9px' }}>
                          {p.protocol}
                        </span>
                      </td>
                      <td style={{ padding: '8px var(--space-2)', fontFamily: 'var(--font-mono)' }} title={p.srcDevice}>
                        {p.src}
                      </td>
                      <td style={{ padding: '8px var(--space-2)', fontFamily: 'var(--font-mono)' }} title={p.dstDevice}>
                        {p.dst}
                      </td>
                      <td style={{ padding: '8px var(--space-2)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {p.size} B
                      </td>
                    </tr>
                  );
                })}
                <div ref={packetListEndRef} />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PANEL: PACKET DETAILS ──────────────────────── */}
      {selectedPacket && (
        <div className="stat-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className={`badge ${getProtocolColor(selectedPacket.protocol)}`}>
                {selectedPacket.protocol}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                Packet #{selectedPacket.id.split('-')[1]} Details
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {selectedPacket.timestamp}
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)' }}>
              Route Path: <strong style={{ color: 'var(--color-primary-500)' }}>{selectedPacket.route?.join(' ➔ ')}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            {/* Headers metadata info */}
            <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--text-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Source Node</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPacket.srcDevice} ({selectedPacket.src})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Destination Node</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPacket.dstDevice} ({selectedPacket.dst})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Destination Port</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedPacket.port}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Packet Length</span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedPacket.size} Bytes</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Path Latency</span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedPacket.latency} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery Status</span>
                <span className={`badge ${selectedPacket.status === 'delivered' ? 'badge-success' : 'badge-danger'}`} style={{ textTransform: 'capitalize' }}>
                  {selectedPacket.status}
                </span>
              </div>
            </div>

            {/* RAW HEX DUMP VIEW */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Raw Packet Hex Payload</span>
              <pre style={{
                margin: 0,
                padding: 'var(--space-4)',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--color-primary-400)',
                overflowX: 'auto',
                lineHeight: 1.5,
                maxHeight: '130px'
              }}>{hexDump}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
