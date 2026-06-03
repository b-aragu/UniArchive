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
*   **Action:** Upload a clearly scanned (but non-selectable) academic document (e.g., an old handwritten/scanned CAT).
*   **Talking Point:** Explain that the backend is currently analyzing the file. Mention the fallback pipeline (OpenCV preprocessing -> Tesseract OCR if digital extraction yields no text).
*   **Action:** Display the successful upload result, pointing out the extracted `ocr_text` and metadata.

## 4. Keyword Search Demonstration (2 mins)
*   **Action:** Navigate to the Search interface. Select the "Keyword" mode.
*   **Action:** Search for an exact phrase found in the newly uploaded document.
*   **Talking Point:** Explain PostgreSQL's Full-Text Search (GIN-indexed `tsvector`), showing how fast lexical queries resolve using stemming.

## 5. Semantic Search Demonstration (3 mins)
*   **Action:** Switch to the "Semantic" mode.
*   **Action:** Search for a conceptual synonym of the topic (e.g., if the document is about "neural networks," search for "machine learning models").
*   **Talking Point:** Explain the SBERT (`all-MiniLM-L6-v2`) and FAISS integration. Show how the engine retrieves the relevant document based on meaning rather than exact keywords.

## 6. Closing & Hybrid Teaser (1 min)
*   **Talking Point:** Summarize how these two search methodologies solve the archival problem. Mention that Phase 8 (Hybrid Search via RRF) will combine both for the ultimate retrieval experience.
*   **Action:** Log out and conclude the demo. Open the floor to questions.
