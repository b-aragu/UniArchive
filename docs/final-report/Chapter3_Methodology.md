# Chapter 3: Methodology

## 3.1 System Architecture
UniArchive adopts a modern, decoupled client-server architecture. 
*   **Backend:** Developed in Python using the FastAPI framework, chosen for its asynchronous capabilities and automatic OpenAPI documentation generation. 
*   **Database:** PostgreSQL serves as the primary relational data store, managing user profiles, RBAC, and the academic hierarchy.

## 3.2 Database Design
The database is heavily normalized (3NF) to maintain data integrity. A strict hierarchical chain was established: `Universities -> Faculties -> Departments -> Courses -> Semesters`. Documents are bound to Courses and Document Types (e.g., Exams, Notes), ensuring that searches can be strictly filtered by academic context. 

## 3.3 OCR Methodology
To balance speed and accuracy, a cascading fallback pipeline was designed:
1.  **Digital Extraction (PyMuPDF):** The system first attempts to extract embedded text layers from PDFs. This takes milliseconds and provides 100% accuracy.
2.  **Image Pre-processing (OpenCV):** If the PDF is scanned (image-only), it is converted to images. OpenCV is used to apply grayscale conversion, adaptive thresholding, and noise reduction (blurring).
3.  **Optical Extraction (Tesseract):** The cleaned images are passed to Tesseract OCR to extract the final string.

## 3.4 Search Methodology
The system employs a multi-index approach:
*   **Lexical Search:** PostgreSQL's native `tsvector` and `tsquery` utilize GIN indexing and English language stemming for lightning-fast keyword retrieval.
*   **Semantic Search:** OCR text is chunked into 500-character segments with a 50-character overlap. These chunks are embedded into 384-dimensional vectors using `all-MiniLM-L6-v2` and indexed via FAISS (`IndexFlatIP`) for Inner-Product cosine similarity retrieval.
*   **Hybrid Search:** Utilizing Reciprocal Rank Fusion (RRF), the lexical and semantic result lists are combined. This mathematical technique recalculates scores based on the inverse of their rank position, pushing documents that score highly in *both* keyword and context to the very top.

## 3.5 Duplicate Detection Methodology
To prevent storage redundancy, uploaded documents are fingerprinted. Image-based documents (or the first page of PDFs) are processed via Perceptual Hashing (pHash). A 64-bit hash is generated, and a Hamming distance <= 15 is used to detect visual duplicates. For text-only digital documents, a fallback Jaccard word-level similarity algorithm is applied.
