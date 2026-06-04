# Document Upload Approval Workflow & Role Dashboard Enhancements

## Overview
This report details the design and implementation of the refined Document Approval Workflow, the integration of Rejection Reasons, and the layout changes on Student, Moderator, and Administrator Dashboards. These changes ensure complete transparency, safety, and a premium visual and functional experience for the academic submission demonstration.

---

## 1. Database & Schema Updates
- **Rejection Reasons Support**: Added a nullable `rejection_reason` column to the `Document` database model (`backend/app/models/document.py`).
- **Data Transfer Objects**: Extended FastAPI Pydantic schemas (`backend/app/schemas/document.py`) to include `rejection_reason` on retrieval payloads.
- **Reject Request Schema**: Created `RejectRequest` containing `rejection_reason: str` for POST-based reject operations.
- **Alembic Database Migration**: Executed migration files to sync schema updates with SQLite.

---

## 2. API Endpoint Refinement
- **Standardized Status Lifecycle**: 
  - Standardized status transitions across the upload pipeline: new documents default to `pending` or `duplicate_warning` status depending on hash collision scoring.
  - Rejection does NOT delete documents: the document remains in the database with `status = "rejected"` and `is_approved = False`.
  - Approve Endpoint (`POST /api/documents/{id}/approve`): Approves documents (`status = "approved"`, `is_approved = True`) and clears the `rejection_reason`.
  - Reject Endpoint (`POST /api/documents/{id}/reject`): Rejects documents (`status = "rejected"`, `is_approved = False`) and records the custom reason.

---

## 3. Student Dashboard & Activity Feed
- **Metrics Redefinement**: Replaced the generic count cards with distinct metric blocks: **My Uploads**, **Pending Review**, **Approved Uploads**, and **Available Library**.
- **Real-Time Activity Feed**: Implemented a responsive history feed detailing the status updates of submissions (e.g. "Approved", "Rejected with Feedback", "Pending Alert").
- **Documents Page Tabs**: Integrated "Global Library" and "My Uploads" tabs on the student's Document view page, restricting visibility based on approval status or ownership.

---

## 4. Moderator Panel (Rejection Dropdowns & Queues)
- **Tabbed Review Queues**: Separated moderation queues into **Pending Queue**, **Duplicate Alerts**, and **Resolved History** to streamline supervisor demonstration.
- **Rejection Modal Dialog**: Designed a custom overlay modal for rejection selection featuring standard categories:
  - *Duplicate Submission*
  - *Poor OCR Quality*
  - *Missing Metadata*
  - *Incorrect Course Tagging*
  - *Corrupted File*
  - *Other* (with a custom comment field)

---

## 5. Administrator Panel
- **Search Query Distribution**: Displayed query counts and distribution percentages across **Keyword**, **Semantic**, and **Hybrid** searches.
- **System Health Monitor**: Rendered green indicators for API Gateway, DB Connection, OCR Worker, and Vector Indexes.

---

## Verification & Status
- **Backend Tests**: Fully validated with `test_e2e_mvp.py`. All tests passed.
- **Frontend Build**: Verified compiled code builds successfully (`tsc -b && vite build` succeeded).
