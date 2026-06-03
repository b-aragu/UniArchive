"""
Script to backfill FAISS index and embeddings for documents that already have OCR text.
"""
import argparse
import logging
from app.db.database import SessionLocal
from app.models.document import Document
from app.models.embedding import Embedding
from app.services.semantic_service import process_and_store_document, semantic_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(force: bool = False):
    db = SessionLocal()
    try:
        if force:
            logger.info("Force flag enabled. Dropping all existing embeddings and rebuilding from scratch.")
            db.query(Embedding).delete()
            db.commit()
            
        docs = db.query(Document).filter(Document.ocr_text.isnot(None)).all()
        logger.info(f"Found {len(docs)} documents with OCR text.")
        
        processed_count = 0
        skipped_count = 0
        
        for doc in docs:
            # Check if embeddings already exist
            existing_count = db.query(Embedding).filter(Embedding.document_id == doc.id).count()
            if existing_count > 0 and not force:
                logger.info(f"Skipping document {doc.id} (already has {existing_count} embeddings).")
                skipped_count += 1
                continue
                
            logger.info(f"Processing document: {doc.title} ({doc.id})")
            success = process_and_store_document(db, doc.id, doc.ocr_text)
            if success:
                processed_count += 1
                
        logger.info(f"Backfill complete! Processed: {processed_count}, Skipped: {skipped_count}")
        
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill document embeddings.")
    parser.add_argument("--force", action="store_true", help="Force rebuild of all embeddings.")
    args = parser.parse_args()
    main(force=args.force)
