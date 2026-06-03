"""
Semantic search service using Sentence-BERT and FAISS.
"""
from __future__ import annotations
import os
import logging
import uuid
import numpy as np
from pathlib import Path
from sqlalchemy.orm import Session
from typing import List, Tuple

# Sentence Transformers and FAISS
from sentence_transformers import SentenceTransformer
import faiss

from app.models.embedding import Embedding
from app.models.document import Document
from app.core.config import settings

logger = logging.getLogger(__name__)

# Constants
MODEL_NAME = "all-MiniLM-L6-v2"
DIMENSIONS = 384
CHUNK_SIZE = 500
OVERLAP = 50

# Ensure data directory exists
DATA_DIR = Path("app/data")
DATA_DIR.mkdir(parents=True, exist_ok=True)
FAISS_INDEX_PATH = DATA_DIR / "faiss_index.bin"

class SemanticServiceSingleton:
    _instance = None
    _model = None
    _index = None

    @classmethod
    def get_instance(cls) -> "SemanticServiceSingleton":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        if SemanticServiceSingleton._instance is not None:
            raise Exception("This class is a singleton!")
        SemanticServiceSingleton._instance = self

    def get_model(self) -> SentenceTransformer:
        if self._model is None:
            logger.info(f"Loading Sentence-BERT model: {MODEL_NAME}...")
            self._model = SentenceTransformer(MODEL_NAME)
            logger.info("Model loaded successfully.")
        return self._model

    def get_index(self) -> faiss.IndexIDMap:
        if self._index is None:
            self._load_or_create_index()
        return self._index

    def _load_or_create_index(self):
        if FAISS_INDEX_PATH.exists():
            logger.info(f"Loading FAISS index from {FAISS_INDEX_PATH}...")
            self._index = faiss.read_index(str(FAISS_INDEX_PATH))
            logger.info(f"FAISS index loaded with {self._index.ntotal} vectors.")
        else:
            logger.info("Creating new FAISS index (IndexFlatIP wrapped in IndexIDMap)...")
            # We use IndexFlatIP (Inner Product) since embeddings will be normalized (cosine similarity)
            base_index = faiss.IndexFlatIP(DIMENSIONS)
            self._index = faiss.IndexIDMap(base_index)
            self.save_index()

    def save_index(self):
        if self._index is not None:
            faiss.write_index(self._index, str(FAISS_INDEX_PATH))
            logger.info(f"FAISS index saved to {FAISS_INDEX_PATH} ({self._index.ntotal} vectors).")

    def rebuild_index_from_db(self, db: Session):
        logger.info("Rebuilding FAISS index from database...")
        base_index = faiss.IndexFlatIP(DIMENSIONS)
        self._index = faiss.IndexIDMap(base_index)
        
        # Stream results to avoid high memory usage if the dataset gets large
        embeddings = db.query(Embedding).yield_per(1000)
        
        vectors = []
        ids = []
        for emb in embeddings:
            vec = np.frombuffer(emb.vector, dtype=np.float32)
            vectors.append(vec)
            ids.append(emb.faiss_id)
            
        if vectors:
            vectors_np = np.vstack(vectors)
            faiss.normalize_L2(vectors_np)
            ids_np = np.array(ids, dtype=np.int64)
            self._index.add_with_ids(vectors_np, ids_np)
            logger.info(f"Rebuilt index with {len(vectors)} vectors.")
        else:
            logger.info("No embeddings found in the database. Index is empty.")
            
        self.save_index()


semantic_service = SemanticServiceSingleton.get_instance()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = OVERLAP) -> List[str]:
    """Splits a string into overlapping chunks."""
    if not text or not text.strip():
        return []
    
    # Simple chunking by character length
    # A more sophisticated approach could split by sentence or tokens
    chunks = []
    start = 0
    text_len = len(text)
    
    if text_len <= chunk_size:
        return [text]
        
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunks.append(text[start:end])
        if end == text_len:
            break
        start += (chunk_size - overlap)
        
    return chunks


