from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class PacketSchema(BaseModel):
    id: str
    src: str
    dst: str
    srcDevice: str
    dstDevice: str
    protocol: str
    port: int
    size: int
    latency: int
    status: str
    timestamp: str
    route: List[str]

mock_packets = [
    {
        "id": "p-1",
        "src": "192.168.1.11",
        "dst": "8.8.8.8",
        "srcDevice": "Dev Laptop",
        "dstDevice": "Google DNS",
        "protocol": "UDP",
        "port": 53,
        "size": 64,
        "latency": 18,
        "status": "delivered",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "route": ["Dev Laptop", "Core Switch", "Main Router", "Internet"]
    }
]

@router.get("/", response_model=List[PacketSchema])
async def get_packets():
    return mock_packets

@router.post("/log")
async def log_packets(packets_list: List[PacketSchema]):
    for pkt in packets_list:
        mock_packets.append(pkt.dict())
    if len(mock_packets) > 100:
        # Keep only the last 100 packets
        mock_packets[:] = mock_packets[-100:]
    return {"status": "success", "logged": len(packets_list)}

@router.post("/capture/start")
async def start_capture(interface: str = "eth0", filter: str = ""):
    return {"status": "success", "message": f"Packet sniffing started on interface {interface}"}

@router.post("/capture/stop")
async def stop_capture():
    return {"status": "success", "message": "Sniffing stopped"}
