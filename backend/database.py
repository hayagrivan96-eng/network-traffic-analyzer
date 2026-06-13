from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
Base = declarative_base()

async def init_db():
    # Attempt to initialize DB connections or run schema migrations.
    # In a real environment, migrations would be handled via Alembic.
    try:
        async with engine.begin() as conn:
            # We import models here to register them on Base
            from models.user import User
            from models.device import Device
            from models.alert import Alert
            from models.traffic_log import TrafficLog
            from models.packet_log import PacketLog
            from models.security_event import SecurityEvent
            from models.settings import SystemSettings
            
            await conn.run_sync(Base.metadata.create_all)
            print("[DB] Database tables created successfully")
    except Exception as e:
        print(f"[DB] [WARNING] Could not connect to database or create tables: {e}")
        print("   Running in fallback offline/in-memory mode for routers")

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
