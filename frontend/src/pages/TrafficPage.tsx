import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RefreshCw, Pause, Play, Download, Network } from 'lucide-react';
import { mockDevices, mockAppUsage, generateTrafficData, type Device, type AppUsage, type TrafficEntry } from '../data/mockData';
import { format } from 'date-fns';

const PROTOCOL_DATA = [
  { name: 'HTTPS', value: 42, color: '#3b82f6' },
  { name: 'DNS', value: 18, color: '#a855f7' },
  { name: 'HTTP', value: 12, color: '#3b82f6' },
  { name: 'ICMP', value: 8, color: '#64748b' },
  { name: 'SMB', value: 7, color: '#eab308' },
  { name: 'SSH', value: 5, color: '#f97316' },
  { name: 'Other', value: 8, color: '#94a3b8' }
];

export default function TrafficPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '30m' | '1h'>('1m');
  
  // Dynamic traffic tracking
  const [trafficData, setTrafficData] = useState<TrafficEntry[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState({ up: 12.1, down: 47.3 });
  const [peakSpeed, setPeakSpeed] = useState(89.4);
  const [totalToday, setTotalToday] = useState(24.8); // GB

  // Top Talkers dynamic bandwidth
  const [devicesTraffic, setDevicesTraffic] = useState<Device[]>([]);

  useEffect(() => {
    // Initial 60 points
    setTrafficData(generateTrafficData(60));
    setDevicesTraffic(mockDevices.filter(d => d.status === 'online'));
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // 1. Generate new point
      const nextUp = parseFloat((5 + Math.random() * 20).toFixed(1));
      const nextDown = parseFloat((15 + Math.random() * 50).toFixed(1));
      const total = parseFloat((nextUp + nextDown).toFixed(1));

      setCurrentSpeed({ up: nextUp, down: nextDown });
      setPeakSpeed(prev => Math.max(prev, total));
      setTotalToday(prev => parseFloat((prev + (total / 1024)).toFixed(3)));

      setTrafficData(prev => {
        const next = [...prev.slice(1), {
          time: new Date().toISOString(),
          upload: nextUp,
          download: nextDown,
          total: total
        }];
        return next;
      });

      // 2. Randomly jitter top talkers
      setDevicesTraffic(prev => {
        return prev.map(d => {
          if (Math.random() > 0.4) {
            const up = parseFloat((d.bandwidth.up + (Math.random() - 0.5) * 2).toFixed(1));
            const down = parseFloat((d.bandwidth.down + (Math.random() - 0.5) * 5).toFixed(1));
            return {
              ...d,
              bandwidth: {
                up: Math.max(0.1, up),
                down: Math.max(0.2, down)
              }
            };
          }
          return d;
        });
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Export report
  const handleExport = () => {
    alert('Exporting PDF network traffic report...');
  };

  // Calculations for Top Talkers
  const topTalkersSorted = React.useMemo(() => {
    return [...devicesTraffic]
      .map(d => ({
        ...d,
        totalBandwidth: d.bandwidth.up + d.bandwidth.down
      }))
      .sort((a, b) => b.totalBandwidth - a.totalBandwidth);
  }, [devicesTraffic]);

  const totalDevicesTraffic = React.useMemo(() => {
    return topTalkersSorted.reduce((sum, d) => sum + d.totalBandwidth, 0);
  }, [topTalkersSorted]);

  const getAppCategoryColor = (cat: string) => {
    switch (cat) {
      case 'streaming': return '#3b82f6'; // blue
      case 'video-calls': return '#16a34a'; // green
      case 'cloud': return '#a855f7'; // purple
      case 'development': return '#f97316'; // orange
      default: return '#94a3b8'; // gray
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* ── HEADER ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Traffic Monitor</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Real-time interface utilization and deep packet breakdown
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`btn ${isPaused ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? 'Resume Capture' : 'Pause Capture'}
          </button>
          <button onClick={handleExport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Download size={16} />
            Export Traffic Report
          </button>
        </div>
      </div>

      {/* ── ROW 1: 4 STATS CARDS ──────────────────────────────── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Card 1 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Current Download</span>
            <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>
            {currentSpeed.down.toFixed(1)} MB/s
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="status-dot online pulse" style={{ width: 6, height: 6 }} /> Active monitoring
          </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Current Upload</span>
            <div className="stat-card-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>
            {currentSpeed.up.toFixed(1)} MB/s
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="status-dot online pulse" style={{ width: 6, height: 6 }} /> Active monitoring
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Peak Today</span>
            <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-warning)' }}>
            {peakSpeed.toFixed(1)} MB/s
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Combined interface peak</div>
        </div>

        {/* Card 4 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Today</span>
            <div className="stat-card-icon" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
              <Network size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>
            {totalToday.toFixed(2)} GB
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Calculated since 12:00 AM</div>
        </div>
      </div>

      {/* ── ROW 2: LIVE BANDWIDTH GRAPH ───────────────────────── */}
      <div className="stat-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Activity size={16} className="text-primary" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Live Interface Bandwidth</h3>
          </div>
          <div className="button-group" style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-2)', padding: '2px', borderRadius: 'var(--radius)' }}>
            {(['1m', '5m', '30m', '1h'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTimeRange(tab)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: timeRange === tab ? 'var(--bg-surface)' : 'transparent',
                  color: timeRange === tab ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => {
                  try {
                    return format(new Date(t), 'HH:mm:ss');
                  } catch (e) {
                    return '';
                  }
                }}
                stroke="var(--text-tertiary)"
                style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}
              />
              <YAxis
                stroke="var(--text-tertiary)"
                style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v) => `${v} MB/s`}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'var(--text-secondary)', fontSize: '10px' }}
                itemStyle={{ fontSize: 'var(--text-xs)' }}
                labelFormatter={(t) => {
                  try {
                    return format(new Date(t), 'HH:mm:ss.SSS');
                  } catch (e) {
                    return '';
                  }
                }}
              />
              <Area type="monotone" dataKey="download" stroke="#16a34a" fillOpacity={1} fill="url(#downloadGrad)" strokeWidth={2} name="Download" />
              <Area type="monotone" dataKey="upload" stroke="#3b82f6" fillOpacity={1} fill="url(#uploadGrad)" strokeWidth={1.5} name="Upload" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 3: SPLIT 2 COLUMNS ────────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
        
        {/* TOP TALKERS TABLE (60%) */}
        <div className="stat-card" style={{ flex: '0 0 60%', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <Activity size={16} style={{ color: 'var(--color-warning)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Top Talkers</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
                  <th style={{ padding: '8px var(--space-2)' }}>Rank</th>
                  <th style={{ padding: '8px var(--space-2)' }}>Device</th>
                  <th style={{ padding: '8px var(--space-2)' }}>IP Address</th>
                  <th style={{ padding: '8px var(--space-2)', textAlign: 'right' }}>Download</th>
                  <th style={{ padding: '8px var(--space-2)', textAlign: 'right' }}>Upload</th>
                  <th style={{ padding: '8px var(--space-2)', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '8px var(--space-2)', width: '100px' }}>Usage %</th>
                </tr>
              </thead>
              <tbody>
                {topTalkersSorted.map((d, index) => {
                  const percent = totalDevicesTraffic > 0 
                    ? Math.round((d.totalBandwidth / totalDevicesTraffic) * 100) 
                    : 0;
                  return (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: index === 0 ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        transition: 'background var(--transition-fast)'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '10px var(--space-2)', fontWeight: 'var(--weight-semibold)' }}>#{index + 1}</td>
                      <td style={{ padding: '10px var(--space-2)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                        {d.name}
                      </td>
                      <td style={{ padding: '10px var(--space-2)', fontFamily: 'var(--font-mono)' }}>{d.ip}</td>
                      <td style={{ padding: '10px var(--space-2)', textAlign: 'right', color: 'var(--color-success)' }}>
                        {d.bandwidth.down.toFixed(1)} MB/s
                      </td>
                      <td style={{ padding: '10px var(--space-2)', textAlign: 'right', color: 'var(--color-primary-500)' }}>
                        {d.bandwidth.up.toFixed(1)} MB/s
                      </td>
                      <td style={{ padding: '10px var(--space-2)', textAlign: 'right', fontWeight: 'bold' }}>
                        {d.totalBandwidth.toFixed(1)} MB/s
                      </td>
                      <td style={{ padding: '10px var(--space-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar" style={{ flex: 1, height: '4px' }}>
                            <div className="progress-bar-fill" style={{ width: `${percent}%`, background: index === 0 ? 'var(--color-danger)' : 'var(--color-primary-500)' }} />
                          </div>
                          <span style={{ minWidth: '24px', textAlign: 'right', fontWeight: 600 }}>{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PROTOCOL BREAKDOWN (40%) */}
        <div className="stat-card" style={{ flex: '1', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <Network size={16} style={{ color: 'var(--color-primary-500)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Protocol Breakdown</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '140px' }}>
            <PieChart width={160} height={160}>
              <Pie
                data={PROTOCOL_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {PROTOCOL_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div style={{ marginLeft: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>1,284,492</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Packets Captured Today</div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-4)',
            borderTop: '1px solid var(--border)',
            paddingTop: 'var(--space-4)',
            fontSize: 'var(--text-xs)'
          }}>
            {PROTOCOL_DATA.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '2px', background: p.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 4: APPLICATION DETECTION ───────────────────────── */}
      <div className="stat-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <Network size={16} style={{ color: 'var(--color-primary-500)' }} />
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Application Traffic Detection</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
          {mockAppUsage.map((app: AppUsage) => (
            <div
              key={app.name}
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                  {app.name}
                </span>
                <span className="badge" style={{
                  background: getAppCategoryColor(app.category) + '1a',
                  color: getAppCategoryColor(app.category),
                  fontSize: '9px',
                  textTransform: 'capitalize'
                }}>
                  {app.category}
                </span>
              </div>

              <div style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>
                {app.bandwidth.toFixed(1)} MB/s
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>{app.connections} connections</span>
                  <span>{app.percent}% of traffic</span>
                </div>
                <div className="progress-bar" style={{ height: '4px' }}>
                  <div className="progress-bar-fill" style={{ width: `${app.percent}%`, background: getAppCategoryColor(app.category) }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
