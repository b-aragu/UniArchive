"""
Admin routes for system management and reporting.
Restricted to users with the 'administrator' role.
"""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models import Document, SearchLog, User, DuplicatePair
from app.schemas import UserDetail
from app.schemas.document import DuplicatePairOut

router = APIRouter()


@router.get("/users", response_model=list[UserDetail], dependencies=[Depends(require_role(["administrator"]))])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all users with their roles (Admin only).
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/reports/system-stats", dependencies=[Depends(require_role(["administrator"]))])
def get_system_stats(db: Session = Depends(get_db)):
    """
    Get overall system statistics (Admin only).
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_documents = db.query(func.count(Document.id)).scalar()
    approved_documents = db.query(func.count(Document.id)).filter(Document.is_approved == True).scalar()
    pending_documents = total_documents - approved_documents
    
    total_searches = db.query(func.count(SearchLog.id)).scalar()
    
    # Searches by type
    search_types = db.query(
        SearchLog.search_type, 
        func.count(SearchLog.id)
    ).group_by(SearchLog.search_type).all()
    
    search_breakdown = {t[0]: t[1] for t in search_types}
    
    return {
        "users": {
            "total": total_users
        },
        "documents": {
            "total": total_documents,
            "approved": approved_documents,
            "pending": pending_documents
        },
        "searches": {
            "total": total_searches,
            "breakdown": search_breakdown
        }
    }


@router.get("/duplicates", response_model=list[DuplicatePairOut], dependencies=[Depends(require_role(["administrator", "moderator"]))])
def list_duplicates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all detected duplicate pairs (Admin only).
    """
    pairs = db.query(DuplicatePair).order_by(DuplicatePair.detected_at.desc()).offset(skip).limit(limit).all()
    
    results = []
    for p in pairs:
        doc_a = db.query(Document).filter(Document.id == p.document_a_id).first()
        doc_b = db.query(Document).filter(Document.id == p.document_b_id).first()
        
        data = DuplicatePairOut.model_validate(p)
        data.document_a_title = doc_a.title if doc_a else "Unknown"
        data.document_b_title = doc_b.title if doc_b else "Unknown"
        results.append(data)
        
    return results
