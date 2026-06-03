# Executive Summary

**Project Title:** UniArchive: Intelligent Academic Document Retrieval System  
**Team:** Final Year Project Team  
**Date:** June 3, 2026  

## The Challenge
Academic institutions generate vast quantities of valuable study materials, including past examination papers, lecture notes, and continuous assessment tests (CATs). However, a significant percentage of these documents are digitized as non-searchable, scanned images. Traditional repositories fail to index the actual content of these files, rendering decades of institutional knowledge effectively invisible to students searching for specific concepts or questions.

## The Solution
UniArchive is a modern, web-based platform designed to eradicate this "dark data" problem. It serves as an intelligent repository that automatically extracts, indexes, and retrieves the hidden textual content of scanned academic materials.

## Technical Innovation
The UniArchive Minimum Viable Product (MVP) achieves this through a multi-stage, AI-driven architecture:

1.  **Fault-Tolerant OCR:** Documents uploaded to the system pass through an adaptive extraction pipeline. Digital PDFs are parsed instantly, while image-based scans are automatically routed through a computer vision enhancement phase (OpenCV) before text is extracted via Optical Character Recognition (Tesseract).
2.  **Semantic Vector Indexing:** Extracted text is fed into a Sentence-BERT Machine Learning model, converting human language into mathematical vectors. These vectors are indexed in a high-speed FAISS database.
3.  **Hybrid Search Retrieval:** When a student queries the system, UniArchive executes two searches simultaneously. A lexical search looks for exact keyword matches (via PostgreSQL Full-Text Search), and a semantic search looks for conceptual meaning (e.g., matching "AI" with "Machine Learning"). The results are mathematically fused using Reciprocal Rank Fusion (RRF), delivering unparalleled accuracy.
4.  **Storage Optimization:** The system actively prevents storage redundancy by utilizing Perceptual Hashing (pHash) to detect and block identical or near-identical image uploads.

## Project Outcomes
The system was successfully deployed in a decoupled Docker environment, featuring a high-performance Python/FastAPI backend and a responsive React frontend. End-to-end testing confirms that the hybrid search engine resolves complex queries in under 100 milliseconds, and the adaptive OCR successfully extracts usable text from heavily degraded scans.

UniArchive demonstrates that integrating advanced machine learning heuristics into traditional academic archives is not only feasible but essential for modern education, providing a scalable blueprint for the future of university knowledge management.
