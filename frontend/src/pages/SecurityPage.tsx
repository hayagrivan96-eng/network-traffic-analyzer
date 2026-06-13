import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, Shield, Eye, CheckCircle, XCircle, Clock, ExternalLink, Filter, HelpCircle, ShieldCheck } from 'lucide-react';
import { mockSecurityEvents, mockDevices, type SecurityEvent, type Device } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'resolved'>('all');

  // Resolve security event
  const handleResolveEvent = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalDetected = events.length;
    const unresolved = events.filter(e => !e.resolved).length;
    const highRiskDevices = mockDevices.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical').length;
    const eventsLast24h = events.filter(e => new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

    return { totalDetected, unresolved, highRiskDevices, eventsLast24h };
  }, [events]);

  // Recommendations mock list
  const [recommendations, setRecommendations] = useState([
    {
      id: 'rec-1',
      title: 'Update Camera Firmware',
      severity: 'critical',
      description: 'Hikvision camera IP Camera 01 (192.168.1.150) is vulnerable to remote code execution (CVE-2023-28808).',
      fixed: false
    },
    {
      id: 'rec-2',
      title: 'Isolate Unknown Device',
      severity: 'high',
      description: 'A device with unknown hostname at 192.168.1.199 is executing outbound scanner traffic.',
      fixed: false
    },
    {
      id: 'rec-3',
      title: 'Enable Admin 2FA',
      severity: 'medium',
      description: 'Admin console logs show Alex Mitchell (admin@ngpro.local) is not using two-factor authentication.',
      fixed: false
    },
    {
      id: 'rec-4',
      title: 'Change Default SSH Credentials',
      severity: 'medium',
      description: 'Default credentials vulnerability scan matched SSH service running on Dev Laptop (192.168.1.11).',
      fixed: false
    }
  ]);

  const handleFixRec = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, fixed: true } : r));
  };

  // Filtering events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterTab === 'all') return true;
      if (filterTab === 'resolved') return e.resolved;
      return e.severity === filterTab && !e.resolved;
    });
  }, [events, filterTab]);

  const highRiskDevicesList = useMemo(() => {
    return mockDevices.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* ── HEADER ROW ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Security Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Monitor vulnerabilities, intrusions, and scan configurations
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 'var(--radius)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>Security Score:</span>
          <span className="badge badge-danger" style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>61 / 100 (Fair)</span>
        </div>
      </div>

      {/* ── 4 STAT CARDS ──────────────────────────────────────── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-danger)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Threats Detected</span>
            <div className="stat-card-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{stats.totalDetected}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Lifetime detections</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Unresolved Issues</span>
            <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-warning)' }}>{stats.unresolved}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Requires action</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-danger)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">High Risk Devices</span>
            <div className="stat-card-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
              <Shield size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-danger)' }}>{stats.highRiskDevices}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Failing vulnerability scanner</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-primary-500)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Events (24h)</span>
            <div className="stat-card-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{stats.eventsLast24h}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Captured events in last day</div>
        </div>
      </div>

      {/* ── CONTENT AREA (2 COLUMNS) ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', flex: 1 }}>
        
        {/* LEFT PANEL: SECURITY EVENTS (60%) */}
        <div className="stat-card" style={{ flex: '0 0 60%', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShieldAlert size={16} className="text-danger" />
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>Security Event log</h3>
            </div>
            
            {/* Filter Tabs */}
            <div className="button-group" style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-2)', padding: '2px', borderRadius: 'var(--radius)' }}>
              {['all', 'critical', 'high', 'medium', 'resolved'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab as any)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: filterTab === tab ? 'var(--bg-surface)' : 'transparent',
                    color: filterTab === tab ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(e => (
                <div
                  key={e.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    background: e.resolved ? 'transparent' : 'var(--bg-surface-2)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    opacity: e.resolved ? 0.6 : 1,
                    transition: 'opacity var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className={`badge ${
                        e.severity === 'critical' ? 'badge-danger' : 
                        e.severity === 'high' ? 'badge-danger' : 
                        e.severity === 'medium' ? 'badge-warning' : 
                        'badge-info'
                      }`} style={{ textTransform: 'uppercase', fontSize: '9px' }}>
                        {e.severity}
                      </span>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{e.type}</strong>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      {formatDistanceToNow(new Date(e.timestamp))} ago
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                    {e.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      Source: <strong>{e.deviceName || 'Network Interface'}</strong> ({e.ip || 'Local Sniffer'})
                    </div>
                    
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      {!e.resolved && (
                        <>
                          <button
                            onClick={() => alert(`Opening investigation details for event: ${e.type}`)}
                            className="btn btn-secondary"
                            style={{ padding: '4px var(--space-3)', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} /> Investigate
                          </button>
                          <button
                            onClick={() => handleResolveEvent(e.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px var(--space-3)', color: 'var(--color-success)', borderColor: 'var(--color-success)', fontSize: '10px' }}
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      {e.resolved && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-success)', fontWeight: 600 }}>
                          <CheckCircle size={12} /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data" style={{ padding: 'var(--space-12)' }}>
                <ShieldCheck size={48} style={{ color: 'var(--color-success)', opacity: 0.4, margin: '0 auto var(--space-3)' }} />
                No security alerts detected for this selection.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: STACKED CARDS (40%) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* HIGH RISK DEVICES CARD */}
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <ShieldAlert size={16} className="text-danger" />
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>High Risk Hosts</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {highRiskDevicesList.length > 0 ? (
                highRiskDevicesList.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{d.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{d.ip}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className="badge badge-danger" style={{ fontSize: '8px', textTransform: 'uppercase' }}>{d.riskLevel}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{d.openPorts.length} Open Ports</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>
                  No high risk hosts flagged.
                </div>
              )}
            </div>
          </div>

          {/* RECOMMENDATIONS CARD */}
          <div className="stat-card" style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <ShieldCheck size={16} className="text-primary" />
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>Configuration Hardening</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', overflowY: 'auto', flex: 1 }}>
              {recommendations.map(r => (
                <div
                  key={r.id}
                  style={{
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    opacity: r.fixed ? 0.5 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`badge ${r.severity === 'critical' ? 'badge-danger' : r.severity === 'high' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '8px' }}>
                        {r.severity}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{r.title}</span>
                    </div>
                    {r.fixed ? (
                      <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600 }}>Fixed</span>
                    ) : (
                      <button
                        onClick={() => handleFixRec(r.id)}
                        className="btn btn-secondary"
                        style={{ padding: '2px 8px', fontSize: '9px' }}
                      >
                        Fix
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
