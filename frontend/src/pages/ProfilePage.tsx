import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { User, Key, Shield, Clock, ShieldAlert, Monitor, CheckCircle, Smartphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Alex Mitchell');
  const [show2FAInfo, setShow2FAInfo] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Activity list
  const [activity] = useState([
    { id: 'act-1', event: 'Logged in successfully from IP 192.168.1.10', time: new Date(Date.now() - 600000).toISOString() },
    { id: 'act-2', event: 'Generated Device Inventory PDF report', time: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'act-3', event: 'Updated Network Subnets configuration in settings', time: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 'act-4', event: 'Changed local dashboard theme to dark mode', time: new Date(Date.now() - 3600000 * 48).toISOString() }
  ]);

  // Session list
  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: 'Windows 11 Pro — Chrome', ip: '192.168.1.10 (This session)', active: true },
    { id: 'sess-2', device: 'iPhone 15 Mobile App', ip: '192.168.1.101', active: false }
  ]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-2) 0' }}>
      
      {/* ── PROFILE CARD ──────────────────────────────────────── */}
      <div className="stat-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-primary-600)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'var(--weight-bold)'
            }}>
              {name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                  {name}
                </h2>
                <span className="badge badge-danger" style={{ textTransform: 'uppercase', fontSize: '9px' }}>
                  {user?.role || 'admin'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: '2px' }}>
                {user?.email || 'admin@ngpro.local'}
              </p>
            </div>
          </div>
          
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
              Edit Profile
            </button>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-6)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-6)' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className="form-control"
                value={user?.email || 'admin@ngpro.local'}
                style={{ width: '100%', cursor: 'not-allowed' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </div>

      {/* ── SECURITY SECTION CARD ─────────────────────────────── */}
      <div className="stat-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          <Key size={16} className="text-primary" />
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Security & Auth</h3>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{ fontWeight: '600', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change Password</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-secondary">Update Password</button>
          </div>
        </form>

        {/* 2FA Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Protect your account with an authentication device.</div>
          </div>
          <button
            onClick={() => {
              setShow2FAInfo(true);
              alert('Scan barcode using Authenticator App (Google/Microsoft)');
            }}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
          >
            Enable 2FA
          </button>
        </div>

        {/* Active Sessions */}
        <div>
          <div style={{ fontWeight: '600', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>Active Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {sessions.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  {s.active ? <Monitor size={16} className="text-success" /> : <Smartphone size={16} className="text-secondary" />}
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{s.device}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{s.ip}</div>
                  </div>
                </div>
                {!s.active && (
                  <button onClick={() => handleRevokeSession(s.id)} className="btn btn-secondary animate-pulse" style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--color-danger)', borderColor: 'transparent' }}>
                    Revoke
                  </button>
                )}
                {s.active && (
                  <span className="badge badge-success" style={{ fontSize: '8px' }}>Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ACTIVITY SECTION CARD ────────────────────────────── */}
      <div className="stat-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          <Clock size={16} className="text-primary" />
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Recent Security Events</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {activity.map(act => (
            <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontSize: 'var(--text-xs)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{act.event}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{formatDistanceToNow(new Date(act.time))} ago</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── DANGER ZONE CARD ──────────────────────────────────── */}
      <div className="stat-card" style={{ padding: 'var(--space-6)', border: '1px solid var(--color-danger)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <ShieldAlert size={16} className="text-danger" />
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-danger)' }}>Danger Zone</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>Sign Out All Devices</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Revoke authorization tokens on all other connected devices.</div>
          </div>
          <button onClick={() => {
            alert('Signed out of all other devices successfully.');
            setSessions(prev => prev.filter(s => s.active));
          }} className="btn btn-secondary" style={{ padding: '6px 12px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', fontSize: 'var(--text-xs)' }}>
            Sign Out All
          </button>
        </div>
      </div>

    </div>
  );
}
