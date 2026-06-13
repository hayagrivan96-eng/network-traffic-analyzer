"""
Network Guardian Pro — FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn
import asyncio

from config import settings
from database import init_db
from routers import auth, devices, topology, traffic, packets, security, alerts, reports, health, ws_router

app = FastAPI(
    title="Network Guardian Pro API",
    description="Professional network monitoring platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(auth.router,     prefix="/api/auth",     tags=["Authentication"])
app.include_router(devices.router,  prefix="/api/devices",  tags=["Devices"])
app.include_router(topology.router, prefix="/api/topology", tags=["Topology"])
app.include_router(traffic.router,  prefix="/api/traffic",  tags=["Traffic"])
app.include_router(packets.router,  prefix="/api/packets",  tags=["Packets"])
app.include_router(security.router, prefix="/api/security", tags=["Security"])
app.include_router(alerts.router,   prefix="/api/alerts",   tags=["Alerts"])
app.include_router(reports.router,  prefix="/api/reports",  tags=["Reports"])
app.include_router(health.router,   prefix="/api/health",   tags=["Health"])
app.include_router(ws_router.router, prefix="/ws",          tags=["WebSocket"])

@app.on_event("startup")
async def startup():
    await init_db()
    print("[START] Network Guardian Pro API started")
    print(f"   Docs: http://localhost:{settings.port}/docs")

@app.on_event("shutdown")
async def shutdown():
    print("[STOP] Network Guardian Pro API stopped")

@app.get("/")
async def root():
    return {
        "name": "Network Guardian Pro API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }

@app.get("/api/ping")
async def ping():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )
