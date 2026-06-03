# Supervisor Technical Walkthrough

**Project:** UniArchive  

## 1. What Has Been Completed
As of the current milestone, UniArchive is 58% complete. The foundational architecture, core database, full-text search, OCR preprocessing, and semantic search integration are fully operational on the backend.

## 2. Technical Architecture
The system employs a modern, decoupled architecture:
*   **Backend:** FastAPI (Python 3.9) offering async, high-performance REST APIs.
*   **Database:** PostgreSQL 16, utilizing GIN indices for Full-Text Search (FTS) and a normalized 15-table relational schema.
*   **ORM:** SQLAlchemy 2.0 with Alembic for strict version-controlled database migrations.
*   **Search Engine:** Dual-engine retrieval using Postgres FTS (keyword) and FAISS (semantic).
*   **Machine Learning:** Tesseract OCR (with OpenCV preprocessing) and Sentence-BERT (`all-MiniLM-L6-v2`) for vector embeddings.

## 3. Features Implemented
*   **Robust Auth & RBAC:** Secure JWT authentication enforcing Student, Moderator, and Admin roles.
*   **Document Management:** Secure file uploads, metadata extraction, validation, and storage.
*   **Intelligent OCR:** An adaptive pipeline that attempts digital extraction via PyMuPDF and falls back to OpenCV-enhanced Tesseract OCR for scanned images.
*   **Keyword Retrieval:** PostgreSQL native `tsvector` matching with lexical stemming and relevance ranking.
*   **Semantic Retrieval:** SBERT embeddings chunked via sliding window and indexed in an in-memory FAISS database for contextual nearest-neighbor searches.

## 4. Features In Progress / Pending
*   **Frontend (Phase 10):** The React/Vite user interface is currently in the planning phase.
*   **Hybrid Search (Phase 8):** Merging Keyword and Semantic scores using Reciprocal Rank Fusion (RRF).
*   **Duplicate Detection (Phase 9):** Utilizing Perceptual Hashing (pHash) and text similarity to block duplicate uploads.

## 5. Future Work
*   Integration of LLM-based summarization for document previews.
*   Deployment to a scalable cloud infrastructure (e.g., AWS/GCP) using Docker Swarm or Kubernetes.
