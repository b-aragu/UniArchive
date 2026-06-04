"""
Hybrid search service using Reciprocal Rank Fusion (RRF).
"""
from __future__ import annotations
import uuid
import logging
from sqlalchemy.orm import Session

from app.services.search_service import search_documents
from app.services.semantic_service import search_semantic
from app.models.user import User

logger = logging.getLogger(__name__)

RRF_K = 60

def search_hybrid(
    db: Session, 
    query: str, 
    course_id: uuid.UUID | None = None, 
    document_type_id: uuid.UUID | None = None,
    limit: int = 20,
    current_user: User | None = None
):
    """
    Performs Hybrid Search by combining PostgreSQL FTS and FAISS Semantic Search
    using Reciprocal Rank Fusion (RRF).
    """
    if not query:
        return []

    # 1. Execute keyword search (FTS)
    # Get a larger pool to ensure overlap for fusion
    keyword_pool_size = max(limit * 3, 60)
    keyword_results = search_documents(
        db=db, 
        query=query, 
        course_id=course_id, 
        document_type_id=document_type_id, 
        limit=keyword_pool_size,
        current_user=current_user
    )

    # 2. Execute semantic search (FAISS)
    semantic_pool_size = max(limit * 3, 60)
    semantic_results = search_semantic(
        db=db,
        query=query,
        course_id=course_id,
        document_type_id=document_type_id,
        limit=semantic_pool_size,
        current_user=current_user
    )

    # 3. Apply Reciprocal Rank Fusion
    # RRF Score = Σ (1 / (k + rank))
    scores = {}
    doc_metadata = {}

    # Process Keyword Rankings
    for rank_idx, (doc, snippet, _) in enumerate(keyword_results):
        doc_id = str(doc.id)
        rank = rank_idx + 1
        rrf_score = 1.0 / (RRF_K + rank)
        
        scores[doc_id] = scores.get(doc_id, 0.0) + rrf_score
        
        if doc_id not in doc_metadata:
            doc_metadata[doc_id] = {
                "document_id": doc_id,
                "title": doc.title,
                "course_code": doc.course.code if doc.course else None,
                "document_type": doc.document_type.name if doc.document_type else None,
                "extraction_method": doc.extraction_method,
                "ocr_confidence": doc.ocr_confidence,
                "keyword_rank": rank,
                "semantic_rank": None,
                "matching_chunk": snippet or ""
            }
        else:
            doc_metadata[doc_id]["keyword_rank"] = rank
            if snippet and not doc_metadata[doc_id]["matching_chunk"]:
                doc_metadata[doc_id]["matching_chunk"] = snippet

    # Process Semantic Rankings
    for rank_idx, sem_res in enumerate(semantic_results):
        doc_id = sem_res["document_id"]
        rank = rank_idx + 1
        rrf_score = 1.0 / (RRF_K + rank)
        
        scores[doc_id] = scores.get(doc_id, 0.0) + rrf_score
        
        if doc_id not in doc_metadata:
            doc_metadata[doc_id] = {
                "document_id": doc_id,
                "title": sem_res["title"],
                "course_code": sem_res["course_code"],
                "document_type": sem_res["document_type"],
                "extraction_method": sem_res["extraction_method"],
                "ocr_confidence": sem_res["ocr_confidence"],
                "keyword_rank": None,
                "semantic_rank": rank,
                "matching_chunk": sem_res["matching_chunk"]
            }
        else:
            doc_metadata[doc_id]["semantic_rank"] = rank
            # Semantic chunk is usually better/more precise than FTS snippet, so override
            if sem_res["matching_chunk"]:
                doc_metadata[doc_id]["matching_chunk"] = sem_res["matching_chunk"]

    # 4. Sort by final RRF score
    final_results = []
    for doc_id, final_score in scores.items():
        meta = doc_metadata[doc_id]
        meta["hybrid_score"] = final_score
        final_results.append(meta)

    final_results.sort(key=lambda x: x["hybrid_score"], reverse=True)

    # 5. Return top 'limit' results
    return final_results[:limit]
