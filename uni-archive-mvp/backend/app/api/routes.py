from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentOut, SearchResult
from app.services.ocr_service import extract_text_from_file
from app.services.search_service import search_documents

router = APIRouter()

@router.get("/documents", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).limit(100).all()

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    course_code: str | None = Form(None),
    course_name: str | None = Form(None),
    academic_year: str | None = Form(None),
    semester: str | None = Form(None),
    document_type: str | None = Form(None),
    db: Session = Depends(get_db),
):
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    stored_name = f"{uuid4().hex}_{safe_name}"
    file_path = upload_dir / stored_name

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    file_path.write_bytes(content)

    ocr_text, ocr_confidence = extract_text_from_file(str(file_path))

    doc = Document(
        title=title,
        course_code=course_code,
        course_name=course_name,
        academic_year=academic_year,
        semester=semester,
        document_type=document_type,
        file_path=str(file_path),
        original_filename=file.filename,
        ocr_text=ocr_text,
        ocr_confidence=ocr_confidence,
        status="processed",
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/search", response_model=list[SearchResult])
def search(
    q: str = "",
    course_code: str | None = None,
    document_type: str | None = None,
    db: Session = Depends(get_db),
):
    results = search_documents(db, q, course_code, document_type)
    output = []
    for doc, snippet in results:
        data = SearchResult.model_validate(doc)
        data.snippet = snippet
        output.append(data)
    return output

@router.get("/documents/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc