from datetime import datetime
from pydantic import BaseModel

class DocumentOut(BaseModel):
    id: int
    title: str
    course_code: str | None = None
    course_name: str | None = None
    academic_year: str | None = None
    semester: str | None = None
    document_type: str | None = None
    original_filename: str
    ocr_text: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SearchResult(DocumentOut):
    snippet: str | None = None