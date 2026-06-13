// Mock data for Network Guardian Pro
// Used when backend is not available

export type DeviceType =
  | 'router' | 'switch' | 'access-point' | 'firewall'
  | 'pc' | 'laptop' | 'phone' | 'tablet'
  | 'server' | 'printer' | 'camera' | 'smart-tv'
  | 'iot' | 'unknown';

export type DeviceStatus = 'online' | 'offline' | 'warning';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertLevel = 'info' | 'warning' | 'critical';
export type AlertType =
  | 'device_offline' | 'new_device' | 'high_bandwidth'
  | 'packet_loss' | 'internet_down' | 'security';

export interface Device {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  mac: string;
  vendor: string;
  type: DeviceType;
  status: DeviceStatus;
  firstSeen: string;
  lastSeen: string;
  riskLevel: RiskLevel;
  latency: number | null;
  packetLoss: number;
  bandwidth: { up: number; down: number };
  openPorts: number[];
  os: string;
  trusted: boolean;
  notes: string;
  connectedTo: string[];
}

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  message: string;
  deviceId?: string;
  deviceName?: string;
  timestamp: string;
  read: boolean;
}

export interface TrafficEntry {
  time: string;
  upload: number;
  download: number;
  total: number;
}

export interface PacketEntry {
  id: string;
  src: string;
  dst: string;
  srcDevice: string;
  dstDevice: string;
  protocol: string;
  port: number;
  size: number;
  latency: number;
  status: 'delivered' | 'dropped' | 'retransmitted';
  timestamp: string;
  route: string[];
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  deviceId?: string;
  deviceName?: string;
  ip?: string;
  timestamp: string;
  resolved: boolean;
}

export interface AppUsage {
  name: string;
  bandwidth: number;
  connections: number;
  percent: number;
  category: string;
}

export interface NetworkHealth {
  score: number;
  availability: number;
  packetLoss: number;
  latency: number;
  bandwidthHealth: number;
  securityScore: number;
  lastUpdated: string;
}

