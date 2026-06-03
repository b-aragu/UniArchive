"""
University model — top-level academic institution.
"""
import uuid

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class University(Base):
    __tablename__ = "universities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)

    # Relationships
    faculties = relationship("Faculty", back_populates="university", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<University(code={self.code!r}, name={self.name!r})>"
