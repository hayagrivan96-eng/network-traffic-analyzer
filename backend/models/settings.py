from sqlalchemy import Column, String, Integer, Boolean, JSON
from database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    scan_interval = Column(String, default="1m")
    discovery_methods = Column(JSON, default=dict)
    excluded_ips = Column(String, default="")
    monitor_interval = Column(Integer, default=10)
    latency_threshold = Column(Integer, default=100)
    loss_threshold = Column(Integer, default=2)
    bw_threshold = Column(Integer, default=80)
    auto_alerts = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    alert_email = Column(String, default="admin@ngpro.local")
    min_alert_level = Column(String, default="warning")
