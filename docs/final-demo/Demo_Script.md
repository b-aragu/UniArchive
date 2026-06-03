# Supervisor Demo Script

**Project:** UniArchive  
**Date:** TBD

---

## 1. Introduction (2 mins)
*   **Greeting:** Welcome the supervisor and present the UniArchive project.
*   **Context:** Explain the core problem (valuable academic materials trapped in non-searchable image-only PDFs/scans) and how UniArchive solves this via OCR and Hybrid Search.

## 2. Admin & Auth (1 min)
*   **Action:** Log into the system as an `Administrator`.
*   **Talking Point:** Highlight the JWT role-based access control protecting the system.
*   **Action:** Briefly show the Admin Dashboard / Users list to demonstrate secure management.

## 3. Upload & OCR Processing (3 mins)
*   **Action:** Navigate to the Upload interface.
*   **Action:** Upload the sample `UniArchive_Test_Document.pdf`.
*   **Talking Point:** Explain that the backend is currently analyzing the file (PyMuPDF or OpenCV/Tesseract). Note the seamless fallback mechanism.
*   **Action:** Display the successful upload result (~0.59s processing time), pointing out the extracted `ocr_text` and metadata.

## 4. Duplicate Detection (2 mins)
*   **Action:** Attempt to upload `UniArchive_Test_Document.pdf` a second time.
*   **Talking Point:** Explain the Phase 9 Duplicate Detection interceptor using `pHash`. 
*   **Action:** Show the system gracefully returning a `duplicate_warning` without crashing the app, proving storage redundancy is prevented.

## 4. Keyword Search Demonstration (2 mins)
*   **Action:** Navigate to the Search interface. Select the "Keyword" mode.
*   **Action:** Search for an exact phrase found in the newly uploaded document.
*   **Talking Point:** Explain PostgreSQL's Full-Text Search (GIN-indexed `tsvector`), showing how fast lexical queries resolve using stemming.

## 5. Semantic Search Demonstration (3 mins)
*   **Action:** Switch to the "Semantic" mode.
*   **Action:** Search for a conceptual synonym of the topic (e.g., if the document is about "neural networks," search for "machine learning models").
*   **Talking Point:** Explain the SBERT (`all-MiniLM-L6-v2`) and FAISS integration. Show how the engine retrieves the relevant document based on meaning rather than exact keywords.

## 6. Hybrid Search (RRF) (2 mins)
*   **Action:** Switch to "Hybrid" mode.
*   **Action:** Execute a query for "reportlab generated pdf" or similar phrasing from the test PDF.
*   **Talking Point:** Explain Reciprocal Rank Fusion (RRF). Show how the system merges the exact precision of keyword search with the conceptual awareness of semantic search for the most accurate ranking (~83ms latency).

## 7. Closing (1 min)
*   **Talking Point:** Summarize how these automated pipelines (OCR, Vector Embeddings, RRF, pHash) solve the archival problem end-to-end.
*   **Action:** Log out and conclude the demo. Open the floor to questions.
