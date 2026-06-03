"""
Validation script for Duplicate Detection (Phase 9).
"""
import logging
import os
import time
from uuid import uuid4
from PIL import Image, ImageDraw
from app.db.database import SessionLocal
from app.models.document import Document
from app.services.duplicate_service import detect_duplicates, compute_phash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_images():
    os.makedirs("test_data", exist_ok=True)
    
    # 1. Base Image
    img1 = Image.new('RGB', (200, 200), color = 'red')
    d = ImageDraw.Draw(img1)
    d.text((10,10), "Test Duplicate Image", fill=(255,255,0))
    img1.save("test_data/base.png")
    
    # 2. Identical Image (same bytes, different name)
    img1.save("test_data/identical.png")
    
    # 3. Similar Image (slight modification, e.g. text added)
    img3 = img1.copy()
    d3 = ImageDraw.Draw(img3)
    d3.text((10, 50), "Extra info here", fill=(0,255,0))
    img3.save("test_data/similar.png")
    
    # 4. Completely different image
    img4 = Image.new('RGB', (200, 200), color = 'blue')
    img4.save("test_data/different.png")

def insert_doc(db, title, file_path, ocr_text=""):
    phash = compute_phash(file_path)
    doc = Document(
        id=uuid4(),
        title=title,
        file_path=file_path,
        original_filename=os.path.basename(file_path),
        ocr_text=ocr_text,
        phash=phash,
        status="processed",
        is_approved=True
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def test_duplicates():
    create_test_images()
    db = SessionLocal()
    
    # Clean up existing docs from previous test runs if needed
    db.query(Document).filter(Document.title.like("TEST_DUP_%")).delete(synchronize_session=False)
    db.commit()
    
    logger.info("--- Testing Duplicate Detection ---")
    
    # Insert base document
    doc_base = insert_doc(db, "TEST_DUP_Base", "test_data/base.png", "Machine learning relies on large datasets.")
    logger.info(f"Inserted Base Document: pHash={doc_base.phash}")
    
    # 1. Identical Image
    doc_ident = insert_doc(db, "TEST_DUP_Identical", "test_data/identical.png", "Machine learning relies on large datasets.")
    dups_ident = detect_duplicates(db, doc_ident)
    logger.info(f"Identical Image Detection: Found {len(dups_ident)} duplicates. {dups_ident}")
    assert len(dups_ident) > 0 and dups_ident[0]['method'] == 'phash'
    
    # 2. Similar Image
    doc_sim = insert_doc(db, "TEST_DUP_Similar", "test_data/similar.png", "Machine learning relies on large datasets.")
    dups_sim = detect_duplicates(db, doc_sim)
    logger.info(f"Similar Image Detection: Found {len(dups_sim)} duplicates. {dups_sim}")
    assert len(dups_sim) > 0 and dups_sim[0]['method'] == 'phash'
    
    # 3. Completely Different Image (Non-duplicate)
    doc_diff = insert_doc(db, "TEST_DUP_Different", "test_data/different.png", "Unrelated text.")
    dups_diff = detect_duplicates(db, doc_diff)
    logger.info(f"Different Image Detection: Found {len(dups_diff)} duplicates. {dups_diff}")
    assert len(dups_diff) == 0
    
    # 4. Text Duplicate (Missing Image / No pHash)
    # Simulate a document where pHash failed or was not generated
    doc_text1 = Document(id=uuid4(), title="TEST_DUP_Text1", file_path="none1", original_filename="none", ocr_text="The quick brown fox jumps over the lazy dog.", status="processed")
    db.add(doc_text1)
    db.commit()
    
    doc_text2 = Document(id=uuid4(), title="TEST_DUP_Text2", file_path="none2", original_filename="none", ocr_text="The quick brown fox jumps over the lazy dog.", status="processed")
    db.add(doc_text2)
    db.commit()
    
    dups_text = detect_duplicates(db, doc_text2)
    logger.info(f"Text Similarity Detection: Found {len(dups_text)} duplicates. {dups_text}")
    assert len(dups_text) > 0 and dups_text[0]['method'] == 'text_similarity'

    logger.info("All duplicate tests passed successfully!")
    db.close()

if __name__ == "__main__":
    test_duplicates()
