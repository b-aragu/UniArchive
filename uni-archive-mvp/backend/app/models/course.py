"""
Course model — belongs to a department, linked to documents.
"""
import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    department_id = Column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    department = relationship("Department", back_populates="courses")
    documents = relationship("Document", back_populates="course")

    def __repr__(self) -> str:
        return f"<Course(code={self.code!r}, name={self.name!r})>"
