"""
Duplicate detection service.
Computes perceptual hashes (pHash) for image/PDF documents,
and provides a fallback text similarity mechanism using OCR text.
"""
from __future__ import annotations
import logging
import imagehash
from PIL import Image
import fitz
import numpy as np
from pathlib import Path
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.document import Document
from app.models.duplicate_pair import DuplicatePair

logger = logging.getLogger(__name__)

PHASH_THRESHOLD = 15  # Max hamming distance to be considered a duplicate
TEXT_SIMILARITY_THRESHOLD = 0.85  # Minimum Jaccard similarity

def compute_phash(file_path: str) -> str | None:
    """
    Computes a perceptual hash (pHash) for an image or the first page of a PDF.
    """
    path = Path(file_path)
    if not path.exists():
        return None

    try:
        if path.suffix.lower() == ".pdf":
            doc = fitz.open(path)
            if len(doc) == 0:
                return None
            page = doc[0]
            pix = page.get_pixmap(matrix=fitz.Matrix(1.0, 1.0))
            img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
            # Remove alpha channel if present
            if pix.n == 4:
                # Pillow accepts RGBA
                img = Image.fromarray(img_np, mode="RGBA").convert("RGB")
            else:
                img = Image.fromarray(img_np, mode="RGB")
        else:
            img = Image.open(path).convert("RGB")

        phash = imagehash.phash(img)
        return str(phash)
    except Exception as e:
        logger.error(f"Failed to compute pHash for {path.name}: {e}")
        return None

def compute_jaccard_similarity(text1: str, text2: str) -> float:
    """
    Computes simple word-level Jaccard similarity for text fallback.
    """
    if not text1 or not text2:
        return 0.0
    
    # Take first 5000 chars for efficiency
    t1_words = set(text1[:5000].lower().split())
    t2_words = set(text2[:5000].lower().split())
    
    if not t1_words or not t2_words:
        return 0.0
        
    intersection = t1_words.intersection(t2_words)
    union = t1_words.union(t2_words)
    
    return len(intersection) / len(union)

def detect_duplicates(db: Session, new_doc: Document) -> list[dict]:
    """
    Scans the database to find duplicates for a newly inserted document.
    Returns a list of duplicate info dicts.
    """
    duplicates = []
    
    # 1. Fetch existing documents to compare against (excluding self)
    # Ideally, we would filter this in the DB, but since we need to compute Hamming distance
    # in Python, we fetch docs with phashes. We could optimize this by using pg-similarity
    # or a dedicated structure, but for MVP fetching all phashes is acceptable.
    existing_docs = db.query(Document).filter(
        Document.id != new_doc.id,
        Document.status != "failed"
    ).all()
    
    new_hash = None
    if new_doc.phash:
        try:
            new_hash = imagehash.hex_to_hash(new_doc.phash)
        except ValueError:
            pass

    for existing in existing_docs:
        is_duplicate = False
        method = None
        similarity_score = 0.0
        
        # Check pHash first
        if new_hash and existing.phash:
            try:
                exist_hash = imagehash.hex_to_hash(existing.phash)
                hamming_distance = new_hash - exist_hash
                
                # Score: 1.0 for exactly identical, 0.0 for completely different
                # A 64-bit hash has max distance 64.
                max_dist = 64.0
                score = 1.0 - (hamming_distance / max_dist)
                
                if hamming_distance <= PHASH_THRESHOLD:
                    is_duplicate = True
                    method = "phash"
                    similarity_score = score
            except ValueError:
                pass
                
        # Fallback to Text Similarity if pHash check fails or is unavailable
        if not is_duplicate and new_doc.ocr_text and existing.ocr_text:
            text_score = compute_jaccard_similarity(new_doc.ocr_text, existing.ocr_text)
            if text_score >= TEXT_SIMILARITY_THRESHOLD:
                is_duplicate = True
                method = "text_similarity"
                similarity_score = text_score
                
        if is_duplicate:
            # Save duplicate pair
            dup_pair = DuplicatePair(
                document_a_id=new_doc.id,
                document_b_id=existing.id,
                similarity_score=similarity_score,
                detection_method=method
            )
            db.add(dup_pair)
            
            duplicates.append({
                "duplicate_document_id": str(existing.id),
                "title": existing.title,
                "similarity_score": similarity_score,
                "method": method
            })

    # Commit pairs if any
    if duplicates:
        db.commit()
        
    return duplicates
