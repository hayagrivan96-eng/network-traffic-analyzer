import React, { useState, useMemo } from 'react';
import {
  Search, Filter, RefreshCw, Download, Plus, Monitor, Laptop,
  Smartphone, Server, Router, Wifi, Camera, Tv, Printer, HelpCircle,
  ChevronUp, ChevronDown, Eye, Shield, ShieldOff, X, Activity, Cpu
} from 'lucide-react';
import { useDeviceStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import type { Device, DeviceType, RiskLevel, DeviceStatus } from '../data/mockData';

export default function DevicesPage() {
  const { devices, selectedDeviceId, selectDevice, isScanning, setScanning, setLastScanTime, updateDevice } = useDeviceStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<keyof Device>('ip');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const selectedDevice = useMemo(() => {
    return devices.find(d => d.id === selectedDeviceId) || null;
  }, [devices, selectedDeviceId]);

  const handleSort = (field: keyof Device) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Trigger network scan
  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setLastScanTime(new Date().toISOString());
    }, 2000);
  };

  // Export to CSV
  const handleExport = () => {
    const headers = 'ID,Name,Hostname,IP,MAC,Vendor,Type,Status,Risk,Latency,Trusted\n';
    const rows = devices.map(d => 
      `"${d.id}","${d.name}","${d.hostname}","${d.ip}","${d.mac}","${d.vendor}","${d.type}","${d.status}","${d.riskLevel}",${d.latency || 0},${d.trusted}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `devices-export-${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  // Device type icon mapping
  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'router':
      case 'firewall':
        return <Router size={16} />;
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
      case 'printer':
        return <Printer size={16} />;
      case 'camera':
        return <Camera size={16} />;
      case 'smart-tv':
        return <Tv size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  // Filters & Search & Sort logic
  const filteredSortedDevices = useMemo(() => {
    return devices
      .filter(d => {
        const matchesSearch = 
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.ip.includes(search) ||
          d.mac.toLowerCase().includes(search.toLowerCase()) ||
          d.hostname.toLowerCase().includes(search.toLowerCase()) ||
          d.vendor.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        const matchesType = typeFilter === 'all' || d.type === typeFilter;
        const matchesRisk = riskFilter === 'all' || d.riskLevel === riskFilter;

        return matchesSearch && matchesStatus && matchesType && matchesRisk;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle null values
        if (valA === null || valA === undefined) return sortDirection === 'asc' ? 1 : -1;
        if (valB === null || valB === undefined) return sortDirection === 'asc' ? -1 : 1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          // IP sorting helper
          if (sortField === 'ip') {
            const ipToNum = (ip: string) => ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
            return sortDirection === 'asc' 
              ? ipToNum(valA) - ipToNum(valB)
              : ipToNum(valB) - ipToNum(valA);
          }
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          return sortDirection === 'asc'
            ? (valA === valB ? 0 : valA ? -1 : 1)
            : (valA === valB ? 0 : valA ? 1 : -1);
        }

        // Numerical sorting (like latency or nested bandwidth which we won't sort by directly, but just in case)
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        return 0;
      });
  }, [devices, search, statusFilter, typeFilter, riskFilter, sortField, sortDirection]);

  // Small metrics calculations
  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const offline = devices.filter(d => d.status === 'offline').length;
    const warning = devices.filter(d => d.status === 'warning').length;
    const highRisk = devices.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical').length;

    return { total, online, offline, warning, highRisk };
  }, [devices]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      {/* ── HEADER ROW ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Device Inventory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>All discovered devices on your network</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={handleExport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={handleScan} className="btn btn-primary" disabled={isScanning} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Scanning Network...' : 'Scan Network'}
          </button>
        </div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Discovered</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>{stats.total}</div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-4)', borderLeft: '3px solid var(--color-success)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Online</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-success)', marginTop: '4px' }}>{stats.online}</div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-4)', borderLeft: '3px solid var(--color-danger)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Offline</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-danger)', marginTop: '4px' }}>{stats.offline}</div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-4)', borderLeft: '3px solid var(--color-warning)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Warning</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-warning)', marginTop: '4px' }}>{stats.warning}</div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-4)', borderLeft: '3px solid var(--color-danger)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>High Risk</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-danger)', marginTop: '4px' }}>{stats.highRisk}</div>
        </div>
      </div>

      {/* ── FILTER ROW ────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by IP, MAC, Name, Hostname..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '130px', padding: '6px 12px' }}>
            <option value="all">Status: All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="warning">Warning</option>
          </select>

          <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '130px', padding: '6px 12px' }}>
            <option value="all">Type: All</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="access-point">Access Point</option>
            <option value="pc">PC</option>
            <option value="laptop">Laptop</option>
            <option value="phone">Phone</option>
            <option value="server">Server</option>
            <option value="printer">Printer</option>
            <option value="camera">Camera</option>
            <option value="smart-tv">Smart TV</option>
            <option value="unknown">Unknown</option>
          </select>

          <select className="form-control" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} style={{ width: '130px', padding: '6px 12px' }}>
            <option value="all">Risk: All</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* ── MAIN LAYOUT WITH SLIDE PANEL ─────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', flex: '1', minHeight: 0, position: 'relative' }}>
        
        {/* TABLE CONTAINER */}
        <div style={{
          flex: 1,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
                  <th onClick={() => handleSort('name')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Device
                      {sortField === 'name' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th onClick={() => handleSort('ip')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      IP Address
                      {sortField === 'ip' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th onClick={() => handleSort('mac')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      MAC Address
                      {sortField === 'mac' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th onClick={() => handleSort('vendor')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Vendor
                      {sortField === 'vendor' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th onClick={() => handleSort('type')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Type
                      {sortField === 'type' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th onClick={() => handleSort('status')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Status
                      {sortField === 'status' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th onClick={() => handleSort('latency')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Latency
                      {sortField === 'latency' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th onClick={() => handleSort('riskLevel')} style={{ padding: '12px var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Risk
                      {sortField === 'riskLevel' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </div>
                  </th>
                  <th style={{ padding: '12px var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSortedDevices.length > 0 ? (
                  filteredSortedDevices.map(d => {
                    const isSelected = d.id === selectedDeviceId;
                    return (
                      <tr
                        key={d.id}
                        onClick={() => selectDevice(isSelected ? null : d.id)}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--bg-selected)' : 'transparent',
                          transition: 'background var(--transition-fast)'
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '12px var(--space-4)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--radius)',
                              background: 'var(--bg-surface-2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-primary-500)'
                            }}>
                              {getDeviceIcon(d.type)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                                {d.name}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{d.hostname}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                          {d.ip}
                        </td>
                        <td style={{ padding: '12px var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          {d.mac}
                        </td>
                        <td style={{ padding: '12px var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {d.vendor}
                        </td>
                        <td style={{ padding: '12px var(--space-4)' }}>
                          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{d.type}</span>
                        </td>
                        <td style={{ padding: '12px var(--space-4)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span className={`status-dot ${d.status === 'online' ? 'online' : d.status === 'offline' ? 'offline' : 'warning'}`} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                              {d.status}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {d.status === 'online' && d.latency !== null ? `${d.latency} ms` : '--'}
                        </td>
                        <td style={{ padding: '12px var(--space-4)' }}>
                          <span className={`badge ${
                            d.riskLevel === 'low' ? 'badge-success' : 
                            d.riskLevel === 'medium' ? 'badge-warning' : 
                            'badge-danger'
                          }`} style={{ textTransform: 'capitalize' }}>
                            {d.riskLevel}
                          </span>
                        </td>
                        <td style={{ padding: '12px var(--space-4)' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                              onClick={() => selectDevice(isSelected ? null : d.id)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)' }}
                            >
                              <Eye size={12} /> Details
                            </button>
                            <button
                              onClick={() => updateDevice(d.id, { trusted: !d.trusted })}
                              className="btn btn-secondary"
                              style={{ padding: '4px' }}
                              title={d.trusted ? 'Mark Untrusted' : 'Mark Trusted'}
                            >
                              {d.trusted ? (
                                <Shield size={14} style={{ color: 'var(--color-success)' }} />
                              ) : (
                                <ShieldOff size={14} style={{ color: 'var(--color-danger)' }} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <HelpCircle size={48} style={{ opacity: 0.3, margin: '0 auto var(--space-3)' }} />
                      No devices match filters or search queries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)'
          }}>
            <span>Showing {filteredSortedDevices.length} of {devices.length} devices</span>
            <div>
              Last network scan: {devices.length > 0 && devices[0].lastSeen ? formatDistanceToNow(new Date(devices[0].lastSeen)) + ' ago' : 'Never'}
            </div>
          </div>
        </div>

        {/* ── DETAILED SLIDE PANEL ───────────────────────────── */}
        {selectedDevice && (
          <div style={{
            width: '380px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
            overflowY: 'auto',
            height: '100%',
            position: 'sticky',
            top: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-500)'
                }}>
                  {getDeviceIcon(selectedDevice.type)}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                    {selectedDevice.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span className={`status-dot ${selectedDevice.status === 'online' ? 'online' : 'offline'}`} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {selectedDevice.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => selectDevice(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* QUICK METRICS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div style={{ background: 'var(--bg-surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Ping Latency</div>
                <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedDevice.status === 'online' && selectedDevice.latency !== null ? `${selectedDevice.latency} ms` : '--'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Packet Loss</div>
                <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: selectedDevice.packetLoss > 1 ? 'var(--color-danger)' : 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedDevice.packetLoss}%
                </div>
              </div>
            </div>

            {/* DETAILS ACCORDION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>System Details</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>IP Address</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedDevice.ip}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>MAC Address</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedDevice.mac}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hostname</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedDevice.hostname || '--'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>NIC Vendor</span>
                  <span style={{ color: 'var(--text-primary)' }} title={selectedDevice.vendor}>{selectedDevice.vendor || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Operating System</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedDevice.os || 'Unknown OS'}</span>
                </div>
              </div>
            </div>

            {/* OPEN PORTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Open Ports ({selectedDevice.openPorts.length})</h4>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {selectedDevice.openPorts.length > 0 ? (
                  selectedDevice.openPorts.map(port => (
                    <span key={port} className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                      {port}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>No open ports detected</span>
                )}
              </div>
            </div>

            {/* BANDWIDTH CONSUMPTION */}
            {selectedDevice.status === 'online' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Network Usage</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Download</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{selectedDevice.bandwidth.down} MB/s</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(selectedDevice.bandwidth.down * 4, 100)}%`, background: 'var(--color-success)' }} />
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Upload</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-500)' }}>{selectedDevice.bandwidth.up} MB/s</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(selectedDevice.bandwidth.up * 4, 100)}%`, background: 'var(--color-primary-500)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* TRUST SETTINGS */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>Trust This Device</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Trusted devices don't trigger intrusion alerts</div>
              </div>
              <button
                onClick={() => updateDevice(selectedDevice.id, { trusted: !selectedDevice.trusted })}
                className={`btn ${selectedDevice.trusted ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}
              >
                {selectedDevice.trusted ? (
                  <>
                    <Shield size={12} /> Trusted
                  </>
                ) : (
                  <>
                    <ShieldOff size={12} /> Untrusted
                  </>
                )}
              </button>
            </div>

            {/* NOTES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
              <label htmlFor="notes" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Device Notes
              </label>
              <textarea
                id="notes"
                className="form-control"
                style={{ flex: 1, minHeight: '80px', fontSize: 'var(--text-xs)', resize: 'none' }}
                placeholder="Add device tag, room number, or specific information..."
                value={selectedDevice.notes}
                onChange={(e) => updateDevice(selectedDevice.id, { notes: e.target.value })}
              />
            </div>

            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>First Discovered: {selectedDevice.firstSeen ? new Date(selectedDevice.firstSeen).toLocaleDateString() : 'Unknown'}</span>
              <span>Last Seen: {selectedDevice.lastSeen ? formatDistanceToNow(new Date(selectedDevice.lastSeen)) + ' ago' : 'Unknown'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
