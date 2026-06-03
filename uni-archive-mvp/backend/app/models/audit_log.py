"""
AuditLog model — immutable audit trail of all system mutations.
"""
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action = Column(String(50), nullable=False, index=True)  # 'create', 'update', 'delete', 'login', 'upload'
    entity_type = Column(String(50), nullable=False, index=True)  # 'document', 'user', 'feedback', etc.
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSONB, nullable=True)  # Arbitrary metadata about the action
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog(action={self.action!r}, entity={self.entity_type!r})>"
