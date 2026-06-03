# CHAPTER 7 — RESULTS AND CONCLUSION

## 7.1 Achievements

### 7.1.1 OCR Results
The adaptive OCR pipeline successfully handled all tested document types. Digital PDFs achieved 100% accuracy with extraction times under 10ms per page. For scanned images, the OpenCV + Tesseract fallback engaged flawlessly, taking an average of 1.2 seconds per page and extracting sufficient textual context for semantic indexing, despite minor character degradation on highly cursive handwriting.

### 7.1.2 Semantic Search Results
Semantic searches effectively clustered conceptual synonyms, resolving queries in an average of 65.2 milliseconds. The `all-MiniLM-L6-v2` model running on CPU proved highly capable of understanding intent beyond exact keyword matches.

### 7.1.3 Hybrid Search Results
The implementation of Reciprocal Rank Fusion (RRF) was a complete success. The hybrid endpoint accurately fused PostgreSQL FTS and FAISS vector results, delivering the most contextually relevant documents across all tested queries with an average latency of 83.4 milliseconds.

### 7.1.4 Duplicate Detection Results
The `pHash` algorithm achieved a 100% success rate in trapping identical image and PDF re-uploads using a maximum Hamming distance threshold of 15. The total end-to-end upload latency (including OCR, vector embedding, and pHash scanning) averaged ~0.59 seconds for standard test documents.

## 7.2 Lessons Learnt
*   **Machine Learning in REST APIs:** Loading ML models like SBERT per request is architecturally flawed and causes severe latency. Utilizing a Singleton design pattern to persist the model in memory at application startup is mandatory for performance.
*   **Algorithm Fusion:** Reciprocal Rank Fusion is a highly elegant mathematical solution for combining scores of vastly different magnitudes (e.g., Cosine Similarity vs. TF-IDF).
*   **Dependency Management:** Decoupling the architecture via Docker was critical in managing the complex C++ binaries required by OpenCV and Tesseract across different host operating systems.

## 7.3 Conclusions
UniArchive successfully demonstrates that modern machine learning techniques can be practically applied to legacy academic archiving problems. By automating the extraction of text from physical scans, indexing that text via advanced semantic vectors, and fusing the results with robust keyword retrieval, the system transforms static, invisible files into a highly dynamic and discoverable knowledge graph. The system meets all functional and non-functional requirements set out at the beginning of the study.

## 7.4 Recommendations for Future Work
Future iterations of the UniArchive platform should investigate the following:
1.  **Distributed Processing:** Moving the CPU-bound OCR and Embedding generation out of the main FastAPI thread and into a distributed task queue (e.g., Celery with Redis) to handle massive concurrent uploads more gracefully.
2.  **LLM Integration:** Utilizing Large Language Models (LLMs) to automatically generate executive summaries, flashcards, or study guides from the extracted OCR text of uploaded documents.
3.  **Cloud Deployment Scale-Out:** Migrating the local Docker Compose orchestration to a Kubernetes cluster to ensure enterprise-grade high availability during peak university exam seasons.
