from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthSchema(BaseModel):
    score: int
    availability: float
    packetLoss: float
    latency: float
    bandwidthHealth: float
    securityScore: float
    lastUpdated: str

@router.get("/", response_model=HealthSchema)
async def get_health():
    return {
        "score": 74,
        "availability": 96.8,
        "packetLoss": 0.8,
        "latency": 18.2,
        "bandwidthHealth": 82.0,
        "securityScore": 61.0,
        "lastUpdated": "2026-06-12T12:00:00Z"
    }
