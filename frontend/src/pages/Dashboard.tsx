import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Monitor,
  CheckCircle,
  XCircle,
  HelpCircle,
  Activity,
  Clock,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
  Info,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  mockAlerts,
  mockAppUsage,
  mockNetworkHealth,
  generateTrafficData,
  type Alert,
  type AppUsage,
  type TrafficEntry,
} from '../data/mockData';
import { useDeviceStore, useAlertStore, useHealthStore } from '../store';

// ── HELPERS ───────────────────────────────────────────────────

function generatePoint(): TrafficEntry {
  return {
    time: new Date().toISOString(),
    upload: parseFloat((5 + Math.random() * 20).toFixed(1)),
    download: parseFloat((15 + Math.random() * 50).toFixed(1)),
    total: 0,
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

// ── STAT CARD ─────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatCard({ label, value, subtitle, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div
          className="stat-card-icon"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-sub">{subtitle}</div>
    </div>
  );
}

// ── APP USAGE CATEGORY COLORS ─────────────────────────────────

const categoryColors: Record<string, { bg: string; text: string; barColor: string }> = {
  streaming:      { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6', barColor: '#3b82f6' },
  'video-calls':  { bg: 'rgba(22,163,74,0.12)',   text: '#16a34a', barColor: '#16a34a' },
  cloud:          { bg: 'rgba(139,92,246,0.12)',  text: '#8b5cf6', barColor: '#8b5cf6' },
  development:    { bg: 'rgba(249,115,22,0.12)',  text: '#f97316', barColor: '#f97316' },
  other:          { bg: 'rgba(100,116,139,0.12)', text: '#64748b', barColor: '#64748b' },
};

// ── ALERT LEVEL CONFIG ────────────────────────────────────────

const alertConfig: Record<
  Alert['level'],
  { badgeClass: string; Icon: React.ElementType; iconColor: string }
> = {
  critical: { badgeClass: 'badge badge-danger',  Icon: AlertCircle,   iconColor: '#dc2626' },
  warning:  { badgeClass: 'badge badge-warning', Icon: AlertTriangle, iconColor: '#d97706' },
  info:     { badgeClass: 'badge badge-info',    Icon: Info,          iconColor: '#2563eb' },
};

// ── SVG CIRCLE PROGRESS ───────────────────────────────────────

interface CircleProgressProps {
  score: number;
  label: string;
}

function CircleProgress({ score, label }: CircleProgressProps) {
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = clamp(score / 100, 0, 1);
  const offset = circumference * (1 - progress);

  let scoreColor = '#16a34a';
  if (score < 50) scoreColor = '#dc2626';
  else if (score < 70) scoreColor = '#d97706';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4) 0',
      }}
    >
      <svg width={130} height={130} viewBox="0 0 130 130" style={{ display: 'block' }}>
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          stroke="var(--bg-surface-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '65px 65px',
            transition: 'stroke-dashoffset 0.6s ease',
          }}
        />
        <text
          x="65"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: '28px',
            fontWeight: 700,
            fill: scoreColor,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {score}
        </text>
        <text
          x="65"
          y="82"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: '11px',
            fill: 'var(--text-tertiary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          /100
        </text>
      </svg>
      <span
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          color: scoreColor,
          marginTop: 'var(--space-1)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── CUSTOM TOOLTIP ────────────────────────────────────────────

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function BandwidthTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--shadow-md)',
        fontSize: 'var(--text-xs)',
      }}
    >
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center gap-2"
          style={{ marginBottom: '2px' }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {entry.name}:
          </span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {entry.value.toFixed(1)} MB/s
          </span>
        </div>
      ))}
    </div>
  );
}

// ── HEALTH METRIC ROW ─────────────────────────────────────────

interface HealthMetricRowProps {
  label: string;
  value: number;
  displayValue: string;
  color: string;
}

