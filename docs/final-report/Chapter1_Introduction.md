# CHAPTER 1 — INTRODUCTION

## 1.1 Background of Study
University students heavily depend on academic materials such as past examination papers, Continuous Assessment Tests (CATs), assignments, and lecture notes for effective exam preparation. While university libraries physically archive these materials, access remains restricted by geographic location, limited operating hours, and manual cataloguing systems. In practice, students resort to informal digital sharing methods—taking photographs of library materials, uploading them to personal cloud storage, and distributing links through messaging platforms such as WhatsApp and Telegram.

These methods create fragmented, unsearchable, and often inaccessible resource pools. Scanned documents and photographs lack extractable text, rendering them unsearchable by content. Students waste significant study time locating materials across disconnected personal drives and group chats rather than engaging in actual revision. Furthermore, informal sharing lacks consistent academic categorization (course, year, document type) and fails to support concept-based discovery when students use terminology different from document titles.

Recent advances in Artificial Intelligence (AI) offer powerful solutions for academic document processing. Systems such as DeepTutor (HKUDS, 2025) demonstrate the viability of Retrieval-Augmented Generation (RAG) architectures for knowledge management, utilizing document parsing, embedding-based retrieval, and multi-agent reasoning to enable question-answering over large document collections. However, such systems target interactive tutoring use cases requiring substantial computational infrastructure, complex Large Language Model (LLM) orchestration, and significant API costs.

There exists a need for a lightweight, focused academic document retrieval system that applies proven Information Retrieval (IR) and Computer Vision (CV) techniques without the computational overhead of generative AI. By combining Optical Character Recognition (OCR) for text extraction, semantic embeddings for concept-based search, and traditional inverted indexes for keyword retrieval, such a system can transform unstructured document collections into organized, searchable academic knowledge bases suitable for resource-constrained university environments.

This project proposes UNI ARCHIVE, an intelligent academic document retrieval system that centralizes university academic resources and enhances discoverability through hybrid search capabilities. The system occupies a distinct niche from comprehensive tutoring platforms: it focuses specifically on resource discovery, organization, and retrieval, prioritizing deterministic algorithms and measurable performance over generative AI capabilities.

## 1.2 Problem Statement
Despite the availability of academic materials in university libraries, students face systematic barriers to effective resource access:

**Geographic and Temporal Barriers**: Library access requires physical presence during limited hours, disadvantaging off-campus, part-time, and distance learning students who constitute a significant portion of the student population at Multimedia University of Kenya.

**Fragmented Distribution**: Academic materials exist across disconnected personal drives, informal WhatsApp groups, and email threads. No centralized repository maintains authoritative versions of past examination papers and continuous assessment materials.

**Unsearchable Content**: A substantial portion of shared materials comprises scanned documents and photographs lacking machine-readable text layers. Students cannot search within these documents for specific topics, questions, or concepts.

**Weak Metadata and Organization**: Informally shared materials lack consistent academic categorization. Students cannot filter resources by course code, academic year, document type, or department without manual inspection of each file.

**Vocabulary Mismatch in Search**: Traditional keyword search fails when students employ different terminology than appears in document titles. For example, a student searching for "loop invariants" may miss relevant materials titled "iteration proofs" or "program correctness."

**Redundant Storage**: Multiple copies of identical documents circulate across different storage platforms, wasting storage capacity and creating confusion regarding which version is authoritative.

Existing general-purpose platforms such as Google Drive and Dropbox lack domain-specific understanding of academic structures. While recent systems like DeepTutor demonstrate sophisticated document understanding, they target interactive tutoring scenarios requiring complex LLM orchestration unsuitable for deployment in resource-constrained environments.

Therefore, there is a critical need for an intelligent academic document retrieval system that combines OCR-powered text extraction, hybrid search (lexical and semantic), academic metadata structures, and duplicate detection in a lightweight, deployable platform. Such a system would reduce manual effort in resource location, improve discoverability through concept-based retrieval, and establish a centralized, authoritative repository of academic materials.

