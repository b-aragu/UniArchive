# UniArchive: Supervisor Presentation & Demo (10–15 Minutes)

## Slide 1: Title Slide
*   **Title:** UniArchive: Intelligent Academic Document Retrieval System
*   **Subtitle:** Unlocking Institutional Knowledge with OCR and Hybrid Search
*   **Presenter:** Final Year Project Team
*   **Speaker Notes:** "Good morning/afternoon. Today we are presenting UniArchive, a system designed to solve the critical problem of 'dark data' in academic institutions—specifically, valuable past papers and notes trapped in non-searchable, scanned PDFs."

## Slide 2: The Problem
*   **Visual:** A flowchart showing "Scanned PDF -> Invisible Content -> Lost Knowledge" vs "Digital Text -> Searchable -> Accessible".
*   **Bullets:**
    *   Vast amounts of academic materials are scanned images.
    *   Traditional repositories rely entirely on manual metadata (e.g., file names).
    *   Students waste hours trying to find specific concepts or past questions.
*   **Speaker Notes:** "When a lecturer uploads a scanned handwritten CAT, the repository only knows its title. If a student searches for 'dynamic programming' and it's inside that scan, they will never find it. The knowledge is effectively invisible."

## Slide 3: The Solution (UniArchive)
*   **Visual:** High-level architecture diagram.
*   **Bullets:**
    *   Automated Optical Character Recognition (OCR).
    *   Deep Semantic Vector Indexing (AI-driven).
    *   Reciprocal Rank Fusion (Hybrid Search).
*   **Speaker Notes:** "UniArchive intercepts the upload process. It reads the document, understands the text—even from images—and indexes it both lexically and semantically. It turns static files into a discoverable knowledge graph."

## Slide 4: System Architecture
*   **Visual:** Architecture stack (PostgreSQL, FastAPI, React, Tesseract, FAISS).
*   **Bullets:**
    *   **Backend:** Python 3.9 + FastAPI (Asynchronous).
    *   **Database:** PostgreSQL 16 (Relational + FTS).
    *   **Vector Engine:** In-memory FAISS (Facebook AI Similarity Search).
    *   **Frontend:** React 18 + Vite (Responsive SPA).
*   **Speaker Notes:** "We built a decoupled, modern stack. The heavy lifting is done by FastAPI and PostgreSQL, while FAISS manages our complex semantic vectors in-memory for microsecond retrieval."

## Slide 5: The Intelligent OCR Pipeline
*   **Visual:** Diagram showing `Upload -> Is Digital? -> PyMuPDF (Fast) -> ELSE -> OpenCV (Enhance) -> Tesseract (Extract)`.
*   **Bullets:**
    *   Detects digital vs. scanned PDFs dynamically.
    *   Uses OpenCV for grayscale, thresholding, and noise removal.
    *   Extracts text using Tesseract OCR.
*   **Speaker Notes:** "Our OCR is fault-tolerant. It attempts fast digital extraction first. If the document is just an image, it runs it through a computer vision pipeline to enhance contrast before passing it to Tesseract. This guarantees we get text, no matter the source."

## Slide 6: Multi-Mode Search & Duplicate Detection
*   **Visual:** Side-by-side comparison of Keyword vs Semantic vs Hybrid.
*   **Bullets:**
    *   **Keyword (FTS):** Exact matches and stemming (e.g., compute -> computing).
    *   **Semantic (FAISS):** Conceptual matches (e.g., AI -> Machine Learning).
    *   **Hybrid (RRF):** Fusing both for maximum relevance.
    *   **Duplicate Detection:** pHash blocking identical file uploads.
*   **Speaker Notes:** "We don't just search for words. Using Sentence-BERT, we search for meaning. And to ensure the repository remains clean, we use perceptual hashing to block redundant uploads instantly."

## Slide 7: Live Demonstration (The Core Workflow)
*   *Transition to the live MVP application.*
*   **Speaker Notes:** "We will now demonstrate the system live. We'll log in as an administrator, upload a scanned document, and show how quickly it can be retrieved using a semantic query."
*   *(Follow the steps in `Demo_Script.md`)*

## Slide 8: Performance Results & Conclusion
*   **Visual:** A small table showing latency (~0.59s upload pipeline, ~83ms Hybrid Search).
*   **Bullets:**
    *   System scales effectively for typical academic loads.
    *   Successfully transforms "dark data" into searchable assets.
    *   MVP is 100% complete and deployed via Docker.
*   **Speaker Notes:** "In conclusion, UniArchive proves that integrating machine learning into traditional repositories is not only possible but highly performant. Thank you. We are happy to take any questions."

---

## Expected Questions & Suggested Answers

**Q: Why didn't you use a dedicated vector database like Pinecone or pgvector?**  
**A:** "For the MVP scale, an in-memory FAISS index provides sub-millisecond retrieval without the infrastructural overhead of a dedicated vector database. If this were to scale to millions of documents, migrating to `pgvector` within our existing PostgreSQL instance would be the logical next step."

**Q: How does the system handle really bad handwriting in scanned documents?**  
**A:** "Tesseract has limitations with cursive or heavily degraded text. We mitigate this using OpenCV preprocessing (adaptive thresholding and noise removal). However, even partial extraction is enough for the FAISS semantic engine to grasp the document's general context."

**Q: What is Reciprocal Rank Fusion (RRF)?**  
**A:** "RRF is an algorithm that combines the sorted ranks of multiple search methods. Instead of dealing with incompatible arbitrary scores (like TF-IDF vs Cosine Similarity), it simply looks at the rank positions (1st, 2nd, 3rd) and calculates a new unified score, pushing documents that do well in *both* lists to the top."
