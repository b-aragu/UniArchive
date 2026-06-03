# UniArchive Final Presentation Outline

### Slide 1: Title
*   **Content:** UniArchive: Intelligent Academic Document Retrieval System.
*   **Visuals:** Clean logo, presenter names, and date.

### Slide 2: Problem
*   **Content:** The hidden knowledge problem. Thousands of PDFs and handwritten CATs are archived but remain unsearchable because they are images, not text. Manual tagging is insufficient.

### Slide 3: Objectives
*   **Content:** 
    *   Automate text extraction from any document type.
    *   Implement both keyword and conceptual search capabilities.
    *   Ensure strict academic hierarchical organization (Course -> Semester -> Document).

### Slide 4: Literature Review
*   **Content:** Traditional libraries rely on Dublin Core metadata. We analyzed Tesseract OCR for text extraction and Facebook AI Similarity Search (FAISS) for handling dense vector embeddings, spotting an opportunity to combine them for academic use.

### Slide 5: System Architecture
*   **Content:** Decoupled modern stack.
*   **Visuals:** Diagram showing FastAPI Backend, PostgreSQL database, React Frontend, and the ML processing pipelines acting as middleware.

### Slide 6: Database Design
*   **Content:** 3rd Normal Form. Highlighting the hierarchy tables and the bridge to the FAISS index via the `faiss_id` auto-incrementing integer.

### Slide 7: OCR Pipeline
*   **Content:** The cascading fallback method: PyMuPDF (Digital) -> OpenCV Preprocessing -> Tesseract (Optical). Ensuring 100% data extraction attempts.

### Slide 8: Semantic Search
*   **Content:** Why keyword isn't enough (vocabulary mismatch). Explaining sliding window chunking and SBERT embeddings (`all-MiniLM-L6-v2`) mapped to 384 dimensions.

### Slide 9: Implementation Progress
*   **Content:** Current status (58%). Highlighting that all core backend APIs, databases, and ML pipelines are complete and validated.

### Slide 10: Results
*   **Content:** 
    *   OCR Success Rate: 100% on varied dataset.
    *   FAISS retrieval latency: < 20ms.

### Slide 11: Challenges
*   **Content:** Overcoming FAISS's inability to natively handle UUIDs (solved via PostgreSQL Identity mapping). Handling poor-quality handwritten scans.

### Slide 12: Future Work
*   **Content:** Implementing Phase 8 Hybrid Search (RRF), deploying to the cloud, and adding LLM summarization.

### Slide 13: Demo
*   **Content:** "Live System Demonstration."
*   **Visuals:** Switch to browser. Follow the planned demo script (Upload -> Keyword Search -> Semantic Search).

### Slide 14: Conclusion
*   **Content:** UniArchive proves that legacy, unstructured data can be modernized efficiently, democratizing access to institutional knowledge.

### Slide 15: Questions
*   **Content:** Q&A session. Thank you.
