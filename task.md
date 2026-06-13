# Network Guardian Pro — Task List

## Phase 1 — Project Scaffolding
- [x] Create implementation plan
- [x] Scaffold Vite + React + TypeScript frontend
- [x] Install/verify all frontend dependencies
- [x] Create docker-compose.yml
- [x] Create .env.example

## Phase 2 — Design System & Layout
- [x] Global CSS design system (variables, typography, spacing, resets in index.css)
- [x] Sidebar component (280px inside AppLayout.tsx)
- [x] TopNav component (search, alerts, user menu inside AppLayout.tsx)
- [x] InfoPanel component (320px details panel inside DevicesPage.tsx)
- [x] StatusBar/Footer component (inside AppLayout.tsx)
- [x] App layout shell (AppLayout.tsx)

## Phase 3 — Frontend Pages
- [x] Landing Page (Hero, Features, Pricing, Docs, Contact)
- [x] Login / Auth Page (Credentials matching and validation)
- [x] Dashboard Overview (Live AreaChart updates and stats)
- [x] Devices Inventory Page (Sortable, filterable table + slider panel)
- [x] Network Topology Page (ReactFlow layout, legends, toolbars)
- [x] Traffic Monitor Page (Live upload/download speeds, App grid, protocol PieChart)
- [x] Packet Tracker Page (SVG animated flow trace, live capture stream, hex dump)
- [x] Security Center Page (Score gauges, threat log resolving, fixes list)
- [x] Alerts Page (Search, filters, today/yesterday grouping, actions)
- [x] Reports Page (Generation config params form, simulated progress, past downloads list)
- [x] Settings Page (Discovery checkboxes, sliders, subnets list, invite modals)
- [x] Profile Page (Avatars, password resets, active sessions list, Danger Zone)

## Phase 4 — State & Data Layer
- [x] Zustand stores (auth, devices, alerts, theme, UI inside store/index.ts)
- [x] Mock data layers (mockData.ts supporting mock devices, packets, alerts, and app usages)

## Phase 5 — Backend (Python FastAPI)
- [x] FastAPI app main entry point (main.py)
- [x] Configuration handling (config.py via Pydantic Settings)
- [x] Database connections & session getters (database.py)
- [x] SQL models (User, Device, Alert, TrafficLog, PacketLog, SecurityEvent, SystemSettings)
- [x] Authentication JWT routes (routers/auth.py)
- [x] Discovered devices CRUD routes (routers/devices.py)
- [x] Topology graph calculations routes (routers/topology.py)
- [x] Throughput traffic monitor routes (routers/traffic.py)
- [x] Packet capturing logs routes (routers/packets.py)
- [x] Security vulnerabilities routes (routers/security.py)
- [x] System alerts routes (routers/alerts.py)
- [x] Configurable reports compiler routes (routers/reports.py)
- [x] Network health diagnostics routes (routers/health.py)
- [x] Real-time updates connections manager (routers/ws_router.py)
- [x] requirements.txt dependencies

## Phase 6 — Documentation
- [x] README.md setup and guide
