"""
AcademicYear model — e.g. 2024/2025, contains semesters.
"""
import uuid

from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class AcademicYear(Base):
    __tablename__ = "academic_years"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    label = Column(String(20), unique=True, nullable=False, index=True)  # e.g. "2024/2025"
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=False)

    # Relationships
    semesters = relationship("Semester", back_populates="academic_year", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AcademicYear(label={self.label!r})>"
