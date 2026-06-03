# Phase 7: Semantic Search Verification Report

**Project:** UniArchive  
**Author:** Final Year Project Team  
**Date:** June 3, 2026  

## 1. Objective
To verify the fully integrated Semantic Search pipeline in Phase 7, including Sentence-BERT (SBERT) model execution on CPU, FAISS index creation, vector insertion, and query matching functionality.

## 2. Environment Setup
*   **PyTorch**: Installed `torch==2.8.0+cpu` to successfully bypass CUDA requirements and drastically reduce memory footprint.
*   **FAISS**: Installed `faiss-cpu==1.8.0`.
*   **NumPy**: Downgraded to `numpy==1.26.4` to fix `ImportError: numpy.core.multiarray failed to import` caused by NumPy 2.x incompatibilities with older ML libraries.
*   **Model**: Successfully loaded and cached HuggingFace `all-MiniLM-L6-v2` locally.

## 3. Test Methodology
1.  **Document Seeding**: Inserted 6 lightweight test documents directly into PostgreSQL covering various computer science topics (Database Systems, Artificial Intelligence, Computer Networks, Linear Algebra, Operating Systems, Software Engineering).
2.  **Vector Backfill**: Executed `scripts/backfill_embeddings.py` which:
    *   Fetched the 6 documents.
    *   Chunked their `ocr_text` using a 500-character size and 50-character overlap.
    *   Generated 384-dimensional embeddings using SBERT.
    *   Saved vectors to `app/data/faiss_index.bin` using a FAISS `IndexIDMap`.
    *   Saved metadata back to the PostgreSQL `embeddings` table with the corresponding `faiss_id`.
3.  **Search Validation**: Executed queries against the `search_semantic()` service function to verify vector mapping and cosine similarity (Inner Product) logic.

## 4. Query Results

| Query | Top Result Document | Score | Relevance |
| :--- | :--- | :--- | :--- |
| **"neural networks and machine learning"** | Artificial Intelligence Assignment | 0.8117 | ✅ Highly Relevant |
| **"relational database normalization"** | Database Systems Notes | 0.6698 | ✅ Highly Relevant |
| **"packet routing and network layers"** | Computer Networks Exam | 0.7711 | ✅ Highly Relevant |
| **"matrix operations"** | Linear Algebra Tutorial | 0.6186 | ✅ Highly Relevant |
| **"process scheduling"** | Operating Systems CAT | 0.7001 | ✅ Highly Relevant |
| **"software development lifecycle"** | Software Engineering Notes | 0.7235 | ✅ Highly Relevant |

## 5. Conclusion
**PASSED.** The Semantic Search pipeline correctly encodes document chunks, persists them in FAISS, links them via integer `faiss_id`s, and successfully retrieves highly relevant snippets based on semantic meaning. 

The dependency blockers regarding GPU/CUDA and NumPy compatibility are completely resolved. The backend is now ready for Phase 8 Hybrid Search logic.
