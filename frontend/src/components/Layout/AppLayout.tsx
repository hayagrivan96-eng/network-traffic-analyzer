import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, GitFork, Activity, PackageSearch,
  ShieldAlert, Bell, FileBarChart, Settings, User, Shield,
  Sun, Moon, Search, LogOut, ChevronRight, Wifi, X,
  Menu, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { useAuthStore, useThemeStore, useAlertStore, useDeviceStore, useUIStore } from '../../store';
import { mockAlerts, mockDevices, mockNetworkHealth } from '../../data/mockData';
import { formatDistanceToNow } from 'date-fns';

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/devices',   icon: Monitor,         label: 'Devices' },
  { to: '/app/topology',  icon: GitFork,          label: 'Topology' },
  { to: '/app/traffic',   icon: Activity,         label: 'Traffic Monitor' },
  { to: '/app/packets',   icon: PackageSearch,    label: 'Packet Tracker' },
  { to: '/app/security',  icon: ShieldAlert,      label: 'Security' },
  { to: '/app/alerts',    icon: Bell,             label: 'Alerts' },
  { to: '/app/reports',   icon: FileBarChart,     label: 'Reports' },
];

const BOTTOM_ITEMS = [
  { to: '/app/settings', icon: Settings, label: 'Settings' },
  { to: '/app/profile',  icon: User,     label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout }         = useAuthStore();
  const { theme, toggleTheme }   = useThemeStore();
  const { alerts, unreadCount, setAlerts } = useAlertStore();
  const { setDevices, setLastScanTime } = useDeviceStore();
  const { globalSearchOpen, setGlobalSearchOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Initialize and poll from backend API with offline fallback
  useEffect(() => {
    // Load mock data as initial state
    setDevices(mockDevices);
    setAlerts(mockAlerts);
    setLastScanTime(new Date().toISOString());

    const fetchData = async () => {
      try {
        const devRes = await fetch('http://localhost:8000/api/devices');
        if (devRes.ok) {
          const devData = await devRes.json();
          if (devData && devData.length > 0) {
            setDevices(devData);
          }
        }

        const alertRes = await fetch('http://localhost:8000/api/alerts');
        if (alertRes.ok) {
          const alertData = await alertRes.json();
          if (alertData && alertData.length > 0) {
            setAlerts(alertData);
          }
        }
      } catch (err) {
        // Offline mode fallback, do nothing
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
        setShowAlertPanel(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (globalSearchOpen) searchRef.current?.focus();
  }, [globalSearchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const map: Record<string, string> = {
      '/app/dashboard': 'Dashboard',
      '/app/devices':   'Device Inventory',
      '/app/topology':  'Network Topology',
      '/app/traffic':   'Traffic Monitor',
      '/app/packets':   'Packet Tracker',
      '/app/security':  'Security Center',
      '/app/alerts':    'Alerts',
      '/app/reports':   'Reports',
      '/app/settings':  'Settings',
      '/app/profile':   'Profile',
    };
    return map[location.pathname] ?? 'Network Guardian Pro';
  };

  const health = mockNetworkHealth;

  const healthColor = (score: number) => {
    if (score >= 90) return 'var(--color-success)';
    if (score >= 70) return '#22c55e';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const alertIcon = (level: string) => {
    if (level === 'critical') return <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />;
    if (level === 'warning')  return <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />;
    return <Info size={14} style={{ color: 'var(--color-info)' }} />;
  };

  const filteredDevices = mockDevices.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.ip.includes(searchQuery) ||
    d.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.hostname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-text">Guardian Pro</div>
            <div className="sidebar-logo-sub">Network Monitor</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-label">Monitor</div>
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="nav-icon" size={18} />
                <span>{label}</span>
                {label === 'Alerts' && unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
                {label === 'Security' && (
                  <span className="nav-badge" style={{ background: 'var(--color-warning)' }}>3</span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-label">Account</div>
            {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="nav-icon" size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
            <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
              <LogOut className="nav-icon" size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Network status pill */}
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Network Health</span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: healthColor(health.score) }}>
              {health.score}/100
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${health.score}%`, background: healthColor(health.score) }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            <span className="status-dot online pulse" />
            <span>Internet Connected</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <main className="app-main">
        {/* Top Nav */}
        <header className="app-topnav">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {getPageTitle()}
            </h1>
          </div>

          {/* Search */}
          <button
            className="btn btn-secondary btn-sm"
            style={{ gap: 'var(--space-2)', width: 220, justifyContent: 'flex-start', color: 'var(--text-tertiary)' }}
            onClick={() => setGlobalSearchOpen(true)}
          >
            <Search size={14} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>⌘K</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {/* Theme toggle */}
            <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Alerts */}
            <button
              className="btn-icon"
              onClick={() => setShowAlertPanel(!showAlertPanel)}
              style={{ position: 'relative' }}
              title="Alerts"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--color-danger)',
                  border: '2px solid var(--bg-topnav)',
                }} />
              )}
            </button>

            {/* User */}
            <button
              className="btn-icon"
              onClick={() => navigate('/app/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--color-primary-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-xs)', fontWeight: 700, color: '#fff',
              }}>
                {user?.name?.slice(0, 1) ?? 'U'}
              </div>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="app-content">
          <div className="app-workspace">
            <Outlet />
          </div>
        </div>

        {/* Status Bar */}
        <footer className="app-statusbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="status-dot online" />
            <span>Agent Active</span>
          </div>
          <span>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Wifi size={12} />
            <span>{mockDevices.filter(d => d.status === 'online').length} devices online</span>
          </div>
          <span>|</span>
          <span>Last scan: {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
          <span style={{ marginLeft: 'auto' }}>v1.0.0 · Network Guardian Pro</span>
        </footer>
      </main>

      {/* ── ALERT PANEL ───────────────────────────────────── */}
      {showAlertPanel && (
        <div
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: 360, background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border)',
            zIndex: 'var(--z-modal)', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)', animation: 'slide-in-left 0.2s ease',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>Alerts ({unreadCount} new)</span>
            <button className="btn-icon" onClick={() => setShowAlertPanel(false)}><X size={16} /></button>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: '1px solid var(--border-subtle)',
                  opacity: alert.read ? 0.6 : 1,
                  background: alert.read ? 'transparent' : 'var(--bg-surface-2)',
                }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  {alertIcon(alert.level)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{alert.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{alert.message}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  {!alert.read && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary-500)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--border)' }}>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { navigate('/app/alerts'); setShowAlertPanel(false); }}
            >
              View All Alerts <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── GLOBAL SEARCH MODAL ───────────────────────────── */}
      {globalSearchOpen && (
        <div className="modal-overlay" onClick={() => setGlobalSearchOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: 600 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border)',
            }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input
                ref={searchRef}
                className="input"
                style={{ border: 'none', padding: 0, fontSize: 'var(--text-md)', background: 'transparent' }}
                placeholder="Search devices, IPs, MAC addresses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="btn-icon" onClick={() => setGlobalSearchOpen(false)}><X size={16} /></button>
            </div>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {searchQuery.trim() === '' ? (
                <div className="no-data" style={{ padding: 'var(--space-8)' }}>
                  <Search size={32} style={{ opacity: 0.3 }} />
                  <span>Type to search devices, IPs, MACs...</span>
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="no-data" style={{ padding: 'var(--space-8)' }}>
                  <span>No results found for "{searchQuery}"</span>
                </div>
              ) : (
                filteredDevices.map(d => (
                  <button
                    key={d.id}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                      padding: 'var(--space-4) var(--space-5)', background: 'none', border: 'none',
                      borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer',
                      textAlign: 'left', transition: 'background var(--transition-fast)',
                    }}
                    onClick={() => {
                      navigate('/app/devices');
                      setGlobalSearchOpen(false);
                      setSearchQuery('');
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span className={`status-dot ${d.status}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{d.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {d.ip} · {d.mac}
                      </div>
                    </div>
                    <span className={`badge badge-${d.status === 'online' ? 'success' : d.status === 'warning' ? 'warning' : 'danger'}`}>
                      {d.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