// ── MOCK DEVICES ──────────────────────────────────────────────
export const mockDevices: Device[] = [
  {
    id: 'd-001',
    name: 'Main Router',
    hostname: 'gateway.local',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:5E',
    vendor: 'TP-Link Technologies',
    type: 'router',
    status: 'online',
    firstSeen: '2024-01-15T08:00:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'low',
    latency: 2,
    packetLoss: 0,
    bandwidth: { up: 12.4, down: 48.2 },
    openPorts: [80, 443, 22, 53],
    os: 'OpenWRT 21.02',
    trusted: true,
    notes: 'Primary internet gateway',
    connectedTo: [],
  },
  {
    id: 'd-002',
    name: 'Core Switch',
    hostname: 'switch-01.local',
    ip: '192.168.1.2',
    mac: '00:2B:3C:4D:5E:6F',
    vendor: 'Cisco Systems',
    type: 'switch',
    status: 'online',
    firstSeen: '2024-01-15T08:05:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'low',
    latency: 1,
    packetLoss: 0,
    bandwidth: { up: 45.0, down: 78.3 },
    openPorts: [22, 80, 443],
    os: 'Cisco IOS 15.2',
    trusted: true,
    notes: 'Core network switch',
    connectedTo: ['d-001'],
  },
  {
    id: 'd-003',
    name: 'ADMIN-PC',
    hostname: 'admin-pc.local',
    ip: '192.168.1.10',
    mac: '34:5E:6F:70:81:92',
    vendor: 'Dell Inc.',
    type: 'pc',
    status: 'online',
    firstSeen: '2024-01-20T09:00:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'low',
    latency: 8,
    packetLoss: 0.1,
    bandwidth: { up: 2.1, down: 15.4 },
    openPorts: [135, 445, 3389],
    os: 'Windows 11 Pro',
    trusted: true,
    notes: 'Primary administrator workstation',
    connectedTo: ['d-002'],
  },
  {
    id: 'd-004',
    name: 'Dev Laptop',
    hostname: 'devbook.local',
    ip: '192.168.1.11',
    mac: '56:78:9A:BC:DE:F0',
    vendor: 'Apple Inc.',
    type: 'laptop',
    status: 'online',
    firstSeen: '2024-02-01T10:30:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'low',
    latency: 12,
    packetLoss: 0,
    bandwidth: { up: 5.8, down: 22.3 },
    openPorts: [22, 5000, 8080],
    os: 'macOS Sonoma 14.2',
    trusted: true,
    notes: '',
    connectedTo: ['d-002'],
  },
  {
    id: 'd-005',
    name: 'File Server',
    hostname: 'fileserver.local',
    ip: '192.168.1.20',
    mac: '78:9A:BC:DE:F0:12',
    vendor: 'Supermicro',
    type: 'server',
    status: 'online',
    firstSeen: '2024-01-15T08:30:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'medium',
    latency: 4,
    packetLoss: 0,
    bandwidth: { up: 18.2, down: 8.7 },
    openPorts: [22, 80, 443, 445, 2049, 8080],
    os: 'Ubuntu Server 22.04 LTS',
    trusted: true,
    notes: 'NFS and SMB file server',
    connectedTo: ['d-002'],
  },
  {
    id: 'd-006',
    name: 'iPhone 15',
    hostname: 'iphone-sarah.local',
    ip: '192.168.1.101',
    mac: '9A:BC:DE:F0:12:34',
    vendor: 'Apple Inc.',
    type: 'phone',
    status: 'online',
    firstSeen: '2024-03-10T14:00:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'low',
    latency: 18,
    packetLoss: 0.5,
    bandwidth: { up: 0.8, down: 4.2 },
    openPorts: [],
    os: 'iOS 17.3',
    trusted: true,
    notes: '',
    connectedTo: ['d-007'],
  },
  {
    id: 'd-007',
    name: 'WiFi AP',
    hostname: 'ap-main.local',
    ip: '192.168.1.3',
    mac: 'BC:DE:F0:12:34:56',
    vendor: 'Ubiquiti Networks',
    type: 'access-point',
    status: 'online',
    firstSeen: '2024-01-15T08:10:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'low',
    latency: 3,
    packetLoss: 0,
    bandwidth: { up: 8.4, down: 32.1 },
    openPorts: [22, 80, 443],
    os: 'UniFi OS 3.2',
    trusted: true,
    notes: 'Main wireless access point',
    connectedTo: ['d-002'],
  },
  {
    id: 'd-008',
    name: 'IP Camera 01',
    hostname: 'cam-01.local',
    ip: '192.168.1.150',
    mac: 'DE:F0:12:34:56:78',
    vendor: 'Hikvision',
    type: 'camera',
    status: 'online',
    firstSeen: '2024-02-20T11:00:00Z',
    lastSeen: new Date().toISOString(),
    riskLevel: 'high',
    latency: 22,
    packetLoss: 1.2,
    bandwidth: { up: 3.6, down: 0.1 },
    openPorts: [80, 554, 8000],
    os: 'Embedded Linux',
    trusted: false,
    notes: 'Lobby security camera — needs firmware update',
    connectedTo: ['d-002'],
  },
  {
    id: 'd-009',
    name: 'Smart TV',
    hostname: 'samsung-tv.local',
    ip: '192.168.1.110',
    mac: 'F0:12:34:56:78:9A',
    vendor: 'Samsung Electronics',
    type: 'smart-tv',
    status: 'offline',
    firstSeen: '2024-03-01T18:00:00Z',
    lastSeen: '2024-06-11T22:00:00Z',
    riskLevel: 'low',
    latency: null,
    packetLoss: 0,
    bandwidth: { up: 0, down: 0 },
    openPorts: [],
    os: 'Tizen OS 7.0',
    trusted: true,
    notes: '',
    connectedTo: ['d-007'],
  },
  {
    id: 'd-010',
    name: 'Unknown Device',
    hostname: 'unknown',
    ip: '192.168.1.199',
    mac: '12:34:56:78:9A:BC',
    vendor: 'Unknown',
    type: 'unknown',
    status: 'online',
    firstSeen: new Date(Date.now() - 600000).toISOString(),
    lastSeen: new Date().toISOString(),
    riskLevel: 'critical',
    latency: 45,
    packetLoss: 2.3,
    bandwidth: { up: 1.2, down: 0.4 },
    openPorts: [4444, 8888],
    os: 'Unknown',
    trusted: false,
    notes: 'Unrecognized device — investigate',
    connectedTo: ['d-007'],
  },
];

