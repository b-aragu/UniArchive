# Chapter 6: Conclusion

## 6.1 Summary
UniArchive successfully demonstrates that modern machine learning techniques can be practically applied to legacy academic archiving problems. By automating the extraction of text from physical scans and indexing that text via advanced semantic vectors, the system transforms static files into a highly dynamic, discoverable knowledge graph.

## 6.2 Contributions
1.  Designed a highly normalized relational schema optimized for university structures.
2.  Implemented a fault-tolerant, multi-stage OCR pipeline.
3.  Proved the efficacy of combining relational PostgreSQL data with flat FAISS vector indices for semantic retrieval without the need for expensive, dedicated vector databases.
4.  Engineered a production-ready Hybrid Search engine utilizing Reciprocal Rank Fusion (RRF) to merge keyword and semantic results.
5.  Developed a non-blocking Duplicate Detection heuristic using Perceptual Hashing (pHash) and Jaccard text similarity to safeguard repository integrity.

## 6.3 Limitations
*   The current Tesseract OCR model struggles with highly degraded handwritten cursive text.
*   The FAISS index is currently held in memory; scaling to millions of documents would require transitioning to an Approximate Nearest Neighbor (ANN) index or a dedicated vector DB (e.g., pgvector, Pinecone).

## 6.4 Future Work
Future iterations of UniArchive should investigate:
1.  **LLM Integration:** Automatically generating executive summaries or study guides from the extracted OCR text of uploaded documents.
2.  **Distributed Processing:** Moving the OCR extraction out of the main FastAPI thread and into a distributed Celery/Redis task queue to handle massive concurrent uploads gracefully.
3.  **Cloud Deployment Scale-Out:** Migrating the local Docker Compose orchestration to a Kubernetes cluster for enterprise-grade high availability.
