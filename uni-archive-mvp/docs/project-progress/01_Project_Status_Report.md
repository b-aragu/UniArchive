# Project Status Report

This status report tracks the current progress, completed phases, and future milestones of the **UniArchive MVP** academic archive platform.

## 1. Project Health Summary

- **Current Stage**: Phase 7 — Access Control & Role-Based UI Separation (Completed)
- **Overall Status**: **Green (Active / Stable)**
- **Build Status**: **Passing (All Backend E2E Tests pass, Frontend builds cleanly)**

---

## 2. Completed Milestones

### Core Architecture & Database Setup (Phases 1-3)
- Fully containerized PostgreSQL and Redis services.
- Database schemas for users, roles, documents, duplicates, and semesters.
- Document storage abstraction with PyMuPDF text extraction.

### Search Engines & Retrieval (Phase 4-5)
- Full-text search (FTS) using PostgreSQL tsvector indexes.
- Semantic search using SentenceTransformers embedding models and FAISS vector index.
- Hybrid search merging FTS and Semantic scores using reciprocal rank fusion (RRF).

### Preprocessing & OCR Pipeline (Phase 6)
- Preprocessing engine using OpenCV (denoising, binarization, deskewing).
- Tesseract OCR integration for scanned PDFs and image files.
- Persistent duplicate warning checks based on perceptual hashing (pHash) and title similarity.

### Access Control & Role-Based Separation (Phase 7)
- Authenticated JWT cookies and endpoints.
- Role-based route protection on both backend and frontend.
- Segmented UI dashboards, sidebar links, and actions for Student, Moderator, and Administrator roles.

---

## 3. Next Steps / Future Enhancements
- **Multi-tenant Course Archiving**: Support course department hierarchies.
- **Advanced Annotation Feed**: Allow students and moderators to add highlight notes and metadata directly on the PDF viewer.
