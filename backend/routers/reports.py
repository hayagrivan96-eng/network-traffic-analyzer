from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class ReportSchema(BaseModel):
    id: str
    name: str
    type: str
    format: str
    generated: str
    size: str
    status: str

past_reports = [
    {
        "id": "rep-1",
        "name": "Weekly Network Health",
        "type": "Network Health",
        "format": "PDF",
        "generated": "2026-06-10T14:30:00Z",
        "size": "2.4 MB",
        "status": "Ready"
    }
]

@router.get("/", response_model=List[ReportSchema])
async def get_reports():
    return past_reports

@router.post("/generate")
async def generate_report(report_type: str, format: str):
    new_rep = {
        "id": f"rep-{len(past_reports) + 1}",
        "name": f"Generated {report_type}",
        "type": report_type,
        "format": format,
        "generated": "2026-06-12T12:00:00Z",
        "size": "1.2 MB",
        "status": "Ready"
    }
    past_reports.insert(0, new_rep)
    return new_rep
