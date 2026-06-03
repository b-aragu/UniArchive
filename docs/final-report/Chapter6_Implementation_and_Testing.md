# CHAPTER 6 — IMPLEMENTATION AND TESTING

## 6.1 Development Environment
The UniArchive system was developed utilizing the following core technologies:
*   **Python (3.9):** The primary backend programming language.
*   **FastAPI:** Used to construct the asynchronous REST API.
*   **PostgreSQL (16):** Used for relational data storage and Full-Text Search.
*   **React & Vite:** Used to build the frontend Single Page Application (SPA).
*   **FAISS:** Facebook AI Similarity Search, used for high-speed vector retrieval.
*   **Sentence-BERT:** The machine learning model (`all-MiniLM-L6-v2`) used for generating semantic embeddings.
*   **Docker:** Used to containerize the application for consistent deployment.

## 6.2 System Components
### 6.2.1 OCR Service (`ocr_service.py`)
This component utilizes `PyMuPDF` for digital PDF extraction and an `OpenCV` + `pytesseract` pipeline for scanned image fallback.

### 6.2.2 Search Services (`semantic_service.py` & `hybrid_search_service.py`)
These modules load the SBERT model via a Singleton pattern, compute query embeddings, search the FAISS index, execute PostgreSQL `tsvector` queries, and fuse the results using the Reciprocal Rank Fusion algorithm.

### 6.2.3 Duplicate Detection Service (`duplicate_service.py`)
This component utilizes the `imagehash` library to generate Perceptual Hashes (pHash) for image uploads and performs Hamming distance comparisons against the database to flag redundant files.

## 6.3 Test Plan
A comprehensive test plan was executed to validate the system against the functional requirements.

### 6.3.1 OCR Tests
*   **Method:** Uploaded clean digital PDFs and noisy handwritten scans.
*   **Expected Result:** System successfully extracts text regardless of source format.

### 6.3.2 Semantic Search Tests
*   **Method:** Executed queries for conceptual synonyms (e.g., searching "machine learning" when the document contains "artificial intelligence").
*   **Expected Result:** FAISS returns the correct document chunk ID based on cosine similarity.

### 6.3.3 Hybrid Search Tests
*   **Method:** Executed queries containing both specific keywords and broad concepts.
*   **Expected Result:** RRF algorithm mathematically merges the lists and returns the document with the highest combined relevance.

### 6.3.4 Duplicate Detection Tests
*   **Method:** Uploaded the identical `UniArchive_Test_Document.pdf` twice.
*   **Expected Result:** The system flags the second upload with a `duplicate_warning` payload, intercepting the duplication.

### 6.3.5 End-to-End MVP Tests
*   **Method:** An automated Python testing script (`test_e2e_mvp.py`) was developed to simulate a complete user flow: Registration -> Authentication -> Document Upload -> Duplicate Detection -> Search Retrieval.
*   **Expected Result:** The entire pipeline executes without server crashes or HTTP timeouts.