## 1.3 Aim of the Study
The general objective of this project is to develop an intelligent academic document retrieval system that combines OCR and semantic search techniques to improve accessibility, organization, and discoverability of university academic resources.

### 1.3.1 Research Objectives
1. **Centralized Resource Management**: To develop a secure web-based platform for uploading, storing, and organizing academic materials with hierarchical academic metadata (University → Faculty → Department → Course → Academic Year → Document Type).
2. **Intelligent Text Extraction**: To implement OCR using Computer Vision techniques to convert scanned images and PDFs into machine-readable, searchable text, with preprocessing for deskewing, denoising, and contrast enhancement.
3. **Hybrid Search System**: To implement a dual-mode search architecture combining PostgreSQL full-text search with inverted indexes (BM25 ranking) and Semantic search using Sentence-BERT embeddings and FAISS vector similarity.
4. **Duplicate Detection**: To incorporate perceptual hashing (pHash) to detect and prevent redundant storage of identical or near-identical documents.
5. **RAG-Inspired Retrieval Pipeline**: To adapt Retrieval-Augmented Generation architectural patterns optimized for resource-constrained environments by replacing LLM components with deterministic search and ranking algorithms.
6. **Performance Evaluation**: To quantitatively measure system effectiveness using metrics such as Character Error Rate (CER), Word Error Rate (WER), Normalized Discounted Cumulative Gain (nDCG@10), and Mean Reciprocal Rank (MRR).

## 1.4 Significance / Justification
By unlocking the text hidden within scanned documents, UniArchive drastically improves the efficiency of academic research and revision. It democratizes access to institutional knowledge, ensuring that all students, regardless of when a document was created or how it was scanned, can easily find the exact concept or past question they are looking for. Furthermore, automating metadata extraction saves administrative time and reduces storage costs by blocking duplicate files.

## 1.5 Scope
The scope of this project encompasses the development of a web-based intelligent academic document retrieval system with the following capabilities:

**Core Functionality**:
- Multi-format document upload (PDF, PNG, JPG) with maximum file size constraints
- OCR processing for both text-based and scanned documents using the Tesseract engine
- Hierarchical academic metadata tagging and filtering
- Hybrid search interface supporting keyword, semantic, and filtered queries
- Duplicate detection using perceptual hashing
- Role-based access control (Student, Moderator, Administrator)

**Document Types**:
- Past examination papers, Continuous Assessment Tests (CATs), Assignment briefs and solutions, Lecture notes and supplementary materials.

**Technical Boundaries**:
- Web-based application optimized for desktop browsers, self-hosted deployment on standard hardware (no GPU requirements), English-language document support only, PostgreSQL relational database with FAISS vector index integration.

## 1.6 Assumptions
*   It is assumed that the primary users (students and faculty) have basic digital literacy to navigate a web-based dashboard.
*   It is assumed that the server hosting the application has sufficient memory to hold the FAISS vector index and run the Sentence-BERT models efficiently.
*   Scanned documents uploaded to the system are in English and reasonably legible for OCR processing.

## 1.7 Limitations
The project is subject to the following limitations:
*   **OCR Accuracy Constraints**: Extraction accuracy is dependent on document quality. Poorly scanned, low-resolution, or degraded documents may produce suboptimal text recognition, necessitating manual review for critical materials.
*   **Computational Resource Requirements**: While designed for lightweight deployment, processing large documents using OCR and embedding generation requires adequate CPU and memory resources.
*   **Language Limitations**: The initial implementation focuses exclusively on English-language documents. Academic materials containing significant code, mathematical notation, or mixed languages may experience reduced recognition accuracy.
*   **Copyright and Fair Use**: The system relies on user-uploaded content. Copyright compliance depends on user adherence to fair use policies.
*   **Platform Constraints**: The web interface is optimized for desktop browsers. Mobile device compatibility is not guaranteed in the initial release.
*   **Time Constraints**: Due to academic calendar limitations, only core features are fully implemented. Advanced features such as query expansion remain future work.
