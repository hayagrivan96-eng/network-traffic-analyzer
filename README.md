# Network Guardian Pro

> **See Every Device. Understand Every Connection. Protect Every Packet.**

Network Guardian Pro is a professional, real-world network monitoring, device discovery, traffic visualization, and network security platform designed for IT administrators, schools, small businesses, and home labs.

---

## Features

- **Device Discovery**: Discover network hosts using ARP scans, Ping sweeps, and reverse DNS lookup.
- **Topology Map**: Drag, drop, and inspect nodes in a live interactive force-directed graph.
- **Traffic Analysis**: Real-time upload and download throughput tracking with Recharts.
- **Packet Sniffer & Path Trace**: Hop-by-hop packet inspection with animated paths and raw hex dumps.
- **Security Auditor**: Port scanner logs, risk profiling, CVE alerts, and hardening guides.
- **Alert System**: Alert subscriptions with unread counts and custom priorities.

---

## Directory Structure

```
├── frontend/           # React + TypeScript + Vite Dashboard
├── backend/            # FastAPI + SQLAlchemy Async + WebSockets API
├── docker-compose.yml  # Orchestration file for DB, Backend, and Frontend
└── .env.example        # Environment variables template
```

---

## Getting Started

### 1. Run the Frontend (Quick Start)

The frontend is immediately runnable and operates in **offline mode with rich simulated mock data** if the backend is not connected.

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at: [http://localhost:5173](http://localhost:5173).

#### Demo Credentials:
- **Admin**: `admin@ngpro.local` / `admin123`
- **Technician**: `tech@ngpro.local` / `tech123`

---

### 2. Run the Full Stack via Docker

Start PostgreSQL, the FastAPI backend, and the React frontend in one command:

```bash
docker-compose up --build
```

---

### 3. Run the Backend Manually

#### Prerequisites:
- Python 3.10+
- PostgreSQL database

#### Execution:

1. Setup virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure variables:
   Copy `.env.example` to `.env` and configure your credentials.

4. Start FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

API interactive documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