def process_and_store_document(db: Session, document_id: uuid.UUID, text: str) -> bool:
    """
    Chunks a document's text, generates embeddings, stores them in PostgreSQL,
    and updates the FAISS index.
    """
    try:
        chunks = chunk_text(text)
        if not chunks:
            logger.info(f"No text to process for document {document_id}")
            return False
            
        model = semantic_service.get_model()
        index = semantic_service.get_index()
        
        # Generate embeddings
        logger.info(f"Generating embeddings for {len(chunks)} chunks...")
        embeddings_np = model.encode(chunks, convert_to_numpy=True)
        # Normalize for cosine similarity (which maps to inner product)
        faiss.normalize_L2(embeddings_np)
        
        faiss_ids = []
        for i, (chunk, vector) in enumerate(zip(chunks, embeddings_np)):
            # Save to database
            vector_bytes = vector.astype(np.float32).tobytes()
            db_emb = Embedding(
                document_id=document_id,
                chunk_index=i,
                chunk_text=chunk,
                vector=vector_bytes
            )
            db.add(db_emb)
            db.commit()
            db.refresh(db_emb)
            faiss_ids.append(db_emb.faiss_id)
            
        # Add to FAISS
        ids_np = np.array(faiss_ids, dtype=np.int64)
        index.add_with_ids(embeddings_np, ids_np)
        
        semantic_service.save_index()
        logger.info(f"Successfully indexed document {document_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to process and store document {document_id}: {e}")
        return False


def search_semantic(db: Session, query: str, limit: int = 10, course_id: uuid.UUID | None = None, document_type_id: uuid.UUID | None = None):
    """
    Performs semantic search using FAISS and joins with the database to return rich results.
    """
    if not query:
        return []
        
    try:
        model = semantic_service.get_model()
        index = semantic_service.get_index()
        
        if index.ntotal == 0:
            return []
            
        # Generate query embedding
        query_vec = model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vec)
        
        # Search FAISS (requesting more results initially to allow post-filtering)
        search_k = max(limit * 5, 50) 
        distances, indices = index.search(query_vec, search_k)
        
        if len(indices[0]) == 0 or indices[0][0] == -1:
            return []
            
        # Extract valid faiss_ids and scores
        faiss_id_to_score = {}
        for score, f_id in zip(distances[0], indices[0]):
            if f_id != -1:
                faiss_id_to_score[int(f_id)] = float(score)
                
        if not faiss_id_to_score:
            return []
            
        # Query database for these embeddings
        valid_faiss_ids = list(faiss_id_to_score.keys())
        
        # We need to join Embedding with Document
        q = db.query(Embedding, Document).join(Document, Embedding.document_id == Document.id)\
              .filter(Embedding.faiss_id.in_(valid_faiss_ids))\
              .filter(Document.is_approved == True)
              
        if course_id:
            q = q.filter(Document.course_id == course_id)
        if document_type_id:
            q = q.filter(Document.document_type_id == document_type_id)
            
        db_results = q.all()
        
        # Aggregate best matching chunk per document
        # Map: doc_id -> (score, db_result)
        doc_best_matches = {}
        
        for emb, doc in db_results:
            score = faiss_id_to_score[emb.faiss_id]
            
            if doc.id not in doc_best_matches or score > doc_best_matches[doc.id][0]:
                doc_best_matches[doc.id] = (score, emb, doc)
                
        # Sort and limit
        sorted_matches = sorted(doc_best_matches.values(), key=lambda x: x[0], reverse=True)[:limit]
        
        # Format output
        results = []
        for score, emb, doc in sorted_matches:
            results.append({
                "document_id": str(doc.id),
                "title": doc.title,
                "course_code": doc.course.code if doc.course else None,
                "document_type": doc.document_type.name if doc.document_type else None,
                "score": score,
                "matching_chunk": emb.chunk_text,
                "extraction_method": doc.extraction_method if hasattr(doc, 'extraction_method') else None,
                "ocr_confidence": doc.ocr_confidence if hasattr(doc, 'ocr_confidence') else None
            })
            
        return results
        
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        return []
