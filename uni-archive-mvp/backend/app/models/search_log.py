"""
SearchLog model — records every search query for analytics.
"""
import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,  # Allow anonymous searches if auth is not enforced
        index=True,
    )
    query_text = Column(Text, nullable=False)
    search_type = Column(
        String(20),
        nullable=False,
        index=True,
    )  # 'keyword', 'semantic', 'hybrid'
    result_count = Column(Integer, nullable=False, default=0)
    response_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="search_logs")

    def __repr__(self) -> str:
        return f"<SearchLog(query={self.query_text!r}, type={self.search_type!r})>"
