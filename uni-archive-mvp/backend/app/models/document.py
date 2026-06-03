"""
Document model — the central entity storing uploaded academic documents.

Includes:
- Foreign keys to course, semester, document_type, uploaded_by (user)
- Full-text search tsvector column with GIN index
- pHash column for duplicate detection
- Approval workflow status
"""
import uuid

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Computed,
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import TSVECTOR, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Core metadata
    title = Column(String(255), nullable=False, index=True)

    # Academic hierarchy (foreign keys)
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    semester_id = Column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    document_type_id = Column(
        UUID(as_uuid=True),
        ForeignKey("document_types.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Uploader
    uploaded_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,  # Nullable until auth is implemented
        index=True,
    )

    # File storage
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, nullable=True)  # bytes

    # OCR
    ocr_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)

    # Duplicate detection
    phash = Column(String(64), nullable=True, index=True)

    # Workflow
    status = Column(
        String(50),
        default="pending",
        nullable=False,
        index=True,
    )
    is_approved = Column(Boolean, default=False, nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Full-Text Search — generated tsvector column combining title and ocr_text.
    # Uses 'english' text search configuration for stemming.
    search_vector = Column(
        TSVECTOR,
        Computed(
            "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(ocr_text, ''))",
            persisted=True,
        ),
        nullable=True,
    )

    # Relationships
    course = relationship("Course", back_populates="documents")
    semester = relationship("Semester", back_populates="documents")
    document_type = relationship("DocumentType", back_populates="documents")
    uploaded_by_user = relationship("User", back_populates="documents")
    embeddings = relationship("Embedding", back_populates="document", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="document", cascade="all, delete-orphan")
    duplicate_pairs_a = relationship(
        "DuplicatePair",
        foreign_keys="DuplicatePair.document_a_id",
        back_populates="document_a",
        cascade="all, delete-orphan",
    )
    duplicate_pairs_b = relationship(
        "DuplicatePair",
        foreign_keys="DuplicatePair.document_b_id",
        back_populates="document_b",
        cascade="all, delete-orphan",
    )

    # Indexes
    __table_args__ = (
        # GIN index on tsvector for fast full-text search
        Index("ix_documents_search_vector", "search_vector", postgresql_using="gin"),
    )

    def __repr__(self) -> str:
        return f"<Document(title={self.title!r}, status={self.status!r})>"