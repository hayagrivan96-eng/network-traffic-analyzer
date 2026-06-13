from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class AlertSchema(BaseModel):
    id: str
    type: str
    level: str
    title: str
    message: str
    deviceName: str = None
    timestamp: str
    read: bool

mock_alerts = [
    {
        "id": "a-1",
        "type": "device_offline",
        "level": "critical",
        "title": "Device Went Offline",
        "message": "File Server (192.168.1.20) is unreachable via ICMP",
        "deviceName": "File Server",
        "timestamp": "2026-06-12T10:05:00Z",
        "read": False
    }
]

@router.get("/", response_model=List[AlertSchema])
async def get_alerts():
    return mock_alerts

@router.post("/", response_model=AlertSchema)
async def create_alert(alert: AlertSchema):
    mock_alerts.insert(0, alert.dict())
    if len(mock_alerts) > 50:
        mock_alerts.pop()
    return alert

@router.post("/{alert_id}/read")
async def mark_alert_read(alert_id: str):
    for a in mock_alerts:
        if a["id"] == alert_id:
            a["read"] = True
            return a
    return {"error": "Alert not found"}

@router.post("/read-all")
async def read_all_alerts():
    for a in mock_alerts:
        a["read"] = True
    return {"status": "success"}
