# CHAPTER 3 — METHODOLOGY

## 3.1 Introduction
This chapter outlines the methodological approach adopted for the development of UniArchive. It describes the software development lifecycle, the justification for this choice, the data collection methods used to gather system requirements, and the description of the datasets used to train and test the system.

## 3.2 Methodology

### 3.2.1 Methodology Description
The project was developed using the Agile Software Development methodology, specifically adopting a Scrum-based iterative approach. The development lifecycle was divided into distinct phases (Sprints), ranging from architecture foundation and database design to complex integrations like Semantic Search and Duplicate Detection. Each phase resulted in a testable MVP module before proceeding to the next.

### 3.2.2 Methodology Justification
Agile was chosen over traditional methodologies (like Waterfall) due to the experimental nature of integrating Machine Learning components (OCR and Sentence-BERT) into a traditional web application. Agile allowed the team to build a working prototype of the OCR pipeline early, test its latency, and pivot the architecture (e.g., adding OpenCV preprocessing for noisy images) without derailing the entire project timeline.

## 3.3 Data Collection Methods and Tools
To accurately design the system requirements, the following data collection methods were utilized:
1.  **Document Analysis:** Existing university repositories and past paper archiving methods were analyzed to understand current metadata structures (Faculties, Courses, Semesters).
2.  **Prototyping & Benchmarking:** Technical data regarding the latency and accuracy of different search algorithms (PostgreSQL FTS vs FAISS) was collected through isolated benchmark scripts before integrating them into the main application.
3.  **Literature Review:** Academic papers on Reciprocal Rank Fusion (RRF) and Perceptual Hashing (pHash) were studied to determine optimal thresholds (e.g., a Hamming distance of 15 for pHash).

## 3.4 Dataset Description
The system was developed and evaluated using a custom dataset reflecting real-world academic materials:
*   **Digital PDFs:** Clean, digitally generated lecture notes and assignment briefs (used to test PyMuPDF extraction speed).
*   **Scanned PDFs & Images:** Low-quality scans of handwritten continuous assessment tests (CATs) and exam papers (used to calibrate the OpenCV noise reduction and Tesseract OCR fallback).
*   **Test Queries:** A predefined set of search queries (both exact keywords and conceptual synonyms) was created to evaluate the Hybrid Search Engine's precision and recall capabilities.
