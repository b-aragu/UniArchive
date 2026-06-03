# Chapter 5: Testing and Results

## 5.1 OCR Testing
A curated dataset of digital PDFs, clean scanned PDFs, and noisy/skewed handwritten images was compiled.
*   **Digital PDFs:** Achieved 100% accuracy with an average processing time of < 10ms per page.
*   **Scanned Images:** The OpenCV + Tesseract fallback successfully engaged 100% of the time, extracting readable text strings with varying confidence levels (~45% - 85% depending on handwriting quality), taking an average of 1.2 seconds per page.

## 5.2 Search Testing
*   **Keyword FTS:** Successfully retrieved exact matches instantly. Demonstrated robust stemming (e.g., searching "compute" matched documents containing "computing").
*   **Semantic FAISS:** Effectively clustered conceptual synonyms. Queries for "artificial intelligence" successfully returned documents explicitly lacking that phrase but containing "machine learning" and "neural networks". 

## 5.3 Performance Testing
*   **Upload Bottleneck:** The primary bottleneck identified was the Tesseract OCR processing time for large, multi-page scanned PDFs. 
*   **Search Latency:** FAISS vector retrieval proved incredibly efficient, returning nearest neighbors in under 20ms, proving the viability of the in-memory index approach.
