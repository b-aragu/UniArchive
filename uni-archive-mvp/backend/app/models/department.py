"""
Department model — belongs to a faculty, contains courses.
"""
import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    faculty_id = Column(
        UUID(as_uuid=True),
        ForeignKey("faculties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    faculty = relationship("Faculty", back_populates="departments")
    courses = relationship("Course", back_populates="department", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Department(code={self.code!r}, name={self.name!r})>"
