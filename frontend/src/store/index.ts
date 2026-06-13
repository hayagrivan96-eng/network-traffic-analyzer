// Zustand stores for Network Guardian Pro
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, Alert, NetworkHealth } from '../data/mockData';

// ── THEME STORE ───────────────────────────────────────────────
interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },
      setTheme: (t) => {
        document.documentElement.setAttribute('data-theme', t);
        set({ theme: t });
      },
    }),
    { name: 'ngp-theme' }
  )
);

// ── AUTH STORE ────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'viewer';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'admin' | 'technician' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // 1. Try real login against backend API
        try {
          const res = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, token: data.access_token, isAuthenticated: true });
            return true;
          } else if (res.status === 401) {
            return false;
          }
        } catch (err) {
          console.warn('[AUTH] Backend offline, falling back to local mock authentication');
        }

        // 2. Offline fallback check
        // Check default admin/tech credentials
        if (email === 'admin@ngpro.local' && password === 'admin123') {
          const user: User = {
            id: 'u-001',
            name: 'Alex Mitchell',
            email: 'admin@ngpro.local',
            role: 'admin',
          };
          set({ user, token: 'mock-jwt-token', isAuthenticated: true });
          return true;
        }
        if (email === 'tech@ngpro.local' && password === 'tech123') {
          const user: User = {
            id: 'u-002',
            name: 'Jordan Lee',
            email: 'tech@ngpro.local',
            role: 'technician',
          };
          set({ user, token: 'mock-jwt-token-tech', isAuthenticated: true });
          return true;
        }

        // Check custom users registered locally during offline mode
        const localUsersStr = localStorage.getItem('ngp-mock-users');
        if (localUsersStr) {
          try {
            const localUsers = JSON.parse(localUsersStr);
            const found = localUsers.find((u: any) => u.email === email && u.password === password);
            if (found) {
              const user: User = {
                id: found.id,
                name: found.name,
                email: found.email,
                role: found.role,
              };
              set({ user, token: 'mock-jwt-token-custom', isAuthenticated: true });
              return true;
            }
          } catch (e) {
            console.error('Failed to parse local users', e);
          }
        }

        return false;
      },
      register: async (name, email, password, role) => {
        // 1. Try real registration against backend API
        try {
          const res = await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
          });
          if (res.ok) {
            return { success: true };
          } else {
            const data = await res.json();
            return { success: false, error: data.detail || 'Email already registered' };
          }
        } catch (err) {
          console.warn('[AUTH] Backend offline, falling back to local mock registration');
        }

        // 2. Offline fallback registration
        if (email === 'admin@ngpro.local' || email === 'tech@ngpro.local') {
          return { success: false, error: 'Email already registered' };
        }

        const localUsersStr = localStorage.getItem('ngp-mock-users') || '[]';
        try {
          const localUsers = JSON.parse(localUsersStr);
          if (localUsers.some((u: any) => u.email === email)) {
            return { success: false, error: 'Email already registered' };
          }
          const newId = `u-${Math.floor(Math.random() * 900) + 100}`;
          const newMockUser = { id: newId, name, email, password, role };
          localUsers.push(newMockUser);
          localStorage.setItem('ngp-mock-users', JSON.stringify(localUsers));
          return { success: true };
        } catch (e) {
          return { success: false, error: 'Registration failed in offline mode' };
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'ngp-auth' }
  )
);

// ── DEVICE STORE ──────────────────────────────────────────────
interface DeviceState {
  devices: Device[];
  selectedDeviceId: string | null;
  isScanning: boolean;
  lastScanTime: string | null;
  setDevices: (devices: Device[]) => void;
  selectDevice: (id: string | null) => void;
  setScanning: (v: boolean) => void;
  setLastScanTime: (t: string) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  selectedDeviceId: null,
  isScanning: false,
  lastScanTime: null,
  setDevices: (devices) => set({ devices }),
  selectDevice: (id) => set({ selectedDeviceId: id }),
  setScanning: (v) => set({ isScanning: v }),
  setLastScanTime: (t) => set({ lastScanTime: t }),
  updateDevice: (id, updates) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
}));

// ── ALERT STORE ───────────────────────────────────────────────
interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) =>
    set({ alerts, unreadCount: alerts.filter((a) => !a.read).length }),
  addAlert: (alert) =>
    set((state) => {
      const alerts = [alert, ...state.alerts];
      return { alerts, unreadCount: alerts.filter((a) => !a.read).length };
    }),
  markRead: (id) =>
    set((state) => {
      const alerts = state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
      return { alerts, unreadCount: alerts.filter((a) => !a.read).length };
    }),
  markAllRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    })),
  dismissAlert: (id) =>
    set((state) => {
      const alerts = state.alerts.filter((a) => a.id !== id);
      return { alerts, unreadCount: alerts.filter((a) => !a.read).length };
    }),
}));

// ── NETWORK HEALTH STORE ──────────────────────────────────────
interface HealthState {
  health: NetworkHealth | null;
  setHealth: (h: NetworkHealth) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  health: null,
  setHealth: (h) => set({ health: h }),
}));

// ── UI STORE ──────────────────────────────────────────────────
interface UIState {
  sidebarCollapsed: boolean;
  panelOpen: boolean;
  globalSearchOpen: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  setPanelOpen: (v: boolean) => void;
  setGlobalSearchOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  panelOpen: true,
  globalSearchOpen: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setPanelOpen: (v) => set({ panelOpen: v }),
  setGlobalSearchOpen: (v) => set({ globalSearchOpen: v }),
}));
