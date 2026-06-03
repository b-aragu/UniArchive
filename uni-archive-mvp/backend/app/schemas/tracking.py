"""
Pydantic schemas for tracking models: SearchLog, Feedback, DuplicatePair, AuditLog.
"""
from __future__ import annotations
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ========================
# Search Log
# ========================
class SearchLogCreate(BaseModel):
    query_text: str
    search_type: str = Field(..., pattern="^(keyword|semantic|hybrid)$")
    result_count: int = 0
    response_time_ms: float | None = None


class SearchLogOut(BaseModel):
    id: UUID
    user_id: UUID | None = None
    query_text: str
    search_type: str
    result_count: int
    response_time_ms: float | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ========================
# Feedback
# ========================
class FeedbackCreate(BaseModel):
    document_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(None, max_length=2000)


class FeedbackOut(BaseModel):
    id: UUID
    user_id: UUID | None = None
    document_id: UUID
    rating: int
    comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ========================
# Duplicate Pair
# ========================
class DuplicatePairOut(BaseModel):
    id: UUID
    document_a_id: UUID
    document_b_id: UUID
    similarity_score: float
    detection_method: str
    detected_at: datetime

    class Config:
        from_attributes = True


# ========================
# Audit Log
# ========================
class AuditLogOut(BaseModel):
    id: UUID
    user_id: UUID | None = None
    action: str
    entity_type: str
    entity_id: UUID | None = None
    details: dict | None = None
    created_at: datetime

    class Config:
        from_attributes = True
