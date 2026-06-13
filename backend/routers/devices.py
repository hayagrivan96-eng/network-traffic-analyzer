from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel

router = APIRouter()

class DeviceBandwidth(BaseModel):
    up: float
    down: float

class DeviceSchema(BaseModel):
    id: str
    name: str
    hostname: str = None
    ip: str
    mac: str
    vendor: str = None
    type: str
    status: str
    firstSeen: str
    lastSeen: str
    riskLevel: str
    latency: float = None
    packetLoss: float
    bandwidth: DeviceBandwidth
    openPorts: List[int]
    os: str = None
    trusted: bool
    notes: str = ""
    connectedTo: List[str]

# In-memory storage for fallback/offline mode
mock_devices_db = [
    {
        "id": "d-001",
        "name": "Main Router",
        "hostname": "gateway.local",
        "ip": "192.168.1.1",
        "mac": "00:1A:2B:3C:4D:5E",
        "vendor": "TP-Link Technologies",
        "type": "router",
        "status": "online",
        "firstSeen": "2024-01-15T08:00:00Z",
        "lastSeen": "2024-01-15T08:00:00Z",
        "riskLevel": "low",
        "latency": 2.1,
        "packetLoss": 0.0,
        "bandwidth": {"up": 12.4, "down": 48.2},
        "openPorts": [80, 443, 22, 53],
        "os": "OpenWRT 21.02",
        "trusted": True,
        "notes": "Primary internet gateway",
        "connectedTo": []
    },
    {
        "id": "d-002",
        "name": "Core Switch",
        "hostname": "switch-01.local",
        "ip": "192.168.1.2",
        "mac": "00:2B:3C:4D:5E:6F",
        "vendor": "Cisco Systems",
        "type": "switch",
        "status": "online",
        "firstSeen": "2024-01-15T08:05:00Z",
        "lastSeen": "2024-01-15T08:05:00Z",
        "riskLevel": "low",
        "latency": 1.0,
        "packetLoss": 0.0,
        "bandwidth": {"up": 45.0, "down": 78.3},
        "openPorts": [22, 80, 443],
        "os": "Cisco IOS 15.2",
        "trusted": True,
        "notes": "Core network switch",
        "connectedTo": ["d-001"]
    }
]

@router.get("/", response_model=List[DeviceSchema])
async def get_devices():
    return mock_devices_db

@router.post("/", response_model=DeviceSchema)
async def create_device(device: DeviceSchema):
    for idx, d in enumerate(mock_devices_db):
        if d["id"] == device.id:
            mock_devices_db[idx] = device.dict()
            return device
    mock_devices_db.append(device.dict())
    return device

@router.post("/scan")
async def trigger_scan():
    # Trigger local discovery scan
    return {"status": "success", "message": "Subnet discovery scan complete", "devices_found": len(mock_devices_db)}

@router.patch("/{device_id}")
async def update_device(device_id: str, updates: dict):
    for d in mock_devices_db:
        if d["id"] == device_id:
            d.update(updates)
            return d
    raise HTTPException(status_code=404, detail="Device not found")
