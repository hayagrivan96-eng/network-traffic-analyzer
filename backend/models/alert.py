from sqlalchemy import Column, String, Integer, Boolean
from database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False) # device_offline, new_device, high_bandwidth, packet_loss, internet_down, security
    level = Column(String, default="info") # info, warning, critical
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    device_id = Column(String, nullable=True)
    device_name = Column(String, nullable=True)
    timestamp = Column(String, nullable=False)
    read = Column(Boolean, default=False)
