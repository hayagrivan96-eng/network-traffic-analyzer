import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuthStore, useThemeStore } from './store';

// Pages
import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import AppLayout     from './components/Layout/AppLayout';
import Dashboard     from './pages/Dashboard';
import DevicesPage   from './pages/DevicesPage';
import TopologyPage  from './pages/TopologyPage';
import TrafficPage   from './pages/TrafficPage';
import PacketTrackerPage from './pages/PacketTrackerPage';
import SecurityPage  from './pages/SecurityPage';
import AlertsPage    from './pages/AlertsPage';
import ReportsPage   from './pages/ReportsPage';
import SettingsPage  from './pages/SettingsPage';
import ProfilePage   from './pages/ProfilePage';

// Protected route wrapper
function Protected({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="devices"    element={<DevicesPage />} />
          <Route path="topology"   element={<TopologyPage />} />
          <Route path="traffic"    element={<TrafficPage />} />
          <Route path="packets"    element={<PacketTrackerPage />} />
          <Route path="security"   element={<SecurityPage />} />
          <Route path="alerts"     element={<AlertsPage />} />
          <Route path="reports"    element={<ReportsPage />} />
          <Route path="settings"   element={<SettingsPage />} />
          <Route path="profile"    element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
