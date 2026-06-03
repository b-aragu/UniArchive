"""
Role model — defines RBAC roles (Student, Moderator, Administrator).
"""
import uuid

from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    users = relationship("User", back_populates="role")

    def __repr__(self) -> str:
        return f"<Role(name={self.name!r})>"
