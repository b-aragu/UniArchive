# Chapter 4: Implementation

## 4.1 Backend Implementation
The backend was developed iteratively using FastAPI. Pydantic schemas were strictly enforced for all request and response models, ensuring data validation before it reached the database layer. JWT (JSON Web Tokens) were implemented via `passlib` and `python-jose` to secure endpoints based on user roles (`student`, `moderator`, `administrator`).

## 4.2 Database Implementation
SQLAlchemy 2.0 was utilized as the Object Relational Mapper (ORM). Alembic was integrated to handle all database migrations, allowing the schema to evolve safely over time. The `embeddings` table was specifically designed with an auto-incrementing `faiss_id` using PostgreSQL `IDENTITY` to provide a bridge between the relational database and the in-memory FAISS index.

## 4.3 OCR Implementation
The `ocr_service.py` module encapsulates the extraction logic. `pdf2image` handles rasterization of PDFs at 300 DPI to ensure sufficient resolution for Tesseract. The OpenCV pipeline dynamically adjusts image contrast before passing it to `pytesseract`. Performance logging was wrapped around these calls to monitor the extraction time (milliseconds for digital vs seconds for optical).

## 4.4 Semantic Search Implementation
*This section will be expanded upon fully verifying Phase 8 Hybrid Search.* 
The `semantic_service.py` module utilizes `sentence-transformers`. A singleton pattern was implemented to load the `all-MiniLM-L6-v2` model into memory only once upon application startup, preventing heavy load times on individual API requests. The FAISS index is persisted to the local disk and automatically rebuilt if a mismatch between the database and the index is detected.
