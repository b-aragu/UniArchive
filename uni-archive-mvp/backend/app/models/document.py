from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    course_code = Column(String(50), nullable=True, index=True)
    course_name = Column(String(255), nullable=True)
    academic_year = Column(String(20), nullable=True, index=True)
    semester = Column(String(20), nullable=True)
    document_type = Column(String(50), nullable=True, index=True)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    ocr_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    status = Column(String(50), default="processed", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())