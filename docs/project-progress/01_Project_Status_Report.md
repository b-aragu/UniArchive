# Project Status Report

**Project Name:** UniArchive: Intelligent Academic Document Retrieval System with OCR and Semantic Search  
**Author:** Final Year Project Team  
**Date:** June 4, 2026  
**Status:** Complete (MVP Polished & Demo-Ready)

---

## 1. Executive Summary

This report provides a high-level overview of the current status of the **UniArchive** project. As of June 4, 2026, the dynamic filtering system was completed, transitioning the front-end page search filters from hardcoded configuration to a dynamic metadata engine loaded directly from the database schema endpoints. The architecture, database, user authentication (RBAC), search index, and dynamic metadata filters are now fully operational, tested, and version-controlled.

---

## 2. Project Completion Metrics

### Overall Progress: **100% Complete**

| Phase | Description | Weight | Status | Est. Completion Date |
|:---|:---|:---:|:---|:---|
| **Phase 1** | Scaffolding & Setup | 5% | ✅ Complete | May 30, 2026 |
| **Phase 2** | Architecture Documentation | 5% | ✅ Complete | May 31, 2026 |
| **Phase 3** | Authentication & RBAC Design | 5% | ✅ Complete | June 1, 2026 |
| **Phase 4** | Database Design & Migration Setup | 10% | ✅ Complete | June 2, 2026 |
| **Phase 5** | Core FastAPI Backend & RBAC | 15% | ✅ Complete | June 3, 2026 |
| **Phase 6** | OCR Preprocessing & Fallback Pipeline | 10% | ✅ Complete | June 3, 2026 |
| **Phase 7** | Semantic Search (SBERT & FAISS) | 10% | ✅ Complete | June 3, 2026 |
| **Phase 8** | Hybrid Search (RRF) | 5% | ✅ Complete | June 3, 2026 |
| **Phase 9** | Duplicate Detection (pHash & Text Similarity) | 5% | ✅ Complete | June 3, 2026 |
| **Phase 10**| Frontend Implementation (React/TS/Vite) | 15% | ✅ Complete | July 05, 2026 |
| **Phase 11**| Final Testing, Demo Prep & Deployment | 15% | ✅ E2E Complete | July 15, 2026 |
| **Phase 12**| Dynamic Filtering & Live Metadata | 5% | ✅ Complete | June 4, 2026 |
| **Phase 13**| AI Study Assistant Integration | 5% | ✅ Complete | June 4, 2026 |
| **Phase 14**| MVP Stability, Sync, & UI Polish | 5% | ✅ Complete | June 4, 2026 |


---

## 3. Major Accomplishments
1. **Version Control Initialization:** Git repository initialized with a clean baseline, branch structure, and strict `.gitignore` patterns protecting system artifacts.
2. **Normalized Database Schema:** Designed and deployed a 15-table relational schema using SQLAlchemy, transitioning from a flat layout to a normalized academic hierarchy (Universities, Faculties, Departments, Courses, Semesters).
3. **Database Migration Pipeline:** Established Alembic migration system, deprecating the fragile `Base.metadata.create_all()` runtime routine.
4. **Authentication & Authorization (RBAC):** Integrated JWT-based session security and role-based permissions (`student`, `moderator`, `administrator`) using `python-jose` and `passlib[bcrypt]`.
5. **API Extension:** Implemented paginated document listing, secure file download and deletion controllers, and structured user management routes.
6. **FTS Foundation:** Upgraded search service to run native PostgreSQL Full-Text Search (using GIN-indexed `search_vector` generated column) with relevance ranking (`ts_rank`).
7. **Python 3.9 Backporting:** Resolved runtime compatibility constraints on the host machine using `eval_type_backport` and `from __future__ import annotations` imports.
8. **Semantic Search Validation:** Integrated Sentence-BERT (`all-MiniLM-L6-v2`) and FAISS on CPU. Verified document chunking, embeddings generation, and vector retrieval with high relevance scores.
9. **Hybrid Search (RRF):** Integrated FTS and Semantic Search using Reciprocal Rank Fusion (RRF), deploying a production-ready `/api/search/hybrid` endpoint with structured query logging.
10. **Duplicate Detection:** Integrated perceptual hashing (`pHash`) and Jaccard text similarity to intercept uploads and flag near-duplicates securely without blocking user interactions.
11. **E2E Integration Verified:** Successfully executed the Phase 11 full pipeline tests. The backend and frontend are entirely stable and interoperable. The passlib bcrypt crash bug was isolated and repaired.
12. **Dynamic Metadata Filtering:** Replaced hardcoded document filter dropdown selections on the frontend with dynamically loaded backend options (`GET /api/documents/filter-options`), incorporating dynamic fallback labels and empty state handling.
13. **AI Study Assistant Integration:** Implemented low-overhead REST connections to Groq and Gemini (via HTTPX), supporting mock/demo fallback behavior when credentials are missing. Integrated summary generation, study revision questions with show/hide answer toggles, and relevance explanation cards into the Document Detail and Search pages.
14. **MVP Stability, Synchronization, & UI Polish:** Resolved student document visibility discrepancies by checking `is_approved == True` on approved statuses. Refactored search APIs to accept interchangeable parameters (`q` vs. `query`) to prevent 422 validation errors. Configured React main layout router outlet with `ErrorBoundary` shields.


