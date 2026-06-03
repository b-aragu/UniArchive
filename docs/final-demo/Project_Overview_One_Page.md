# UniArchive Project Overview

## Executive Summary
UniArchive is an intelligent academic document retrieval system designed to digitize, index, and organize university materials. By leveraging Optical Character Recognition (OCR) and Machine Learning-based Semantic Search, UniArchive transforms non-searchable images and scanned PDFs into a highly discoverable, centralized knowledge base for students and faculty.

## Objectives
1.  Develop an automated OCR pipeline capable of extracting text from low-quality academic scans.
2.  Implement a hybrid search engine combining exact keyword matching (PostgreSQL FTS) with contextual meaning retrieval (SBERT + FAISS).
3.  Build a secure, role-based architecture to manage the upload, review, and distribution of academic documents.
4.  Provide a scalable, modern React interface for seamless user interaction.

## Current Progress (58%)
The backend infrastructure is solidly in place. The PostgreSQL database is fully normalized, the FastAPI backend secures routes with JWTs, and the core processing engines (OCR and Semantic Search) have been implemented and verified with a 100% processing success rate on test data.

## MVP Scope
The Minimum Viable Product (MVP) focuses strictly on:
*   Document uploading and processing (PDFs/Images).
*   Text extraction via Tesseract.
*   Keyword and Semantic search querying.
*   A functional UI for students to search and download, and for admins to manage content.
*(Out of scope for MVP: Advanced analytics, LLM document summarization, mobile app).*

## Key Benefits
*   **Accessibility:** Unlocks knowledge trapped in analog/scanned formats.
*   **Efficiency:** Drastically reduces student study time spent hunting for specific notes or past papers.
*   **Organization:** Enforces a rigid academic hierarchy (University -> Faculty -> Dept -> Course -> Semester) for standardized archiving.
