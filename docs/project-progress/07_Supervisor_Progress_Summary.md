# Supervisor Progress Summary

**Project Title:** UniArchive: Intelligent Academic Document Retrieval System with OCR and Semantic Search  
**Candidate Name:** Final Year Student  
**Supervisor Name:** Project Supervisor  
**Submission Date:** June 3, 2026

---

## 1. Introduction
The objective of this final year project is to design and develop **UniArchive**, an intelligent repository for academic documents (exams, lecture notes, CAT papers) that integrates Optical Character Recognition (OCR) and hybrid (keyword + semantic) search mechanisms. The system addresses the limitations of standard text search platforms by indexing image-only PDFs and scanned handouts, making them searchable via semantic context and keyword matching. 

This summary presents the technical progress made during the implementation of Phases 3, 4, and 5.

---

## 2. Completed Work
The project has successfully completed its initial foundation and core backend implementation phases:
* **Phase 1 & 2 (Requirements & Audits):** Conducted a codebase audit of the MVP skeleton, generating a Requirements Traceability Matrix outlining 89 key requirements.
* **Phase 3 (Architecture Foundation):** Established Git version control, configured a virtualized PostgreSQL environment, and integrated Alembic for database migrations, ensuring all changes are tracked and reversible.
* **Phase 4 (Database Design):** Normalized the relational schema into 15 database tables using SQLAlchemy. This schema captures the organizational hierarchy of a university (faculties, departments, courses, semesters), user roles, OCR outputs, and analytical logs.
* **Phase 5 (FastAPI Backend Implementation):** Developed the API endpoints, user authentication (JWT), role-based permissions (RBAC), file upload/download/delete routes, and implemented PostgreSQL Full-Text Search (FTS).

---

## 3. Technical Achievements

### 3.1 Database Normalization & Primary Key Selection
Transitioned the database layout from a flat format to Third Normal Form (3NF) relational tables. Designed the system to use Version 4 UUIDs (Universally Unique Identifiers) for all primary keys. This ensures scalable identification across distributed components and prevents sequential ID sniffing attacks.

### 3.2 Security and Role Enforcement
Integrated a role-based authentication system using `python-jose` for JWT generation and `passlib[bcrypt]` for secure password hashing. A FastAPI dependency factory enforces role requirements (student, moderator, administrator) at the API gateway layer, securing administrative reports and system settings.

### 3.3 Full-Text Inverted Index Search
Implemented native PostgreSQL Full-Text Search on a generated, GIN-indexed `search_vector` column. By merging the `title` and `ocr_text` into a stored search vector, search queries resolve quickly using lexical matching, matching term stems (e.g. "computation" matching "computer") and ignoring common English stop words.

---

## 4. Current Status
The project backend is currently compiling and running successfully on Python 3.9.18. The database has been seeded with a sample academic hierarchy (University of Nairobi example), including roles, departments, courses, and semesters. The endpoints validate correctly, and schema migrations run error-free.

---

## 5. Challenges and Resolutions
During integration, the team encountered a compatibility issue: Python 3.9.18 (installed on the host system) threw runtime exceptions when parsing Pydantic models that used Python 3.10+ type union syntax (e.g., `str | None`).
* **Resolution:** Installed the `eval_type_backport` library and appended `from __future__ import annotations` to all python modules. This enables backward compatibility for modern type structures on Python 3.9 runtime engines without requiring a complete rewrite.

---

## 6. Next Steps
Having finalized the database and backend foundations, the immediate next steps are:
1. **Phase 6 (OCR Preprocessing Pipeline):** Implementing image normalization filters (deskewing, adaptive binarization, contrast adjustment) in OpenCV and Tesseract to improve text extraction quality from low-resolution scans.
2. **Phase 7 (Semantic Search):** Integrating Sentence-BERT (`all-MiniLM-L6-v2`) and FAISS (Facebook AI Similarity Search) to index document chunk embeddings for vector queries.
3. **Phase 8 (Hybrid Search):** Implementing Reciprocal Rank Fusion (RRF) to merge Full-Text Search scores with Semantic Vector cosine similarity scores.