// ── MOCK ALERTS ───────────────────────────────────────────────
export const mockAlerts: Alert[] = [
  {
    id: 'a-001',
    type: 'security',
    level: 'critical',
    title: 'Unknown Device Connected',
    message: 'An unrecognized device (192.168.1.199) joined the network 10 minutes ago.',
    deviceId: 'd-010',
    deviceName: 'Unknown Device',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    read: false,
  },
  {
    id: 'a-002',
    type: 'security',
    level: 'warning',
    title: 'Firmware Vulnerability Detected',
    message: 'IP Camera 01 is running outdated firmware with known CVEs.',
    deviceId: 'd-008',
    deviceName: 'IP Camera 01',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'a-003',
    type: 'device_offline',
    level: 'info',
    title: 'Device Went Offline',
    message: 'Smart TV (192.168.1.110) has gone offline.',
    deviceId: 'd-009',
    deviceName: 'Smart TV',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: 'a-004',
    type: 'high_bandwidth',
    level: 'warning',
    title: 'High Bandwidth Usage',
    message: 'File Server is consuming 18.2 MB/s upload — exceeds threshold.',
    deviceId: 'd-005',
    deviceName: 'File Server',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: false,
  },
  {
    id: 'a-005',
    type: 'packet_loss',
    level: 'warning',
    title: 'Packet Loss Detected',
    message: 'IP Camera 01 showing 1.2% packet loss over the last 5 minutes.',
    deviceId: 'd-008',
    deviceName: 'IP Camera 01',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: true,
  },
  {
    id: 'a-006',
    type: 'new_device',
    level: 'info',
    title: 'New Device Discovered',
    message: 'iPhone 15 (192.168.1.101) was discovered during the last network scan.',
    deviceId: 'd-006',
    deviceName: 'iPhone 15',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
];

// ── MOCK TRAFFIC ──────────────────────────────────────────────
export function generateTrafficData(points = 60): TrafficEntry[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(now - (points - i) * 10000).toISOString(),
    upload: 5 + Math.random() * 20,
    download: 15 + Math.random() * 50,
    total: 0,
  })).map(e => ({ ...e, total: e.upload + e.download }));
}

// ── MOCK PACKETS ──────────────────────────────────────────────
export const mockPackets: PacketEntry[] = [
  {
    id: 'p-001',
    src: '192.168.1.11',
    dst: '8.8.8.8',
    srcDevice: 'Dev Laptop',
    dstDevice: 'Google DNS',
    protocol: 'UDP',
    port: 53,
    size: 64,
    latency: 18,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    route: ['Dev Laptop', 'Core Switch', 'Main Router', 'Internet'],
  },
  {
    id: 'p-002',
    src: '192.168.1.10',
    dst: '52.96.88.12',
    srcDevice: 'ADMIN-PC',
    dstDevice: 'Microsoft Azure',
    protocol: 'TCP',
    port: 443,
    size: 1420,
    latency: 34,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    route: ['ADMIN-PC', 'Core Switch', 'Main Router', 'Internet'],
  },
  {
    id: 'p-003',
    src: '192.168.1.199',
    dst: '185.234.218.4',
    srcDevice: 'Unknown Device',
    dstDevice: 'Suspicious Host',
    protocol: 'TCP',
    port: 4444,
    size: 512,
    latency: 120,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    route: ['Unknown Device', 'WiFi AP', 'Main Router', 'Internet'],
  },
  {
    id: 'p-004',
    src: '192.168.1.101',
    dst: '17.188.165.42',
    srcDevice: 'iPhone 15',
    dstDevice: 'Apple iCloud',
    protocol: 'TCP',
    port: 443,
    size: 890,
    latency: 22,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    route: ['iPhone 15', 'WiFi AP', 'Main Router', 'Internet'],
  },
  {
    id: 'p-005',
    src: '192.168.1.20',
    dst: '192.168.1.10',
    srcDevice: 'File Server',
    dstDevice: 'ADMIN-PC',
    protocol: 'TCP',
    port: 445,
    size: 4096,
    latency: 4,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    route: ['File Server', 'Core Switch', 'ADMIN-PC'],
  },
];

