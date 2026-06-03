"""
Semester model — belongs to an academic year, linked to documents.
"""
import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Semester(Base):
    __tablename__ = "semesters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    label = Column(String(50), nullable=False, index=True)  # e.g. "Semester 1"
    academic_year_id = Column(
        UUID(as_uuid=True),
        ForeignKey("academic_years.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    academic_year = relationship("AcademicYear", back_populates="semesters")
    documents = relationship("Document", back_populates="semester")

    def __repr__(self) -> str:
        return f"<Semester(label={self.label!r})>"
