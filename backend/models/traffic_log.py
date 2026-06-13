from sqlalchemy import Column, String, Integer, Float
from database import Base

class TrafficLog(Base):
    __tablename__ = "traffic_logs"

    id = Column(Integer, primary_key=True, index=True)
    time = Column(String, index=True, nullable=False)
    upload = Column(Float, default=0.0)
    download = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
