# Chapter 5: Testing and Results

## 5.1 OCR Testing
A curated dataset of digital PDFs, clean scanned PDFs, and noisy/skewed handwritten images was compiled.
*   **Digital PDFs:** Achieved 100% accuracy with an average processing time of < 10ms per page.
*   **Scanned Images:** The OpenCV + Tesseract fallback successfully engaged 100% of the time, extracting readable text strings with varying confidence levels (~45% - 85% depending on handwriting quality), taking an average of 1.2 seconds per page.

## 5.2 Search Testing
*   **Keyword FTS:** Successfully retrieved exact matches instantly (avg 20.9ms). Demonstrated robust stemming (e.g., searching "compute" matched documents containing "computing").
*   **Semantic FAISS:** Effectively clustered conceptual synonyms (avg 65.2ms). Queries for "artificial intelligence" successfully returned documents explicitly lacking that phrase but containing "machine learning" and "neural networks". 
*   **Hybrid Search (RRF):** Fused both methods successfully (avg 83.4ms latency), overriding individual scores with a balanced reciprocal rank, delivering the most contextually relevant top-3 results across all tested queries.

## 5.3 Duplicate Detection Testing
*   **Perceptual Hashing (pHash):** 100% success rate in trapping identical image and PDF (first-page) re-uploads, utilizing a maximum Hamming distance of 15. The detection correctly bypassed standard OCR and aborted redundant storage while notifying the user securely.

## 5.4 Performance Testing & System E2E Validation
The complete MVP system was validated using an automated E2E script mimicking a live user session.
*   **Upload Pipeline Latency:** ~0.59s average for a single-page digital PDF, encompassing PyMuPDF parsing, metadata generation, PostgreSQL commit, FAISS inference, and pHash duplicate scanning.
*   **Search Latency:** Hybrid queries consistently resolved under 100ms.
*   **Upload Bottleneck:** The primary bottleneck identified was the Tesseract OCR processing time for large, multi-page scanned PDFs. A background queuing mechanism is recommended for production scale.
*   **Environment Stability:** The decoupled Docker architecture successfully ran PostgreSQL 16, the FastAPI layer, and the React frontend without deadlocks or unexpected thread terminations.