// ── MOCK SECURITY EVENTS ──────────────────────────────────────
export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 's-001',
    type: 'Port Scan Detected',
    severity: 'high',
    description: 'Port scan originating from 192.168.1.199 targeting 192.168.1.1–20.',
    deviceId: 'd-010',
    deviceName: 'Unknown Device',
    ip: '192.168.1.199',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    resolved: false,
  },
  {
    id: 's-002',
    type: 'Suspicious Outbound Connection',
    severity: 'critical',
    description: 'Unknown device connecting to known C2 IP 185.234.218.4 on port 4444.',
    deviceId: 'd-010',
    deviceName: 'Unknown Device',
    ip: '192.168.1.199',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    resolved: false,
  },
  {
    id: 's-003',
    type: 'Outdated Firmware',
    severity: 'medium',
    description: 'IP Camera 01 running firmware with CVE-2023-28808 (CVSS 9.8).',
    deviceId: 'd-008',
    deviceName: 'IP Camera 01',
    ip: '192.168.1.150',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    resolved: false,
  },
  {
    id: 's-004',
    type: 'Failed Login Attempts',
    severity: 'medium',
    description: '12 consecutive failed SSH login attempts on File Server from 192.168.1.199.',
    deviceId: 'd-005',
    deviceName: 'File Server',
    ip: '192.168.1.20',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    resolved: false,
  },
  {
    id: 's-005',
    type: 'ARP Spoofing Attempt',
    severity: 'high',
    description: 'Conflicting ARP responses detected — possible MITM attack.',
    ip: '192.168.1.1',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    resolved: true,
  },
];

// ── MOCK APP USAGE ────────────────────────────────────────────
export const mockAppUsage: AppUsage[] = [
  { name: 'YouTube',      bandwidth: 18.4, connections: 8,  percent: 32, category: 'streaming' },
  { name: 'Microsoft Teams', bandwidth: 9.2, connections: 4, percent: 16, category: 'video-calls' },
  { name: 'Google Drive', bandwidth: 6.8, connections: 12, percent: 12, category: 'cloud' },
  { name: 'GitHub',       bandwidth: 5.1, connections: 22, percent: 9,  category: 'development' },
  { name: 'Netflix',      bandwidth: 4.9, connections: 2,  percent: 8,  category: 'streaming' },
  { name: 'Zoom',         bandwidth: 3.6, connections: 1,  percent: 6,  category: 'video-calls' },
  { name: 'Spotify',      bandwidth: 2.2, connections: 3,  percent: 4,  category: 'streaming' },
  { name: 'Other',        bandwidth: 7.4, connections: 45, percent: 13, category: 'other' },
];

// ── MOCK HEALTH ───────────────────────────────────────────────
export const mockNetworkHealth: NetworkHealth = {
  score: 74,
  availability: 96.8,
  packetLoss: 0.8,
  latency: 18,
  bandwidthHealth: 82,
  securityScore: 61,
  lastUpdated: new Date().toISOString(),
};
