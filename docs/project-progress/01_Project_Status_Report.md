# Project Status Report

**Project Name:** UniArchive: Intelligent Academic Document Retrieval System with OCR and Semantic Search  
**Author:** Final Year Project Team  
**Date:** June 3, 2026  
**Status:** In Progress (Tier 1 Foundation & Core Backend Complete)

---

## 1. Executive Summary

This report provides a high-level overview of the current status of the **UniArchive** project. As of June 3, 2026, the foundational phases (Phase 1 through Phase 5) have been successfully executed, transitioning the codebase from a minimal 12% skeletal state to a structurally complete academic document repository engine (~35% overall completion). The architecture, database, user authentication (RBAC), and basic search endpoints are now fully operational, tested, and version-controlled.

---

## 2. Project Completion Metrics

### Overall Progress: **38% Complete**

| Phase | Description | Weight | Status | Est. Completion Date |
|:---|:---|:---:|:---|:---|
| **Phase 1** | Requirements Engineering & Traceability Matrix | 5% | ✅ Complete | May 30, 2026 |
| **Phase 2** | Codebase Audit & Gap Analysis | 5% | ✅ Complete | May 31, 2026 |
| **Phase 3** | Architecture & Foundation | 10% | ✅ Complete | June 1, 2026 |
| **Phase 4** | Database Design & Migration Setup | 10% | ✅ Complete | June 2, 2026 |
| **Phase 5** | Core FastAPI Backend & RBAC | 15% | ✅ Complete | June 3, 2026 |
| **Phase 6** | OCR Preprocessing & Fallback Pipeline | 10% | ⏳ Not Started | June 10, 2026 |
| **Phase 7** | Semantic Search (SBERT & FAISS) | 10% | ⏳ Not Started | June 15, 2026 |
| **Phase 8** | Hybrid Search (RFF) | 5% | ⏳ Not Started | June 18, 2026 |
| **Phase 9** | Duplicate Detection (pHash & Text Similarity) | 5% | ⏳ Not Started | June 22, 2026 |
| **Phase 10** | Frontend Implementation (React/TS/Vite) | 15% | ⏳ Not Started | July 05, 2026 |
| **Phase 11** | Security Hardening (Rate limits, Magic types) | 5% | ⏳ Not Started | July 08, 2026 |
| **Phase 12** | Integrated Testing (Unit, Integration, E2E) | 5% | ⏳ Not Started | July 15, 2026 |
| **Phase 13** | Academic Deliverables & System Docs | 5% | ⏳ Not Started | July 20, 2026 |
| **Phase 14** | Supervisor Demo Preparation | 5% | ⏳ Not Started | July 25, 2026 |

---

## 3. Major Accomplishments

1. **Version Control Initialization:** Git repository initialized with a clean baseline, branch structure, and strict `.gitignore` patterns protecting system artifacts.
2. **Normalized Database Schema:** Designed and deployed a 15-table relational schema using SQLAlchemy, transitioning from a flat layout to a normalized academic hierarchy (Universities, Faculties, Departments, Courses, Semesters).
3. **Database Migration Pipeline:** Established Alembic migration system, deprecating the fragile `Base.metadata.create_all()` runtime routine.
4. **Authentication & Authorization (RBAC):** Integrated JWT-based session security and role-based permissions (`student`, `moderator`, `administrator`) using `python-jose` and `passlib[bcrypt]`.
5. **API Extension:** Implemented paginated document listing, secure file download and deletion controllers, and structured user management routes.
6. **FTS Foundation:** Upgraded search service to run native PostgreSQL Full-Text Search (using GIN-indexed `search_vector` generated column) with relevance ranking (`ts_rank`).
7. **Python 3.9 Backporting:** Resolved runtime compatibility constraints on the host machine using `eval_type_backport` and `from __future__ import annotations` imports.

---

## 4. Current Blockers & Risks

No technical blockers are currently delaying the project. The following risks are actively managed:
* **Docker Daemon Group Permissions:** Access to `/var/run/docker.sock` requires root privilege. Deployed locally via `sudo docker compose` for manual database instance orchestration. This will be standardized via Docker Group adjustments or deployment tooling.
* **Tesseract Dependency:** The local development runtime requires PyMuPDF and binary Tesseract libraries during OCR stages. Addressed via explicit installation documentation.

---

## 5. Key Milestones & Next Steps

1. **Milestone 3 (June 10, 2026):** Complete Phase 6 OCR Preprocessing. This will allow the ingestion engine to parse low-quality scans.
2. **Milestone 4 (June 15, 2026):** Implement SBERT and FAISS indexing, marking the completion of semantic vector capability.
3. **Milestone 5 (June 18, 2026):** Execute RRF logic merging keyword search and semantic vector search into hybrid retrieval.
