from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Any
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.document import Document
from app.services.ai_service import (
    generate_document_summary,
    generate_document_questions,
    generate_search_explanation,
)

router = APIRouter()

class SearchExplainRequest(BaseModel):
    query: str
    results: Optional[list[dict[str, Any]]] = None
    result_ids: Optional[list[UUID]] = None


@router.post("/documents/{id}/summary")
def get_summary(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve document summary, key topics, and study notes."""
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    ocr_text = doc.ocr_text or ""
    return generate_document_summary(ocr_text)


@router.post("/documents/{id}/questions")
def get_questions(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve study revision questions, answers, and difficulty rating."""
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    ocr_text = doc.ocr_text or ""
    return generate_document_questions(ocr_text)


@router.post("/search/explain")
def explain_search(
    request: SearchExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Provide explanation of search result relevance based on user query."""
    final_results = []
    
    # If client passed raw result objects, include them
    if request.results:
        final_results.extend(request.results)
        
    # If client passed database result IDs, fetch details
    if request.result_ids:
        docs = db.query(Document).filter(Document.id.in_(request.result_ids)).all()
        for doc in docs:
            final_results.append({
                "id": str(doc.id),
                "title": doc.title,
                "ocr_text": doc.ocr_text or "",
                "course": {"code": doc.course.code} if doc.course else None
            })
            
    return generate_search_explanation(request.query, final_results)
