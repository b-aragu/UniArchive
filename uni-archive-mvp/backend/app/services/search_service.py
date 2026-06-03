"""
Search service using PostgreSQL Full-Text Search.
"""
from __future__ import annotations
from sqlalchemy import func
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.document import Document
from app.models.course import Course
from app.models.document_type import DocumentType


def make_snippet(text: str | None, query: str, size: int = 220) -> str | None:
    if not text or not query:
        return None
    lower_text = text.lower()
    lower_query = query.lower()
    idx = lower_text.find(lower_query)
    if idx == -1:
        return text[:size] + ("..." if len(text) > size else "")
    start = max(idx - 80, 0)
    end = min(idx + len(query) + 140, len(text))
    return ("..." if start > 0 else "") + text[start:end] + ("..." if end < len(text) else "")


def search_documents(
    db: Session, 
    query: str, 
    course_id: UUID | None = None, 
    document_type_id: UUID | None = None,
    limit: int = 50
):
    q = db.query(Document).filter(Document.is_approved == True)

    if query:
        # Use basic PostgreSQL FTS using plainto_tsquery on the precomputed search_vector
        tsquery = func.plainto_tsquery('english', query)
        q = q.filter(Document.search_vector.op('@@')(tsquery))
        
        # Order by rank
        rank = func.ts_rank(Document.search_vector, tsquery)
        q = q.order_by(rank.desc())
    else:
        q = q.order_by(Document.created_at.desc())

    if course_id:
        q = q.filter(Document.course_id == course_id)

    if document_type_id:
        q = q.filter(Document.document_type_id == document_type_id)

    docs = q.limit(limit).all()
    
    # Return list of (doc, snippet, score)
    # Score will be faked to 1.0 for now if no rank
    results = []
    for doc in docs:
        snippet = make_snippet(doc.ocr_text, query) if query else None
        results.append((doc, snippet, 1.0))
        
    return results