from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class SecurityEventSchema(BaseModel):
    id: str
    type: str
    severity: str
    description: str
    deviceName: str = None
    ip: str = None
    timestamp: str
    resolved: bool

mock_events = [
    {
        "id": "s-1",
        "type": "Port Scan Detected",
        "severity": "high",
        "description": "Port scan from host 192.168.1.199 targeting local ports",
        "deviceName": "Unknown Device",
        "ip": "192.168.1.199",
        "timestamp": "2026-06-12T10:00:00Z",
        "resolved": False
    }
]

@router.get("/events", response_model=List[SecurityEventSchema])
async def get_security_events():
    return mock_events

@router.post("/events/{event_id}/resolve")
async def resolve_event(event_id: str):
    for e in mock_events:
        if e["id"] == event_id:
            e["resolved"] = True
            return e
    return {"error": "Event not found"}
