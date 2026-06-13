from fastapi import APIRouter
from routers.devices import mock_devices_db

router = APIRouter()

@router.get("/")
async def get_topology():
    # Construct nodes and edges in backend format
    nodes = []
    edges = []
    
    for d in mock_devices_db:
        nodes.append({
            "id": d["id"],
            "name": d["name"],
            "ip": d["ip"],
            "type": d["type"],
            "status": d["status"]
        })
        for target in d["connectedTo"]:
            edges.append({
                "id": f"e-{d['id']}-{target}",
                "source": target,
                "target": d["id"]
            })
            
    return {
        "nodes": nodes,
        "edges": edges,
        "total_hosts": len(nodes),
        "total_connections": len(edges)
    }