function HealthMetricRow({ label, value, displayValue, color }: HealthMetricRowProps) {
  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 'var(--space-1)' }}
      >
        <span className="text-sm text-secondary">{label}</span>
        <span
          className="text-sm font-semibold"
          style={{ color, fontFamily: 'var(--font-mono)' }}
        >
          {displayValue}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${clamp(value, 0, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────

export default function Dashboard() {
  const devices     = useDeviceStore((s) => s.devices);
  const storeAlerts = useAlertStore((s) => s.alerts);
  const storeHealth = useHealthStore((s) => s.health);

  const totalDevices = devices.length || 10;
  const onlineCount  = devices.length ? devices.filter((d) => d.status === 'online').length  : 8;
  const offlineCount = devices.length ? devices.filter((d) => d.status === 'offline').length : 1;
  const unknownCount = devices.length
    ? devices.filter((d) => d.status !== 'online' && d.status !== 'offline').length
    : 1;

  const alerts = storeAlerts.length ? storeAlerts : mockAlerts;
  const health  = storeHealth ?? mockNetworkHealth;

  // ── Live bandwidth ───────────────────────────────────
  const [bandwidthData, setBandwidthData] = useState<TrafficEntry[]>(() =>
    generateTrafficData(60)
  );
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBandwidthData((prev) => {
        const next = [...prev.slice(-59), generatePoint()];
        return next.map((e) => ({ ...e, total: e.upload + e.download }));
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = useCallback(() => {
    setSpinning(true);
    setBandwidthData(generateTrafficData(60));
    setTimeout(() => setSpinning(false), 700);
  }, []);

  const lastPoint       = bandwidthData[bandwidthData.length - 1];
  const currentUpload   = lastPoint?.upload   ?? 0;
  const currentDownload = lastPoint?.download ?? 0;

  const tickFormatter = (_: string, index: number) => {
    const step = Math.max(1, Math.floor(bandwidthData.length / 6));
    if (index % step !== 0) return '';
    const entry = bandwidthData[index];
    if (!entry) return '';
    const d = new Date(entry.time);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  // ── Render ──────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Real-time overview of your network status and health
          </p>
        </div>
        <div className="page-actions">
          <span
            className="text-xs text-secondary font-mono"
            style={{
              padding: '4px 10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            Live · auto-refresh 3s
          </span>
          <div className="status-dot online pulse" />
        </div>
      </div>

      {/* ── Row 1: Stat Cards ────────────────────────── */}
      <div className="stat-grid">
        <StatCard
          label="Total Devices"
          value={totalDevices}
          subtitle="Monitored on network"
          icon={<Monitor size={16} />}
          iconBg="var(--bg-surface-2)"
          iconColor="var(--text-secondary)"
        />
        <StatCard
          label="Online"
          value={onlineCount}
          subtitle="Responding to ping"
          icon={<CheckCircle size={16} />}
          iconBg="rgba(22,163,74,0.12)"
          iconColor="#16a34a"
        />
        <StatCard
          label="Offline"
          value={offlineCount}
          subtitle="No response detected"
          icon={<XCircle size={16} />}
          iconBg="rgba(220,38,38,0.12)"
          iconColor="#dc2626"
        />
        <StatCard
          label="Unknown"
          value={unknownCount}
          subtitle="Needs investigation"
          icon={<HelpCircle size={16} />}
          iconBg="rgba(249,115,22,0.12)"
          iconColor="#f97316"
        />
        <StatCard
          label="Bandwidth"
          value="67.2 MB/s"
          subtitle="Total throughput now"
          icon={<Activity size={16} />}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3b82f6"
        />
        <StatCard
          label="Avg Latency"
          value="18ms"
          subtitle="Across all devices"
          icon={<Clock size={16} />}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3b82f6"
        />
        <StatCard
          label="Packet Loss"
          value="0.8%"
          subtitle="Network-wide average"
          icon={<AlertTriangle size={16} />}
          iconBg="rgba(217,119,6,0.12)"
          iconColor="#d97706"
        />
        <StatCard
          label="Security Score"
          value="61/100"
          subtitle="Action required"
          icon={<ShieldAlert size={16} />}
          iconBg="rgba(220,38,38,0.12)"
          iconColor="#dc2626"
        />
      </div>

      {/* ── Row 2: Bandwidth + App Usage ─────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--space-4)',
        }}
      >
        {/* Live Bandwidth Chart */}
        <div className="card">
          <div className="card-header">
            <span
              className="card-title"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <Activity size={16} style={{ color: '#3b82f6' }} />
              Live Bandwidth
            </span>
            <button
              className="btn-icon"
              onClick={handleRefresh}
              title="Refresh chart"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw
                size={15}
                className={spinning ? 'animate-spin' : ''}
              />
            </button>
          </div>

          <div className="card-body" style={{ paddingBottom: 'var(--space-4)' }}>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bandwidthData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -8 }}
                >
                  <defs>
                    <linearGradient id="gradUpload" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDownload" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickFormatter={tickFormatter}
                    tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}`}
                    width={36}
                  />
                  <Tooltip content={<BandwidthTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="upload"
                    name="upload"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#gradUpload)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="download"
                    name="download"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fill="url(#gradDownload)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Speed readout */}
            <div
              className="flex items-center gap-6"
              style={{
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span className="text-xs text-secondary">Upload</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#3b82f6', fontFamily: 'var(--font-mono)' }}
                >
                  {currentUpload.toFixed(1)} MB/s
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#16a34a',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span className="text-xs text-secondary">Download</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#16a34a', fontFamily: 'var(--font-mono)' }}
                >
                  {currentDownload.toFixed(1)} MB/s
                </span>
              </div>

              <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
                <span className="text-xs text-secondary">Total</span>
                <span
                  className="text-sm font-semibold text-primary"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {(currentUpload + currentDownload).toFixed(1)} MB/s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* App Usage */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">App Usage</span>
            <span className="text-xs text-secondary">by bandwidth</span>
          </div>

          <div
            className="card-body"
            style={{ padding: 'var(--space-4) var(--space-5)', overflowY: 'auto', maxHeight: 340 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {mockAppUsage.map((app: AppUsage) => {
                const cat = categoryColors[app.category] ?? categoryColors.other;
                return (
                  <div key={app.name}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: 'var(--space-1)' }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-sm font-medium text-primary truncate"
                          style={{ maxWidth: 90 }}
                        >
                          {app.name}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: cat.bg,
                            color: cat.text,
                            flexShrink: 0,
                            fontSize: 10,
                            padding: '1px 6px',
                          }}
                        >
                          {app.category}
                        </span>
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: cat.barColor,
                          fontFamily: 'var(--font-mono)',
                          flexShrink: 0,
                          marginLeft: 'var(--space-2)',
                        }}
                      >
                        {app.bandwidth.toFixed(1)}
                      </span>
                    </div>

                    <div className="progress-bar" style={{ height: 5 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${app.percent}%`,
                          background: cat.barColor,
                        }}
                      />
                    </div>

                    <div className="flex justify-between" style={{ marginTop: 2 }}>
                      <span className="text-xs text-tertiary">
                        {app.connections} connections
                      </span>
                      <span className="text-xs text-tertiary">{app.percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Alerts + Network Health ───────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-4)',
        }}
      >
        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <span
              className="card-title"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <AlertCircle size={16} style={{ color: '#dc2626' }} />
              Recent Alerts
            </span>
            <Link
              to="/app/alerts"
              className="flex items-center gap-1 text-xs"
              style={{
                color: 'var(--color-primary-500)',
                fontWeight: 'var(--weight-medium)',
              }}
            >
              View All
              <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alerts.slice(0, 5).map((alert: Alert, idx: number) => {
              const cfg = alertConfig[alert.level];
              const Icon = cfg.Icon;
              const isLast = idx === Math.min(4, alerts.length - 1);

              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3"
                  style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'default',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <Icon size={16} style={{ color: cfg.iconColor }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className="flex items-center gap-2"
                      style={{ marginBottom: 2 }}
                    >
                      <span
                        className="text-sm font-medium text-primary truncate"
                        style={{ maxWidth: 220 }}
                      >
                        {alert.title}
                      </span>
                      <span
                        className={cfg.badgeClass}
                        style={{ flexShrink: 0, fontSize: 10 }}
                      >
                        {alert.level}
                      </span>
                      {!alert.read && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#3b82f6',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                          title="Unread"
                        />
                      )}
                    </div>
                    <p
                      className="text-xs text-secondary truncate"
                      style={{ maxWidth: 320 }}
                    >
                      {alert.message}
                    </p>
                  </div>

                  <span
                    className="text-xs text-tertiary"
                    style={{ flexShrink: 0, marginTop: 1, whiteSpace: 'nowrap' }}
                  >
                    {formatDistanceToNow(new Date(alert.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Network Health */}
        <div className="card">
          <div className="card-header">
            <span
              className="card-title"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <Activity size={16} style={{ color: '#3b82f6' }} />
              Network Health
            </span>
            <span className="text-xs text-secondary">
              {formatDistanceToNow(new Date(health.lastUpdated), { addSuffix: true })}
            </span>
          </div>

          <div className="card-body">
            <CircleProgress score={health.score} label="Good" />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-2)',
              }}
            >
              <HealthMetricRow
                label="Device Availability"
                value={health.availability}
                displayValue={`${health.availability}%`}
                color="#16a34a"
              />
              <HealthMetricRow
                label="Latency Score"
                value={82}
                displayValue="82%"
                color="#3b82f6"
              />
              <HealthMetricRow
                label="Bandwidth Health"
                value={health.bandwidthHealth}
                displayValue={`${health.bandwidthHealth}%`}
                color="#8b5cf6"
              />
              <HealthMetricRow
                label="Security"
                value={health.securityScore}
                displayValue={`${health.securityScore}%`}
                color={health.securityScore < 70 ? '#dc2626' : '#16a34a'}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
