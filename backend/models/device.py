from sqlalchemy import Column, String, Integer, Boolean, Float, JSON
from database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hostname = Column(String, nullable=True)
    ip = Column(String, unique=True, index=True, nullable=False)
    mac = Column(String, unique=True, index=True, nullable=False)
    vendor = Column(String, nullable=True)
    type = Column(String, default="unknown")
    status = Column(String, default="online") # online, offline, warning
    first_seen = Column(String, nullable=False)
    last_seen = Column(String, nullable=False)
    risk_level = Column(String, default="low") # low, medium, high, critical
    latency = Column(Float, nullable=True)
    packet_loss = Column(Float, default=0.0)
    bandwidth_up = Column(Float, default=0.0)
    bandwidth_down = Column(Float, default=0.0)
    open_ports = Column(JSON, default=list) # JSON array of open ports
    os = Column(String, nullable=True)
    trusted = Column(Boolean, default=False)
    notes = Column(String, default="")
    connected_to = Column(JSON, default=list) # JSON array of parent device IDs
