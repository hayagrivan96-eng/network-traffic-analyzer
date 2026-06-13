from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
import random
from datetime import datetime, timedelta

router = APIRouter()

class TrafficDataSchema(BaseModel):
    time: str
    upload: float
    download: float
    total: float

@router.get("/live", response_model=List[TrafficDataSchema])
async def get_live_traffic():
    # Return past 10 seconds of simulated interface traffic
    data = []
    now = datetime.utcnow()
    for i in range(10):
        t = now - timedelta(seconds=10 - i)
        up = round(5 + random.random() * 20, 1)
        down = round(15 + random.random() * 50, 1)
        data.append({
            "time": t.isoformat() + "Z",
            "upload": up,
            "download": down,
            "total": round(up + down, 1)
        })
    return data

@router.get("/apps")
async def get_apps_traffic():
    return [
        {"name": "YouTube",      "bandwidth": 18.4, "connections": 8,  "percent": 32, "category": "streaming"},
        {"name": "Microsoft Teams", "bandwidth": 9.2, "connections": 4, "percent": 16, "category": "video-calls"},
        {"name": "Google Drive", "bandwidth": 6.8, "connections": 12, "percent": 12, "category": "cloud"}
    ]
