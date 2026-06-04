# Phase Progress Report: Dynamic Document Filtering
**Report ID**: #26  
**Status**: Completed  
**Author**: Antigravity (AI Assistant)  
**Date**: June 4, 2026  

---

## 📋 Executive Summary
This report documents the design, implementation, and verification of dynamic filters on the **Documents Page** for the UniArchive Platform. Previously, filters for Document Status and Extraction Method were hardcoded in the frontend, leading to mismatches with actual database values. 

To resolve this, we:
1. Created a new dynamic backend endpoint `GET /api/documents/filter-options` which returns distinct live database values for document status and extraction method.
2. Updated the frontend page `DocumentsPage.tsx` to retrieve filter options from all four live metadata endpoints.
3. Added clean text formatting mapping to render clean labels (e.g., `duplicate_warning` ➔ `Duplicate Warning`).
4. Implemented a fallback empty state if no options are present across the database and courses/types/semesters.

---

## 🛠️ Technical Implementation

### 1. Backend API Endpoint
We added a new endpoint `GET /api/documents/filter-options` to `backend/app/api/routes.py` with the following response schema:

```python
class FilterOptionsOut(BaseModel):
    statuses: list[str]
    extraction_methods: list[str]
```

The route queries distinct live values:
```python
@router.get("/documents/filter-options", response_model=FilterOptionsOut)
def get_filter_options(db: Session = Depends(get_db)):
    statuses = [
        r[0] for r in db.query(Document.status).distinct().all()
        if r[0] is not None and r[0] != ""
    ]
    extraction_methods = [
        r[0] for r in db.query(Document.extraction_method).distinct().all()
        if r[0] is not None and r[0] != ""
    ]
    return {
        "statuses": sorted(statuses),
        "extraction_methods": sorted(extraction_methods)
    }
```

### 2. Frontend Updates (`DocumentsPage.tsx`)
- **State Hooks**: Added `availableStatuses` and `availableExtractions` to maintain dynamically retrieved values.
- **Lookup Loading**: Augmented the `useEffect` hook to call `/api/documents/filter-options` alongside course, type, and semester lookups in parallel.
- **Clean Label Formatting**:
  - `pending` ➔ `Pending Review`
  - `approved` ➔ `Approved`
  - `rejected` ➔ `Rejected`
  - `duplicate_warning` ➔ `Duplicate Warning`
  - `digital_pdf` ➔ `Digital PDF`
  - `image_ocr` ➔ `Image OCR`
  - `scanned_pdf_ocr` ➔ `Scanned PDF OCR`
- **Fallback Empty State**: If no dropdown options exist at all, the UI renders the clean indicator: *"No filter options available yet."* without crashing.

---

## 🔍 Verification & Testing Results

### 1. Automated Builds
- **Backend check**: Passed successfully.
  ```bash
  PYTHONPATH=. ./.venv/bin/python -c "from app.main import app; print('backend ok')"
  # Output: backend ok
  ```
- **Frontend production build**: Built successfully with zero compile-time or TypeScript errors.
  ```bash
  npm run build
  # Output: built in 5.74s
  ```

### 2. Manual/Browser Verification
A web browser subagent successfully logged in and inspected `/documents` to check the filter options.
- **Visible Courses**: Live courses were loaded (CS101, CS201, CS301, MATH101, etc.).
- **Visible Types**: Live document types were loaded (Assignment, CAT, Notes, Project Report, etc.).
- **Visible Semesters**: Live semesters were loaded (Semester 1 (2022/2023), etc.).
- **Visible Status Options**: Dynamically loaded from database (`approved`, `processed`).
- **Visible Extraction Methods**: Dynamically loaded from database (`digital_pdf`, `scanned_pdf_ocr`, `image_ocr`).
- **Filtering Behavior**: Selecting Course, Extraction Method, or Status dynamically filters the document list instantly, showing the correct items in the Grid and List views.

---

## 🔓 Role Visibility & Security Constraints
- **Students**:
  - **Global Library** tab shows only approved documents (`status: 'approved'`).
  - **My Uploads** tab shows only the student's own documents with all statuses (`uploaded_by_me: true`).
- **Moderators/Admins**:
  - Can view all documents.
  - Can select and filter by status using the dynamic dropdown.
