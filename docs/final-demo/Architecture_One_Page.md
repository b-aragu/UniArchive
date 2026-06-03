# UniArchive Architecture One-Pager

## The Problem
Universities generate thousands of academic documents (CATs, past papers, lecture notes). Historically, these exist as scanned PDFs or low-quality images. Standard archival systems fail to index the text within these images, rendering vast amounts of educational material completely unsearchable and functionally invisible to students.

## The Solution
UniArchive bridges this gap by processing every uploaded document through an Optical Character Recognition (OCR) pipeline, extracting the hidden text. It then indexes this text using two parallel methodologies: classical keyword matching and modern semantic vector analysis, making even scanned documents discoverable by meaning.

## System Architecture
*   **Client Layer:** A responsive React (Vite) Single Page Application (SPA).
*   **API Gateway:** FastAPI securely routing traffic via JWT validation.
*   **Processing Layer:** 
    *   `ocr_service`: OpenCV preprocessing and Tesseract text extraction.
    *   `semantic_service`: Sliding-window text chunking and SBERT embedding generation.
*   **Data Persistence Layer:**
    *   PostgreSQL: Stores normalized academic hierarchy, document metadata, and PostgreSQL `tsvector` FTS indices.
    *   FAISS: High-speed, in-memory vector database indexing 384-dimensional dense vectors.
*   **Storage:** Local filesystem (MVP) / S3-compatible blob storage (Production) for binary PDFs.

## Core Technologies
*   **Backend:** Python 3.9, FastAPI, SQLAlchemy, Alembic.
*   **Database:** PostgreSQL 16, FAISS-CPU.
*   **AI/ML:** Tesseract OCR, OpenCV, Sentence-Transformers (`all-MiniLM-L6-v2`), PyTorch.
*   **Frontend:** React 19, TypeScript, Vite.

## Data Workflow
1.  **Upload:** User submits a scanned PDF.
2.  **Extraction:** Pipeline attempts digital extraction. Upon failure, falls back to OpenCV enhancement and Tesseract OCR.
3.  **Indexing (Keyword):** The extracted text is stemmed and added to a PostgreSQL `tsvector` column.
4.  **Indexing (Semantic):** Text is chunked (500 chars), embedded by SBERT, and indexed in FAISS.
5.  **Retrieval:** A search query passes through both indices, returning relevant documents based on exact matches and conceptual meaning.
