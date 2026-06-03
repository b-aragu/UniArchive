"""
End-to-End MVP Integration Test Script (Phase 11).
Tests DB, Models, Auth, Upload, OCR, Semantic, Hybrid, and Duplicates via FastAPI TestClient.
"""
import os
import time
import logging
from uuid import uuid4
from sqlalchemy import text
from fastapi.testclient import TestClient
from pathlib import Path

# Important: ensure PYTHONPATH is set to backend dir when running this
from app.main import app
from app.db.database import SessionLocal
from app.models.document import Document
from app.models.user import User
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

def clean_database():
    db = SessionLocal()
    # Delete test users
    db.query(User).filter(User.email.like("%@test.com")).delete(synchronize_session=False)
    # Delete test docs
    db.query(Document).filter(Document.title.like("MVP_E2E_%")).delete(synchronize_session=False)
    db.commit()
    db.close()

def run_tests():
    logger.info("========================================")
    logger.info("TASK 1 — ENVIRONMENT VALIDATION")
    logger.info("========================================")
    
    # 1. Database connection
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        logger.info("✅ PostgreSQL Database connection: SUCCESS")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return
        
    # 2. Check Envs
    from app.core.config import settings
    logger.info(f"✅ Settings Loaded: JWT Algo={settings.jwt_algorithm}")
    
    # 3. Model & FAISS loading
    try:
        from app.services.semantic_service import SemanticServiceSingleton
        svc = SemanticServiceSingleton.get_instance()
        model = svc.get_model()
        logger.info(f"✅ SBERT Model Loaded: {model.__class__.__name__}")
        index = svc.get_index()
        logger.info(f"✅ FAISS Index Loaded: Total Vectors = {index.ntotal}")
    except Exception as e:
        logger.error(f"❌ Semantic service loading failed: {e}")
        return
        
    logger.info("\n========================================")
    logger.info("TASK 2 — USER FLOW TESTING")
    logger.info("========================================")
    
    clean_database()
    
    users_data = [
        {"email": "admin@test.com", "password": "password123", "full_name": "Admin Test", "role_name": "administrator"},
        {"email": "mod@test.com", "password": "password123", "full_name": "Mod Test", "role_name": "moderator"},
        {"email": "student@test.com", "password": "password123", "full_name": "Student Test", "role_name": "student"}
    ]
    
    # Register Users (Note: Our register endpoint currently defaults to student. We'll inject via DB for roles)
    tokens = {}
    for u in users_data:
        # Get role ID
        role_res = db.execute(text(f"SELECT id FROM roles WHERE name = '{u['role_name']}'")).fetchone()
        role_id = role_res[0] if role_res else None
        
        # Create user manually to set roles correctly
        new_u = User(id=uuid4(), email=u['email'], password_hash=get_password_hash(u['password']), full_name=u['full_name'], role_id=role_id, is_active=True)
        db.add(new_u)
        db.commit()
        
        # Login via API
        resp = client.post("/api/auth/login", data={"username": u['email'], "password": u['password']})
        assert resp.status_code == 200, f"Login failed for {u['email']}"
        tokens[u['role_name']] = resp.json()["access_token"]
        logger.info(f"✅ Registered and Logged in as: {u['role_name']}")
        
    # Protected route test
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tokens['student']}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "student@test.com"
    logger.info("✅ Protected routes verified")
    
    logger.info("\n========================================")
    logger.info("TASK 3 — DOCUMENT FLOW TESTING")
    logger.info("========================================")
    
    pdf_path = Path("../../UniArchive_Test_Document.pdf")
    if not pdf_path.exists():
        pdf_path = Path("/home/baragu/Documents/UniArchive/UniArchive_Test_Document.pdf")
        
    if not pdf_path.exists():
        logger.error("❌ UniArchive_Test_Document.pdf not found!")
        return
        
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    # Upload using admin
    logger.info("Uploading document...")
    start_time = time.time()
    upload_resp = client.post(
        "/api/upload",
        headers={"Authorization": f"Bearer {tokens['administrator']}"},
        data={"title": "MVP_E2E_Test_Document"},
        files={"file": (pdf_path.name, file_bytes, "application/pdf")}
    )
    upload_time = time.time() - start_time
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    doc_data = upload_resp.json()
    logger.info(f"✅ Upload successful. Status: {doc_data['status']}, OCR Time: {doc_data.get('processing_time_ms', 0):.2f}ms")
    logger.info(f"   OCR Text Extracted: {len(doc_data.get('ocr_text', ''))} characters")
    
    doc_id = doc_data['id']
    
    # Wait a bit for FAISS
    time.sleep(1)
    
    # Duplicate Detection
    logger.info("Uploading same document to trigger duplicate detection...")
    dup_resp = client.post(
        "/api/upload",
        headers={"Authorization": f"Bearer {tokens['administrator']}"},
        data={"title": "MVP_E2E_Duplicate_Document"},
        files={"file": (pdf_path.name, file_bytes, "application/pdf")}
    )
    assert dup_resp.status_code == 200
    dup_data = dup_resp.json()
    warnings = dup_data.get("duplicate_warning")
    if warnings:
        logger.info(f"✅ Duplicate detected successfully! Method: {warnings[0]['method']}, Score: {warnings[0]['similarity_score']}")
    else:
        logger.error("❌ Duplicate NOT detected!")
        
    logger.info("\n========================================")
    logger.info("TASK 4 — SEARCH TESTING")
    logger.info("========================================")
    
    search_query = "reportlab generated pdf" # common in pdfs, or just "test"
    # Actually, we can use a word from the OCR text
    ocr_text = doc_data.get('ocr_text', 'university')
    if ocr_text:
        words = [w for w in ocr_text.split() if len(w) > 4]
        if words:
            search_query = words[0]
            
    logger.info(f"Using search query: '{search_query}'")
    
    # Keyword Search
    kw_start = time.time()
    kw_resp = client.get(f"/api/search?q={search_query}")
    kw_time = time.time() - kw_start
    assert kw_resp.status_code == 200
    logger.info(f"✅ Keyword Search: {len(kw_resp.json())} results in {kw_time*1000:.2f}ms")
    
    # Semantic Search
    sem_start = time.time()
    sem_resp = client.get(f"/api/search/semantic?query={search_query}")
    sem_time = time.time() - sem_start
    assert sem_resp.status_code == 200
    logger.info(f"✅ Semantic Search: {len(sem_resp.json())} results in {sem_time*1000:.2f}ms")
    
    # Hybrid Search
    hyb_start = time.time()
    hyb_resp = client.get(f"/api/search/hybrid?query={search_query}")
    hyb_time = time.time() - hyb_start
    assert hyb_resp.status_code == 200
    hyb_json = hyb_resp.json()
    logger.info(f"✅ Hybrid Search: {len(hyb_json)} results in {hyb_time*1000:.2f}ms")
    if hyb_json:
        logger.info(f"   Top Result Hybrid Score: {hyb_json[0].get('hybrid_score', 0):.4f}")
        
    logger.info("\n========================================")
    logger.info("TASK 7 — PERFORMANCE SUMMARY")
    logger.info("========================================")
    logger.info(f"- Total Upload Pipeline Time: {upload_time:.2f} seconds")
    logger.info(f"- OCR Processing Time: {doc_data.get('processing_time_ms', 0):.2f} ms")
    logger.info(f"- Keyword Search Latency: {kw_time*1000:.2f} ms")
    logger.info(f"- Semantic Search Latency: {sem_time*1000:.2f} ms")
    logger.info(f"- Hybrid Search Latency: {hyb_time*1000:.2f} ms")
    logger.info("========================================")
    
if __name__ == "__main__":
    run_tests()
