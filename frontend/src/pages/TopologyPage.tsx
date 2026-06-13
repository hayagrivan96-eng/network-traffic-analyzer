import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState, BackgroundVariant,
  Panel, NodeProps, Handle, Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { mockDevices, Device, DeviceType } from '../data/mockData';
import { GitFork, Save, RotateCcw, Shield, ShieldOff, Router as RouterIcon, Wifi, Monitor, Laptop, Smartphone, Server, Camera, Tv, HelpCircle, Cpu } from 'lucide-react';
import { useDeviceStore } from '../store';

// ── CUSTOM DEVICE NODE COMPONENT ─────────────────────────────────
const CustomDeviceNode = ({ data }: NodeProps<{ device: Device; showLabels: boolean }>) => {
  const device = data.device;
  const showLabels = data.showLabels;

  const getIcon = (type: DeviceType) => {
    switch (type) {
      case 'router':
      case 'firewall':
        return <RouterIcon size={16} />;
      case 'switch':
        return <Cpu size={16} />;
      case 'access-point':
        return <Wifi size={16} />;
      case 'pc':
        return <Monitor size={16} />;
      case 'laptop':
        return <Laptop size={16} />;
      case 'phone':
      case 'tablet':
        return <Smartphone size={16} />;
      case 'server':
        return <Server size={16} />;
      case 'camera':
        return <Camera size={16} />;
      case 'smart-tv':
        return <Tv size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  // Node border color based on status and trust
  const getBorderColor = () => {
    if (device.status === 'offline') return 'var(--color-danger)';
    if (device.status === 'warning') return 'var(--color-warning)';
    if (device.trusted) return 'var(--color-success)';
    return 'var(--color-warning)'; // Untrusted online = orange
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `2px solid ${getBorderColor()}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-2) var(--space-4)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      minWidth: '120px',
      color: 'var(--text-primary)',
      position: 'relative'
    }}>
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} style={{ background: 'var(--border)', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--border)', width: 6, height: 6 }} />

      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--bg-surface-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary-500)',
        border: '1px solid var(--border)'
      }}>
        {getIcon(device.type)}
      </div>

      <div style={{ fontSize: '11px', fontWeight: 'var(--weight-semibold)', textAlign: 'center', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {device.name}
      </div>

      {showLabels && (
        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {device.ip}
        </div>
      )}

      {/* Trust Shield indicator */}
      <div style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: 'var(--bg-surface)',
        borderRadius: '50%',
        padding: '2px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {device.trusted ? (
          <Shield size={10} style={{ color: 'var(--color-success)' }} />
        ) : (
          <ShieldOff size={10} style={{ color: 'var(--color-danger)' }} />
        )}
      </div>

      {/* Online/Offline status dot */}
      <div style={{
        position: 'absolute',
        bottom: '2px',
        right: '4px',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: device.status === 'online' ? 'var(--color-success)' : device.status === 'offline' ? 'var(--color-danger)' : 'var(--color-warning)'
      }} />
    </div>
  );
};

const nodeTypes = { device: CustomDeviceNode };

export default function TopologyPage() {
  const { devices } = useDeviceStore();
  const [showLabels, setShowLabels] = useState(true);

  // Layout calculations
  const defaultLayout = useCallback((): { initialNodes: Node[], initialEdges: Edge[] } => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Separate devices by infrastructure
    const router = devices.find(d => d.type === 'router') || devices[0];
    const switchNode = devices.find(d => d.type === 'switch');
    const apNode = devices.find(d => d.type === 'access-point');

    if (!router) return { initialNodes, initialEdges };

    // Coordinates mapping
    const coords: Record<string, { x: number; y: number }> = {};

    // 1. Router at center
    coords[router.id] = { x: 400, y: 250 };

    // 2. Switch
    if (switchNode) {
      coords[switchNode.id] = { x: 300, y: 150 };
    }

    // 3. AP
    if (apNode) {
      coords[apNode.id] = { x: 500, y: 150 };
    }

    // Fanning nodes
    const wiredDevices = devices.filter(d => d.id !== router.id && d.id !== switchNode?.id && d.id !== apNode?.id && (d.connectedTo.includes(switchNode?.id || '') || !d.connectedTo.includes(apNode?.id || '')));
    const wirelessDevices = devices.filter(d => d.id !== router.id && d.id !== switchNode?.id && d.id !== apNode?.id && d.connectedTo.includes(apNode?.id || ''));

    // Fan wired devices around Switch
    wiredDevices.forEach((d, index) => {
      const angle = (index / Math.max(wiredDevices.length, 1)) * Math.PI - Math.PI / 2; // Fan upwards/sideways
      const radius = d.trusted ? 160 : 220; // Untrusted further away
      const centerX = switchNode ? coords[switchNode.id].x : coords[router.id].x;
      const centerY = switchNode ? coords[switchNode.id].y : coords[router.id].y;
      
      coords[d.id] = {
        x: centerX + Math.cos(angle) * radius - 60,
        y: centerY - Math.sin(angle) * radius - 40
      };
    });

    // Fan wireless devices around AP
    wirelessDevices.forEach((d, index) => {
      const angle = (index / Math.max(wirelessDevices.length, 1)) * Math.PI - Math.PI / 2;
      const radius = d.trusted ? 160 : 220;
      const centerX = apNode ? coords[apNode.id].x : coords[router.id].x;
      const centerY = apNode ? coords[apNode.id].y : coords[router.id].y;

      coords[d.id] = {
        x: centerX + Math.cos(angle) * radius - 60,
        y: centerY - Math.sin(angle) * radius - 40
      };
    });

    // Generate reactflow nodes
    devices.forEach(d => {
      const pos = coords[d.id] || { x: 200 + Math.random() * 400, y: 100 + Math.random() * 300 };
      initialNodes.push({
        id: d.id,
        type: 'device',
        position: pos,
        data: { device: d, showLabels },
      });
    });

    // Generate edges
    devices.forEach(d => {
      d.connectedTo.forEach(targetId => {
        const isUntrusted = !d.trusted || !(devices.find(x => x.id === targetId)?.trusted ?? true);
        const isRouterConn = targetId === router.id || d.id === router.id;
        
        initialEdges.push({
          id: `e-${d.id}-${targetId}`,
          source: targetId,
          target: d.id,
          animated: d.status === 'online' && !isUntrusted,
          style: {
            stroke: isUntrusted ? 'var(--color-warning)' : isRouterConn ? 'var(--color-primary-500)' : 'var(--text-tertiary)',
            strokeWidth: isRouterConn ? 2.5 : 1.5,
            strokeDasharray: isUntrusted ? '4,4' : undefined,
          }
        });
      });
    });

    return { initialNodes, initialEdges };
  }, [devices, showLabels]);

  const { initialNodes, initialEdges } = useMemo(() => defaultLayout(), [defaultLayout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync label visibility into nodes
  useEffect(() => {
    setNodes(prevNodes => prevNodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        showLabels
      }
    })));
  }, [showLabels, setNodes]);

  // Load from localStorage or reset on scan changes
  useEffect(() => {
    const saved = localStorage.getItem('ngp-topology-layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.nodes.length === devices.length) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          return;
        }
      } catch (e) {
        console.error('Failed to parse layout from localstorage', e);
      }
    }
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [devices, initialNodes, initialEdges, setNodes, setEdges]);

  // Auto Layout
  const handleAutoLayout = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  // Save Layout
  const handleSaveLayout = () => {
    const data = { nodes, edges };
    localStorage.setItem('ngp-topology-layout', JSON.stringify(data));
    alert('Network Topology layout saved successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      {/* ── HEADER ROW ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Network Topology</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {devices.length} devices, {edges.length} connections map
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={handleAutoLayout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <RotateCcw size={16} />
            Reset Layout
          </button>
          <button onClick={handleSaveLayout} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Save size={16} />
            Save Layout
          </button>
        </div>
      </div>

      {/* ── FLOW GRAPH CANVAS ─────────────────────────────────── */}
      <div style={{
        height: 'calc(100vh - 220px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--bg-app)',
        position: 'relative'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} color="var(--border)" size={1.5} gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const d = node.data?.device as Device | undefined;
              if (!d) return 'var(--border)';
              if (d.status === 'offline') return 'var(--color-danger)';
              if (d.status === 'warning') return 'var(--color-warning)';
              if (d.trusted) return 'var(--color-success)';
              return 'var(--color-warning)';
            }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
          />

          {/* Top-Left controls panel */}
          <Panel position="top-left" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-3)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Show IP Address Labels
            </label>
          </Panel>

          {/* Bottom-Right legend panel */}
          <Panel position="bottom-right" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-3)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '10px'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '2px' }}>
              Device Status Legend
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
              Online & Trusted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)' }} />
              Online & Untrusted / Warning
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
              Offline Device
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
              <span style={{ width: 15, height: 2, background: 'var(--color-primary-500)' }} />
              Connection to Router
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ width: 15, height: 2, borderBottom: '2px dashed var(--color-warning)' }} />
              Untrusted Connection
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
