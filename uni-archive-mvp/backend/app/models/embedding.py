"""
Embedding model — stores Sentence-BERT vector embeddings for semantic search.

Each document can have multiple chunks, each with its own embedding vector.
The vector is stored as a binary blob (LargeBinary) to keep the schema
database-agnostic; the FAISS index stores the actual searchable vectors.
"""
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index = Column(Integer, nullable=False, default=0)
    chunk_text = Column(Text, nullable=True)
    vector = Column(LargeBinary, nullable=False)  # numpy array serialized via .tobytes()
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    document = relationship("Document", back_populates="embeddings")

    def __repr__(self) -> str:
        return f"<Embedding(document_id={self.document_id!r}, chunk={self.chunk_index})>"
