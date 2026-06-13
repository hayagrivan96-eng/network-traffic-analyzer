from sqlalchemy import Column, String, Integer, JSON
from database import Base

class PacketLog(Base):
    __tablename__ = "packet_logs"

    id = Column(String, primary_key=True, index=True)
    src = Column(String, nullable=False)
    dst = Column(String, nullable=False)
    src_device = Column(String, nullable=True)
    dst_device = Column(String, nullable=True)
    protocol = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    size = Column(Integer, nullable=False)
    latency = Column(Integer, default=0)
    status = Column(String, default="delivered") # delivered, dropped, retransmitted
    timestamp = Column(String, nullable=False)
    route = Column(JSON, default=list) # JSON array of route hop node names
