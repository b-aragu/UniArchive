# Chapter 2: Literature Review

## 2.1 Existing Academic Archival Systems
Current academic archival systems, such as DSpace and EPrints, are heavily reliant on Dublin Core metadata. While excellent for librarians, these systems require meticulous manual data entry. If a user searches for a specific concept mentioned on page 42 of a scanned PDF, these traditional systems fail entirely unless that exact keyword was manually added as a tag.

## 2.2 Optical Character Recognition (OCR) Systems
The evolution of OCR has moved from simple template matching to complex neural network architectures. Tesseract, originally developed by HP and now maintained by Google, remains the open-source standard for text extraction. However, literature shows that Tesseract's accuracy drops significantly with noisy, skewed, or low-contrast academic scans. Recent studies highlight the necessity of robust pre-processing pipelines (using libraries like OpenCV) to normalize images before passing them to the OCR engine.

## 2.3 Semantic Search and Vector Embeddings
Traditional keyword search (BM25, TF-IDF) suffers from the "vocabulary mismatch problem." A student searching for "AI" will not find a document that exclusively uses the phrase "Artificial Intelligence." The advent of Transformer models, specifically Sentence-BERT (SBERT), allows sentences to be mapped into dense vector spaces where semantically similar phrases are mathematically close. Facebook AI Similarity Search (FAISS) has emerged as the premier library for indexing and querying these dense vectors at scale.

## 2.4 Research Gap
While OCR and Semantic Search are established technologies in enterprise environments, there is a distinct lack of open-source, easily deployable solutions tailored specifically to the hierarchical structure of university curricula (Faculty -> Department -> Course). UniArchive fills this gap by coupling these advanced ML techniques directly with a rigid, course-centric relational database, creating a unified hybrid search engine designed explicitly for academic contexts.
