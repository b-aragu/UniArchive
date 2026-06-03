"""
DocumentType model — categorizes documents (Exam, CAT, Assignment, Notes, etc.).
"""
import uuid

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class DocumentType(Base):
    __tablename__ = "document_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)

    # Relationships
    documents = relationship("Document", back_populates="document_type")

    def __repr__(self) -> str:
        return f"<DocumentType(name={self.name!r})>"
