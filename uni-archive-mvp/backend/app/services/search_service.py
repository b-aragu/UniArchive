from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.document import Document

def make_snippet(text: str | None, query: str, size: int = 220) -> str | None:
    if not text:
        return None
    lower_text = text.lower()
    lower_query = query.lower()
    idx = lower_text.find(lower_query)
    if idx == -1:
        return text[:size] + ("..." if len(text) > size else "")
    start = max(idx - 80, 0)
    end = min(idx + len(query) + 140, len(text))
    return ("..." if start > 0 else "") + text[start:end] + ("..." if end < len(text) else "")

def search_documents(db: Session, query: str, course_code: str | None = None, document_type: str | None = None):
    q = db.query(Document)

    if query:
        pattern = f"%{query}%"
        q = q.filter(
            or_(
                Document.title.ilike(pattern),
                Document.course_code.ilike(pattern),
                Document.course_name.ilike(pattern),
                Document.document_type.ilike(pattern),
                Document.academic_year.ilike(pattern),
                Document.ocr_text.ilike(pattern),
            )
        )

    if course_code:
        q = q.filter(Document.course_code.ilike(f"%{course_code}%"))

    if document_type:
        q = q.filter(Document.document_type.ilike(f"%{document_type}%"))

    docs = q.order_by(Document.created_at.desc()).limit(50).all()
    return [(doc, make_snippet(doc.ocr_text, query)) for doc in docs]