"""
Faculty model — belongs to a university, contains departments.
"""
import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Faculty(Base):
    __tablename__ = "faculties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    university_id = Column(
        UUID(as_uuid=True),
        ForeignKey("universities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    university = relationship("University", back_populates="faculties")
    departments = relationship("Department", back_populates="faculty", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Faculty(name={self.name!r})>"
