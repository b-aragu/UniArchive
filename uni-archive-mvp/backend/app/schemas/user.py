"""
Pydantic schemas for User and Role models.
"""
from __future__ import annotations
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ========================
# Role
# ========================
class RoleOut(BaseModel):
    id: UUID
    name: str
    description: str | None = None

    class Config:
        from_attributes = True


# ========================
# User
# ========================
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)
    role_id: UUID | None = None  # Defaults to 'student' if not provided


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role_id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserDetail(UserOut):
    role: RoleOut | None = None
    updated_at: datetime
