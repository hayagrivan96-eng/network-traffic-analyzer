from sqlalchemy import Column, String, Integer, Boolean
from database import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False) # e.g. Port Scan, Suspicious Outbound, MAC spoofing
    severity = Column(String, default="low") # low, medium, high, critical
    description = Column(String, nullable=False)
    device_id = Column(String, nullable=True)
    device_name = Column(String, nullable=True)
    ip = Column(String, nullable=True)
    timestamp = Column(String, nullable=False)
    resolved = Column(Boolean, default=False)
