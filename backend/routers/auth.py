from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
from typing import List
import hashlib
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models.user import User as DBUser

router = APIRouter()

# Password hashing helper functions
def hash_password(password: str) -> str:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except Exception:
        # Fallback to salted SHA-256 if bcrypt/passlib fails
        salt = "network_guardian_salt"
        return hashlib.sha256((password + salt).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        salt = "network_guardian_salt"
        expected = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        return expected == hashed_password

# In-memory user database for fallback
mock_users_db = [
    {
        "id": "u-001",
        "name": "Alex Mitchell",
        "email": "admin@ngpro.local",
        "hashed_password": hash_password("admin123"),
        "role": "admin",
        "is_active": True
    },
    {
        "id": "u-002",
        "name": "Jordan Lee",
        "email": "tech@ngpro.local",
        "hashed_password": hash_password("tech123"),
        "role": "technician",
        "is_active": True
    }
]

# Request/Response Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "viewer"  # admin, technician, viewer

class RegisterResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    user_info = None

    # 1. Attempt lookup in real database
    try:
        stmt = select(DBUser).where(DBUser.email == req.email)
        result = await db.execute(stmt)
        db_user = result.scalars().first()
        if db_user:
            if verify_password(req.password, db_user.hashed_password):
                user_info = {
                    "id": f"u-{db_user.id}",
                    "name": db_user.name,
                    "email": db_user.email,
                    "role": db_user.role
                }
    except Exception as e:
        print(f"[AUTH] Database lookup failed, falling back to mock storage: {e}")

    # 2. Check mock users db if not found in database or database is offline
    if not user_info:
        for u in mock_users_db:
            if u["email"] == req.email:
                if verify_password(req.password, u["hashed_password"]):
                    user_info = {
                        "id": u["id"],
                        "name": u["name"],
                        "email": u["email"],
                        "role": u["role"]
                    }
                    break

    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {"sub": user_info["email"], "role": user_info["role"], "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "user": user_info
    }

@router.post("/register", response_model=RegisterResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if duplicate email
    email_exists = False

    # 1. Check in real database
    try:
        stmt = select(DBUser).where(DBUser.email == req.email)
        result = await db.execute(stmt)
        if result.scalars().first():
            email_exists = True
    except Exception as e:
        print(f"[AUTH] Database check failed, falling back to mock storage: {e}")

    # 2. Check in mock database
    if not email_exists:
        for u in mock_users_db:
            if u["email"] == req.email:
                email_exists = True
                break

    if email_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )

    hashed_pwd = hash_password(req.password)
    created_user = None

    # 1. Try to create in SQL database
    try:
        new_user = DBUser(
            name=req.name,
            email=req.email,
            hashed_password=hashed_pwd,
            role=req.role
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        created_user = {
            "id": f"u-{new_user.id}",
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
        print(f"[AUTH] Registered user {req.email} in SQL database")
    except Exception as e:
        print(f"[AUTH] Database registration failed, falling back to mock storage: {e}")

    # 2. Try to create in mock database as fallback
    if not created_user:
        new_id = f"u-{len(mock_users_db) + 1:03d}"
        new_mock = {
            "id": new_id,
            "name": req.name,
            "email": req.email,
            "hashed_password": hashed_pwd,
            "role": req.role,
            "is_active": True
        }
        mock_users_db.append(new_mock)
        created_user = {
            "id": new_id,
            "name": req.name,
            "email": req.email,
            "role": req.role
        }
        print(f"[AUTH] Registered user {req.email} in fallback mock in-memory database")

    return created_user
