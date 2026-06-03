"""
Pydantic schemas for Document model.

Refactored from the original flat schema to support:
- UUID primary keys
- Foreign key references to normalized hierarchy tables
- Full-text search metadata
- Pagination wrappers
"""
from __future__ import annotations
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.hierarchy import (
    AcademicYearOut,
    CourseOut,
    DocumentTypeOut,
    SemesterOut,
)


class DocumentCreate(BaseModel):
    """Schema for document metadata submitted during upload."""
    title: str = Field(..., min_length=1, max_length=255)
    course_id: UUID | None = None
    semester_id: UUID | None = None
    document_type_id: UUID | None = None


class DocumentOut(BaseModel):
    """Schema for document responses."""
    id: UUID
    title: str
    course_id: UUID | None = None
    semester_id: UUID | None = None
    document_type_id: UUID | None = None
    uploaded_by: UUID | None = None
    original_filename: str
    mime_type: str | None = None
    file_size: int | None = None
    ocr_text: str | None = None
    ocr_confidence: float | None = None
    extraction_method: str | None = None
    page_count: int | None = None
    processing_time_ms: float | None = None
    phash: str | None = None
    status: str
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentDetail(DocumentOut):
    """Schema for document detail view with expanded relationships."""
    course: CourseOut | None = None
    semester: SemesterOut | None = None
    document_type: DocumentTypeOut | None = None


class SearchResult(DocumentOut):
    """Schema for search results with relevance scoring."""
    snippet: str | None = None
    relevance_score: float | None = None
    search_type: str | None = None  # 'keyword', 'semantic', 'hybrid'


class SemanticSearchResult(BaseModel):
    document_id: str
    title: str
    course_code: str | None = None
    document_type: str | None = None
    score: float
    matching_chunk: str | None = None
    extraction_method: str | None = None
    ocr_confidence: float | None = None


class PaginatedDocuments(BaseModel):
    """Paginated response wrapper."""
    items: list[DocumentOut]
    total: int
    page: int
    page_size: int
    total_pages: int