---

## 4. Current Blockers & Risks

No technical blockers are currently delaying the project. The following risks are actively managed:
* **Docker Daemon Group Permissions:** Access to `/var/run/docker.sock` requires root privilege. Deployed locally via `sudo docker compose` for manual database instance orchestration. This will be standardized via Docker Group adjustments or deployment tooling.
* **Tesseract Dependency:** The local development runtime requires PyMuPDF and binary Tesseract libraries during OCR stages. The `tesseract-ocr` binary was successfully installed on the host OS and validated.
* **Synchronous OCR Loading:** Large OCR operations (1s/page) currently block the HTTP response cycle.

---

## 5. Key Milestones & Next Steps

1. **Milestone 3 (June 10, 2026):** Complete Phase 6 OCR Preprocessing. ✅ (Validation Pass Completed: 100% Success Rate across 9 document topologies).
2. **Milestone 4 (June 15, 2026):** Implement SBERT and FAISS indexing, marking the completion of semantic vector capability. ✅ (Validation Pass Completed: Pipeline successfully tested on CPU).
3. **Milestone 5 (June 18, 2026):** Execute RRF logic merging keyword search and semantic vector search into hybrid retrieval. ✅ (Validation Pass Completed: RRF Search endpoint successfully ranking results).
4. **Milestone 6 (June 20, 2026):** Transition hardcoded page filtering parameters to live metadata lookups. ✅ (Completed: Front-end page filters verified dynamically loading from db).

---

## 6. Documentation Index

### Architecture & Design
*   [`02_System_Architecture.md`](./02_System_Architecture.md)
*   [`03_API_Design.md`](./03_API_Design.md)
*   [`06_Database_Dictionary.md`](./06_Database_Dictionary.md)
*   [`12_Frontend_Audit_and_Implementation_Plan.md`](./12_Frontend_Audit_and_Implementation_Plan.md)
*   [`13_Phase_8_Hybrid_Search_Implementation_Plan.md`](./13_Phase_8_Hybrid_Search_Implementation_Plan.md)
*   [`../frontend-design/Component_Map.md`](../frontend-design/Component_Map.md)
*   [`../frontend-design/Route_Map.md`](../frontend-design/Route_Map.md)
*   [`../frontend-design/API_Integration_Map.md`](../frontend-design/API_Integration_Map.md)
*   [`../frontend-design/State_Management_Plan.md`](../frontend-design/State_Management_Plan.md)

### Implementation Reports
*   [`07_Phase_5_Implementation_Report.md`](./07_Phase_5_Implementation_Report.md)
*   [`08_Implementation_Log.md`](./08_Implementation_Log.md)
*   [`09_Phase_6_OCR_Implementation_Report.md`](./09_Phase_6_OCR_Implementation_Report.md)
*   [`10_OCR_Verification_Report.md`](./10_OCR_Verification_Report.md)
*   [`11_Phase_7_Semantic_Search_Implementation_Report.md`](./11_Phase_7_Semantic_Search_Implementation_Report.md)
*   [`14_Phase_10_Frontend_Implementation_Report.md`](./14_Phase_10_Frontend_Implementation_Report.md)
*   [`16_Phase_7_Semantic_Search_Verification_Report.md`](./16_Phase_7_Semantic_Search_Verification_Report.md)
*   [`17_Phase_8_Hybrid_Search_Evaluation_Report.md`](./17_Phase_8_Hybrid_Search_Evaluation_Report.md)
*   [`18_Phase_9_Duplicate_Detection_Report.md`](./18_Phase_9_Duplicate_Detection_Report.md)
*   [`19_End_To_End_MVP_Verification_Report.md`](./19_End_To_End_MVP_Verification_Report.md)
*   [`20_Final_UI_Functionality_Polish_Report.md`](./20_Final_UI_Functionality_Polish_Report.md)
*   [`26_Dynamic_Documents_Filters_Report.md`](./26_Dynamic_Documents_Filters_Report.md)
*   [`27_AI_Study_Assistant_Report.md`](./27_AI_Study_Assistant_Report.md)
*   [`28_Final_Stability_Sync_UI_Report.md`](./28_Final_Stability_Sync_UI_Report.md)


### Final Report & Demo
*   [`../final-report/Chapter1_Introduction.md`](../final-report/Chapter1_Introduction.md)
*   [`../final-report/Chapter2_Literature_Review.md`](../final-report/Chapter2_Literature_Review.md)
*   [`../final-report/Chapter3_Methodology.md`](../final-report/Chapter3_Methodology.md)
*   [`../final-report/Chapter4_Implementation.md`](../final-report/Chapter4_Implementation.md)
*   [`../final-report/Chapter5_Testing_and_Results.md`](../final-report/Chapter5_Testing_and_Results.md)
*   [`../final-report/Chapter6_Conclusion.md`](../final-report/Chapter6_Conclusion.md)
*   [`../final-demo/Demo_Script.md`](../final-demo/Demo_Script.md)
*   [`../final-demo/Supervisor_Walkthrough.md`](../final-demo/Supervisor_Walkthrough.md)
*   [`../final-demo/Architecture_One_Page.md`](../final-demo/Architecture_One_Page.md)
*   [`../presentation/presentation_outline.md`](../presentation/presentation_outline.md)
