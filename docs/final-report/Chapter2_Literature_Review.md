# CHAPTER 2 — LITERATURE REVIEW

## 2.1 Introduction
This chapter provides a critical review of existing systems, technologies, and research relevant to the development of an intelligent academic document retrieval system. It examines current tools used for academic resource management, analyzes recent advances in AI-powered learning systems, highlights limitations of existing approaches, and identifies research gaps that justify the development of UNI ARCHIVE. The chapter discusses relevant technologies including Information Retrieval (IR), Computer Vision (CV), Natural Language Processing (NLP), Optical Character Recognition (OCR), and Retrieval-Augmented Generation (RAG) architectures.

## 2.2 Related Systems

### 2.2.1 Google Drive
Google Drive is a widely adopted cloud storage service enabling users to store, synchronize, and share files across devices. Key features include universal file storage, basic keyword search across file names and document content, proprietary OCR on uploaded images and PDFs, and role-based sharing permissions.

### 2.2.2 University Library Digital Repositories
Institutional repositories such as those built on DSpace, Fedora, or Greenstone provide structured archiving for academic publications and theses. Typical features include Dublin Core metadata standards for academic works, persistent identifiers (DOIs, handles), full-text indexing for digitized materials, and administrative interfaces for cataloguing and curation.

### 2.2.3 DeepTutor: AI-Powered Learning Assistant
DeepTutor (HKUDS, 2025) represents a recent advance in AI-powered academic document processing. The system implements a comprehensive learning assistant with a Multi-Agent RAG Architecture for step-by-step problem solving, a document parsing pipeline (Docling, OCR), embedding-based retrieval, interactive visualization, and practice exercise generation. It employs a microservices architecture with separate components for document ingestion, vector storage, LLM orchestration, and session management.

### 2.2.4 General Tools and University Context
At Multimedia University of Kenya, students currently rely on informal mechanisms for academic resource sharing, such as WhatsApp Groups, email distribution, personal USB drives, and social media platforms.

## 2.3 Limitations of Existing Systems
Despite their ubiquity, existing academic repository systems present several critical limitations relative to this project:

1. **Google Drive**: Lacks hierarchical metadata schemas for academic organization (Department, Course, Academic Year). Extracted OCR text is not exposed for custom search interfaces, search relies on simple keyword matching without semantic understanding, and there is no duplicate detection.
2. **University Repositories**: Typically focus on faculty research outputs and theses rather than teaching materials. They suffer from manual cataloguing overhead, limited OCR integration for scanned documents, reliance on traditional IR (Boolean/keyword search), and strict access restrictions.
3. **DeepTutor**: Requires substantial infrastructure including GPU resources for embedding generation and LLM inference. Core functionality relies on Generative AI, introducing non-determinism and hallucination risks. Its complex multi-service architecture creates maintenance challenges unsuitable for resource-constrained environments.
4. **Informal Sharing**: Characterized by a complete absence of centralized organization, unsearchable content (especially scanned materials), no metadata standards, redundant storage, and access limited by social network membership.

## 2.4 How UniArchive Addresses These Limitations (Identified Research Gap)
Analysis of existing systems reveals critical gaps in academic resource management:
1. **No Lightweight RAG Implementation**: Existing systems like DeepTutor demonstrate RAG architectures but require complex LLM orchestration. No system adapts RAG retrieval patterns for deterministic, resource-constrained deployment.
2. **Absence of Academic-Specific IR**: General platforms lack hierarchical metadata schemas and academic categorization workflows tailored to university resource discovery.
3. **OCR-Search Integration Gap**: While OCR is widely available, integration with academic search interfaces featuring hybrid (lexical + semantic) retrieval remains uncommon.
4. **No Self-Hosted Semantic Search**: Commercial solutions rely on external APIs. Open-source, self-hosted semantic search for academic documents is underrepresented.

UNI ARCHIVE addresses these gaps by implementing a RAG-inspired retrieval pipeline optimized for lightweight deployment, combining Tesseract OCR, Sentence-BERT embeddings, PostgreSQL full-text search, and FAISS vector similarity in a unified academic document management platform. Instead of relying on MD5 hashes, UniArchive uses Perceptual Hashing (pHash) to detect structural visual similarities, blocking duplicate uploads even if the image compression or resolution differs slightly.

### Review of Related Technologies utilized by UniArchive:
*   **Information Retrieval (IR)**: Inverted Indexes (PostgreSQL GIN) and Ranking Algorithms (BM25).
*   **Natural Language Processing (NLP)**: Sentence Embeddings (Sentence-BERT) and Vector Similarity Search (FAISS).
*   **Computer Vision and OCR**: Tesseract OCR for text recognition, OpenCV for document preprocessing (deskewing, denoising, binarization), and Perceptual Hashing (pHash) for duplicate detection.
*   **Database Systems**: Relational Databases (PostgreSQL) and Vector Databases (FAISS).
