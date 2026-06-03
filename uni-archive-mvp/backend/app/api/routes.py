"""
Core document routes.
"""
from __future__ import annotations
from pathlib import Path
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentOut, DocumentDetail, PaginatedDocuments, SearchResult, SemanticSearchResult, HybridSearchResult
from app.services.ocr_service import extract_text_from_file
from app.services.search_service import search_documents
from app.models.search_log import SearchLog
from app.services.semantic_service import process_and_store_document, search_semantic
from app.services.hybrid_search_service import search_hybrid

router = APIRouter()

@router.get("/documents", response_model=PaginatedDocuments)
def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    course_id: UUID | None = None,
    document_type_id: UUID | None = None,
    db: Session = Depends(get_db)
):
    q = db.query(Document).filter(Document.is_approved == True)
    if course_id:
        q = q.filter(Document.course_id == course_id)
    if document_type_id:
        q = q.filter(Document.document_type_id == document_type_id)
        
    total = q.count()
    items = q.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit
    }

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    course_id: UUID | None = Form(None),
    semester_id: UUID | None = Form(None),
    document_type_id: UUID | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    stored_name = f"{uuid4().hex}_{safe_name}"
    file_path = upload_dir / stored_name

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    # Phase 11 will add size and mime type validation

    file_path.write_bytes(content)

    # Phase 6: OCR Implementation with timing
    import time
    start_time = time.time()
    
    ocr_text, ocr_confidence, extraction_method, page_count = extract_text_from_file(str(file_path))
    
    processing_time_ms = (time.time() - start_time) * 1000.0

    doc = Document(
        title=title,
        course_id=course_id,
        semester_id=semester_id,
        document_type_id=document_type_id,
        uploaded_by=current_user.id,
        file_path=str(file_path),
        original_filename=file.filename,
        mime_type=file.content_type,
        file_size=len(content),
        ocr_text=ocr_text,
        ocr_confidence=ocr_confidence,
        extraction_method=extraction_method,
        page_count=page_count,
        processing_time_ms=processing_time_ms,
        status="processed",
        # Auto-approve for admins/moderators, pending for students
        is_approved=current_user.role.name in ["administrator", "moderator"]
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Phase 7: Semantic Indexing
    try:
        if ocr_text:
            process_and_store_document(db, doc.id, ocr_text)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Semantic indexing failed for {doc.id}: {e}")
        
    return doc

@router.get("/search", response_model=list[SearchResult])
def search(
    q: str = "",
    course_id: UUID | None = None,
    document_type_id: UUID | None = None,
    db: Session = Depends(get_db)
):
    results = search_documents(db, q, course_id, document_type_id)
    output = []
    for doc, snippet, score in results:
        data = SearchResult.model_validate(doc)
        data.snippet = snippet
        data.relevance_score = score
        data.search_type = "keyword"
        output.append(data)
    return output

@router.get("/search/semantic", response_model=list[SemanticSearchResult])
def api_search_semantic(
    query: str,
    course_id: UUID | None = None,
    document_type_id: UUID | None = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    import time
    start_time = time.time()
    
    results = search_semantic(db, query, limit=limit, course_id=course_id, document_type_id=document_type_id)
    
    try:
        response_time_ms = (time.time() - start_time) * 1000.0
        log_entry = SearchLog(
            user_id=None,
            query_text=query,
            search_type="semantic",
            result_count=len(results),
            response_time_ms=response_time_ms
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to log semantic search: {e}")
        
    return results

@router.get("/search/hybrid", response_model=list[HybridSearchResult])
def api_search_hybrid(
    query: str,
    course_id: UUID | None = None,
    document_type_id: UUID | None = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    import time
    start_time = time.time()
    
    results = search_hybrid(db, query, limit=limit, course_id=course_id, document_type_id=document_type_id)
    
    try:
        response_time_ms = (time.time() - start_time) * 1000.0
        log_entry = SearchLog(
            user_id=None,
            query_text=query,
            search_type="hybrid",
            result_count=len(results),
            response_time_ms=response_time_ms
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to log hybrid search: {e}")
        
    return results

@router.get("/documents/{document_id}", response_model=DocumentDetail)
def get_document(document_id: UUID, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.get("/documents/{document_id}/download")
def download_document(document_id: UUID, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    path = Path(doc.file_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File content not found on server.")
        
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type=doc.mime_type or "application/octet-stream"
    )

@router.delete("/documents/{document_id}", status_code=204)
def delete_document(
    document_id: UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    # Only uploader or admin/moderator can delete
    if doc.uploaded_by != current_user.id and current_user.role.name not in ["administrator", "moderator"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
        
    # Remove file from disk
    path = Path(doc.file_path)
    if path.exists():
        path.unlink()
        
    db.delete(doc)
    db.commit()
    return None