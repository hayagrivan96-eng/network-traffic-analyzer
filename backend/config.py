import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///network_guardian.db")
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    jwt_secret: str = "supersecretjwtsecretkeynetworkguardianpro"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"

settings = Settings()
