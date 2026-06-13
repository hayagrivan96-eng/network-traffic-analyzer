import React, { useState } from 'react';
import { Settings, Shield, Activity, Bell, Monitor, Users, Network, Info, Save, Plus, Trash2, Mail, ShieldAlert, Laptop, Eye, HelpCircle } from 'lucide-react';
import { useThemeStore, useAuthStore } from '../store';

type SettingsTab = 'discovery' | 'monitoring' | 'alerts' | 'appearance' | 'users' | 'subnets' | 'about';

interface MonitoredSubnet {
  id: string;
  cidr: string;
  name: string;
  deviceCount: number;
}

export default function SettingsPage() {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('discovery');

  // Discovery settings states
  const [scanInterval, setScanInterval] = useState('1m');
  const [discoveryMethods, setDiscoveryMethods] = useState({
    arp: true, ping: true, dns: true, snmp: false, ports: true
  });
  const [subnetsText, setSubnetsText] = useState('192.168.1.0/24');
  const [excludedIPs, setExcludedIPs] = useState('192.168.1.5\n192.168.1.6');

  // Monitoring settings states
  const [monitorInterval, setMonitorInterval] = useState(10);
  const [latencyThreshold, setLatencyThreshold] = useState(100);
  const [lossThreshold, setLossThreshold] = useState(2);
  const [bwThreshold, setBwThreshold] = useState(80);
  const [autoAlerts, setAutoAlerts] = useState(true);

  // Alerts states
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [alertEmail, setAlertEmail] = useState('admin@ngpro.local');
  const [alertTypes, setAlertTypes] = useState({
    offline: true, newDevice: true, bandwidth: true, loss: false, security: true
  });
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '06:00' });
  const [minAlertLevel, setMinAlertLevel] = useState<'info' | 'warning' | 'critical'>('warning');

  // Subnets list state
  const [subnetList, setSubnetList] = useState<MonitoredSubnet[]>([
    { id: 'sub-1', cidr: '192.168.1.0/24', name: 'Main Office Network', deviceCount: 8 },
    { id: 'sub-2', cidr: '10.0.10.0/24', name: 'Server VLAN', deviceCount: 2 }
  ]);
  const [newSubnetCidr, setNewSubnetCidr] = useState('');
  const [newSubnetName, setNewSubnetName] = useState('');

  // User list state
  const [usersList, setUsersList] = useState([
    { name: 'Alex Mitchell', email: 'admin@ngpro.local', role: 'admin', status: 'active', lastLogin: '10 mins ago' },
    { name: 'Jordan Lee', email: 'tech@ngpro.local', role: 'technician', status: 'active', lastLogin: '3 hours ago' },
    { name: 'Sam Rivera', email: 'sam@ngpro.local', role: 'viewer', status: 'inactive', lastLogin: 'Yesterday' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'technician' | 'viewer'>('viewer');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  const handleAddSubnet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubnetCidr || !newSubnetName) return;
    const newSub: MonitoredSubnet = {
      id: `sub-${Date.now()}`,
      cidr: newSubnetCidr,
      name: newSubnetName,
      deviceCount: 0
    };
    setSubnetList(prev => [...prev, newSub]);
    setNewSubnetCidr('');
    setNewSubnetName('');
  };

  const handleDeleteSubnet = (id: string) => {
    setSubnetList(prev => prev.filter(s => s.id !== id));
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newUser = {
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
      lastLogin: 'Never'
    };
    setUsersList(prev => [...prev, newUser]);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-6)', height: '100%', alignItems: 'flex-start' }}>
      
      {/* ── LEFT NAV MENU (240px) ────────────────────────────── */}
      <div style={{
        flex: '0 0 220px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        position: 'sticky',
        top: 0
      }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'var(--space-2) var(--space-3)' }}>
          Settings Panel
        </div>
        {[
          { id: 'discovery', label: 'Device Discovery', icon: Monitor },
          { id: 'monitoring', label: 'Monitoring Engine', icon: Activity },
          { id: 'alerts', label: 'Alerts & Email', icon: Bell },
          { id: 'appearance', label: 'Appearance', icon: Settings },
          { id: 'users', label: 'Users & Access', icon: Users },
          { id: 'subnets', label: 'Network Subnets', icon: Network },
          { id: 'about', label: 'System Info', icon: Info }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              style={{
                border: 'none',
                outline: 'none',
                background: activeTab === item.id ? 'var(--bg-selected)' : 'transparent',
                color: activeTab === item.id ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '10px var(--space-3)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── RIGHT CONTENT CARD ────────────────────────────────── */}
      <div className="stat-card" style={{ flex: 1, padding: 'var(--space-8)', minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
        
        {/* TABS CONTAINER */}
        <div style={{ flex: 1 }}>
          
          {/* TAB 1: DISCOVERY */}
          {activeTab === 'discovery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Device Discovery Settings</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Configure scanner intervals and sniffing protocols.</p>
              </div>

              <div>
                <label className="form-label">Discovery Scan Interval</label>
                <select className="form-control" value={scanInterval} onChange={(e) => setScanInterval(e.target.value)} style={{ width: '220px' }}>
                  <option value="10s">Fast (Every 10 seconds)</option>
                  <option value="30s">Moderate (Every 30 seconds)</option>
                  <option value="1m">Default (Every 1 minute)</option>
                  <option value="5m">Eco (Every 5 minutes)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Discovery Methods</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={discoveryMethods.arp} onChange={(e) => setDiscoveryMethods({ ...discoveryMethods, arp: e.target.checked })} />
                    ARP Scanning (Rapid local MAC discoveries)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={discoveryMethods.ping} onChange={(e) => setDiscoveryMethods({ ...discoveryMethods, ping: e.target.checked })} />
                    Ping Sweeping (ICMP request mapping)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={discoveryMethods.dns} onChange={(e) => setDiscoveryMethods({ ...discoveryMethods, dns: e.target.checked })} />
                    Reverse DNS Lookup (Hostname resolution)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={discoveryMethods.snmp} onChange={(e) => setDiscoveryMethods({ ...discoveryMethods, snmp: e.target.checked })} />
                    SNMP Poll (Extract switch and router configs)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={discoveryMethods.ports} onChange={(e) => setDiscoveryMethods({ ...discoveryMethods, ports: e.target.checked })} />
                    Port scanning (TCP SYN sweep)
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Excluded IP List</label>
                <textarea
                  className="form-control"
                  style={{ width: '100%', height: '80px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', resize: 'none' }}
                  placeholder="One IP per line, e.g. 192.168.1.50"
                  value={excludedIPs}
                  onChange={(e) => setExcludedIPs(e.target.value)}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveSettings} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Save size={14} /> Save Discovery Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MONITORING */}
          {activeTab === 'monitoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Monitoring Thresholds</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Configure thresholds to trigger warning and critical alerts.</p>
              </div>

              <div>
                <label className="form-label">Heartbeat Ping Interval: <strong style={{ color: 'var(--color-primary-500)' }}>{monitorInterval} seconds</strong></label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={monitorInterval}
                  onChange={(e) => setMonitorInterval(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--color-primary-500)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                <div>
                  <label className="form-label">Latency Warning</label>
                  <input
                    type="number"
                    className="form-control"
                    value={latencyThreshold}
                    onChange={(e) => setLatencyThreshold(parseInt(e.target.value, 10))}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>milliseconds</span>
                </div>
                <div>
                  <label className="form-label">Packet Loss Warning</label>
                  <input
                    type="number"
                    className="form-control"
                    value={lossThreshold}
                    onChange={(e) => setLossThreshold(parseInt(e.target.value, 10))}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>percent</span>
                </div>
                <div>
                  <label className="form-label">Bandwidth Max Threshold</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bwThreshold}
                    onChange={(e) => setBwThreshold(parseInt(e.target.value, 10))}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>percent interface cap</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={autoAlerts} onChange={(e) => setAutoAlerts(e.target.checked)} />
                  Auto-alert on persistent device offline (over 3 polling periods)
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveSettings} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Save size={14} /> Save Thresholds
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ALERTS */}
          {activeTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Alerts & notifications</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Configure target emails and filtering levels.</p>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 'var(--space-3)' }}>
                  <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
                  Send email notifications for critical alerts
                </label>

                {emailEnabled && (
                  <div style={{ position: 'relative', width: '320px' }}>
                    <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="email"
                      className="form-control"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      style={{ paddingLeft: '30px', width: '100%' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Notify for changes in</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={alertTypes.offline} onChange={(e) => setAlertTypes({ ...alertTypes, offline: e.target.checked })} />
                    Host offline outage events
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={alertTypes.newDevice} onChange={(e) => setAlertTypes({ ...alertTypes, newDevice: e.target.checked })} />
                    New device registration on subnet scan
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={alertTypes.bandwidth} onChange={(e) => setAlertTypes({ ...alertTypes, bandwidth: e.target.checked })} />
                    High bandwidth thresholds breaches
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={alertTypes.security} onChange={(e) => setAlertTypes({ ...alertTypes, security: e.target.checked })} />
                    Inbound intrusions / Port scanner events
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Minimum Alert Severity radio</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {(['info', 'warning', 'critical'] as const).map(lvl => (
                    <label key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer', textTransform: 'capitalize' }}>
                      <input type="radio" checked={minAlertLevel === lvl} onChange={() => setMinAlertLevel(lvl)} />
                      {lvl}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveSettings} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Save size={14} /> Save Notifications
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Appearance Settings</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Customise dashboard styles and time scales.</p>
              </div>

              <div>
                <label className="form-label">Theme Mode</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setTheme('light')}
                    className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: '0 0 120px' }}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: '0 0 120px' }}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Default Language</label>
                <select className="form-control" style={{ width: '220px' }}>
                  <option value="en">English (US)</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveSettings} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Save size={14} /> Save Appearance
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: USERS & ACCESS */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>User seat directory</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Manage team member roles and logins.</p>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)' }}>
                  <Plus size={14} /> Invite User
                </button>
              </div>

              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
                    <th style={{ padding: '8px var(--space-3)' }}>Name</th>
                    <th style={{ padding: '8px var(--space-3)' }}>Email Address</th>
                    <th style={{ padding: '8px var(--space-3)' }}>Role</th>
                    <th style={{ padding: '8px var(--space-3)' }}>Status</th>
                    <th style={{ padding: '8px var(--space-3)' }}>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                      <td style={{ padding: '10px var(--space-3)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{u.name}</td>
                      <td style={{ padding: '10px var(--space-3)' }}>{u.email}</td>
                      <td style={{ padding: '10px var(--space-3)' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'technician' ? 'badge-info' : 'badge-secondary'}`} style={{ textTransform: 'uppercase', fontSize: '8px' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className={`status-dot ${u.status === 'active' ? 'online' : u.status === 'invited' ? 'warning' : 'offline'}`} style={{ width: 6, height: 6 }} />
                          <span style={{ textTransform: 'capitalize' }}>{u.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px var(--space-3)', color: 'var(--text-secondary)' }}>{u.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Simple Invite Modal */}
              {showInviteModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100
                }}>
                  <div className="stat-card" style={{ width: '360px', padding: 'var(--space-6)', background: 'var(--bg-surface)' }}>
                    <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Invite New Member</h3>
                    <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <div>
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          required
                          className="form-control"
                          placeholder="you@ngpro.local"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label className="form-label">Role Access</label>
                        <select className="form-control" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} style={{ width: '100%' }}>
                          <option value="viewer">Viewer</option>
                          <option value="technician">Technician</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                        <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">Invite</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: NETWORK SUBNETS */}
          {activeTab === 'subnets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Monitored Subnets</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Configure target CIDR blocks scanned by the agent.</p>
              </div>

              {/* Subnets list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {subnetList.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)', padding: 'var(--space-4)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{sub.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub.cidr}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <span className="badge badge-info">{sub.deviceCount} active hosts</span>
                      <button onClick={() => handleDeleteSubnet(sub.id)} className="btn btn-secondary" style={{ padding: '6px', color: 'var(--color-danger)', borderColor: 'transparent' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add subnet form */}
              <form onSubmit={handleAddSubnet} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Subnet Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Guest WiFi"
                    value={newSubnetName}
                    onChange={(e) => setNewSubnetName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">CIDR Target Block</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="192.168.2.0/24"
                    value={newSubnetCidr}
                    onChange={(e) => setNewSubnetCidr(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px var(--space-4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Subnet
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: ABOUT */}
          {activeTab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>System Diagnostics</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>App statistics and database connections overview.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Product Version</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>v1.0.0 (Community Edition)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monitoring Agent Status</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--color-success)' }}>
                    <span className="status-dot online pulse" style={{ width: 6, height: 6 }} /> Active (Connected)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Backend Database</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>PostgreSQL (Connected)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Uptime</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>14 days, 6 hours, 12 minutes</span>
                </div>
              </div>

              <div className="info-box" style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <ShieldAlert size={20} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Need enterprise SLA integrations or multi-site database connections? Visit <a href="#" style={{ color: 'var(--color-primary-500)', textDecoration: 'none', fontWeight: 600 }}>networkguardian.pro/enterprise</a>.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
