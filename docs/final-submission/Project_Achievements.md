# Project Achievements Summary

**Project:** UniArchive  
**Date:** June 3, 2026  

## 1. Completed Features
*   **Role-Based Access Control (RBAC):** Secured FastAPI endpoints with stateless JWT authentication, enforcing strict permissions for Students, Moderators, and Administrators.
*   **Hierarchical Document Storage:** Built a fully normalized PostgreSQL database structuring documents by University -> Faculty -> Department -> Course -> Semester.
*   **Intelligent OCR Pipeline:** Developed a fallback extraction service capable of extracting text from digital PDFs in milliseconds, while using OpenCV and Tesseract to rescue text from heavily scanned, noisy images.
*   **Keyword Search (FTS):** Implemented PostgreSQL `tsvector` indexing for rapid lexical matching and stemming.
*   **Semantic Search (FAISS):** Integrated the `sentence-transformers` library to generate 384-dimensional embeddings, persisting them to disk and indexing them in FAISS for conceptual searches.
*   **Hybrid Search (RRF):** Engineered a custom Reciprocal Rank Fusion algorithm to merge Keyword and Semantic results, yielding highly accurate top-tier retrievals.
*   **Duplicate Detection:** Integrated `imagehash` (pHash) to detect identical structural image patterns, intercepting redundant uploads at the API level.
*   **Frontend Dashboard:** Deployed a responsive React/Vite SPA allowing end-users to upload files, review metadata, and execute complex searches smoothly.

## 2. Technical Contributions
*   **Dual-Database Hybrid:** Successfully bridged a relational SQL database (PostgreSQL) with a flat vector index (FAISS) without relying on expensive, heavy proprietary vector databases.
*   **Algorithm Fusion:** Proved the mathematical efficacy of Reciprocal Rank Fusion in combining scores of vastly different magnitudes (Cosine Similarity vs TF-IDF variants).
*   **Docker Containerization:** Fully containerized the complex backend (which relies on system-level dependencies like `libgl1` and `tesseract-ocr`) alongside the database and frontend for one-click staging deployments.

## 3. Challenges Overcome
*   **Python 3.9 Compatibility Constraints:** The initial Sentence-BERT models utilized type hinting features exclusive to Python 3.10+. This was resolved by backporting types via `from __future__ import annotations` and using `eval_type_backport`, avoiding a full host-system OS upgrade.
*   **Passlib / Bcrypt Incompatibility:** Discovered and repaired a known issue where `passlib` threw wrapping errors on newer `bcrypt` versions, resolving it by strictly pinning `bcrypt==4.0.1` in the build environment.
*   **Tesseract Noise Sensitivity:** Initial OCR tests on handwritten notes returned garbled symbols. This was overcome by writing a custom OpenCV preprocessing pipeline to dynamically apply Gaussian blurs and adaptive thresholding to the images before OCR.

## 4. Lessons Learned
*   **Machine Learning in Production:** Loading ML models (like SBERT) per request causes massive API timeouts. Utilizing a Singleton design pattern to load the model into memory at application startup is mandatory for REST APIs.
*   **The Value of Decoupling:** Building the backend and frontend separately allowed the team to completely rebuild the OCR logic without ever breaking the UI or altering a single React component.
*   **Testing at Scale:** Automated E2E testing using FastAPI's `TestClient` is invaluable. It caught integration regressions early, specifically when migrating from pure keyword search to the hybrid RRF model.
