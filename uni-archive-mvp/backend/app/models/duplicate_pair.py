"""
DuplicatePair model — tracks detected duplicate document pairs.
"""
import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class DuplicatePair(Base):
    __tablename__ = "duplicate_pairs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_a_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_b_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    similarity_score = Column(Float, nullable=False)  # 0.0 to 1.0
    detection_method = Column(
        String(50),
        nullable=False,
        default="phash",
    )  # 'phash', 'text_similarity', etc.
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    document_a = relationship(
        "Document",
        foreign_keys=[document_a_id],
        back_populates="duplicate_pairs_a",
    )
    document_b = relationship(
        "Document",
        foreign_keys=[document_b_id],
        back_populates="duplicate_pairs_b",
    )

    def __repr__(self) -> str:
        return f"<DuplicatePair(a={self.document_a_id!r}, b={self.document_b_id!r}, score={self.similarity_score})>"
