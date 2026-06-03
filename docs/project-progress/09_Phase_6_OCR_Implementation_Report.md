# Phase 6 — OCR Implementation Report

**Phase:** Phase 6: OCR Implementation  
**Status:** ✅ Complete  
**Date Completed:** June 3, 2026  
**Core Technologies:** OpenCV (`opencv-python-headless`), Tesseract (`pytesseract`), PyMuPDF (`fitz`), NumPy

---

## 1. Objectives

The goal of Phase 6 was to upgrade the basic text extraction module into a robust, academic-grade OCR pipeline capable of handling noisy scans, digital PDFs, and pure image uploads. The system needed to guarantee extraction while measuring process metrics (time, confidence) without halting the upload workflow on OCR failure.

---

## 2. Architecture & Pipeline

### 2.1 Extraction Methods
The pipeline defines three explicit extraction methodologies, stored in the new database column `extraction_method`:
1. **`digital_pdf`**: Utilizes PyMuPDF (`fitz`) to rapidly extract embedded text from digitally native PDF files. If the extracted text is substantial (>100 characters), the pipeline bypasses OCR entirely, yielding 100% confidence and near-instant processing.
2. **`scanned_pdf_ocr`**: If a PDF yields insufficient text (i.e. scanned image-only PDFs), the system triggers a fallback. Each page is rendered to a raster image at 2.0x matrix resolution (approx. 300 DPI) and passed through the OCR engine.
3. **`image_ocr`**: Direct uploads of image formats (`.png`, `.jpg`, `.tiff`) are loaded directly into OpenCV and processed via Tesseract.

### 2.2 OpenCV Image Preprocessing
Before any image reaches the Tesseract engine, it undergoes a sequential OpenCV filtering pipeline designed to maximize text clarity:
1. **Grayscale Conversion:** Reduces dimensionality and standardizes the image.
2. **Median Blur (Denoising):** Removes salt-and-pepper noise common in scanned documents.
3. **CLAHE (Contrast Limited Adaptive Histogram Equalization):** Enhances contrast across localized grid tiles, revealing text in unevenly lit photographs.
4. **Otsu's Binarization:** Automatically calculates the optimal threshold to separate dark text from light backgrounds.
5. **Deskewing:** Detects the minimum bounding rectangle of textual clusters and applies an affine affine transformation matrix to correct skews up to ±15 degrees.

### 2.3 Confidence Scoring
Tesseract's output is configured to return detailed dictionary structures (`pytesseract.image_to_data`). The pipeline filters out invalid token predictions (`conf == -1`) and computes the average confidence score across all extracted words, writing the float value to `ocr_confidence`.

---

## 3. Database Modifications

A new Alembic migration (`f1010bb4b221_add_ocr_metadata_fields.py`) was applied to safely extend the `documents` table without data loss:
* `extraction_method` (VARCHAR 50)
* `page_count` (INTEGER)
* `processing_time_ms` (FLOAT)

These values are intercepted at the FastAPI endpoint layer and committed synchronously during the document upload transaction.

---

## 4. Error Handling and Safe Fallback

OCR engines are resource-intensive and prone to failure on corrupt images. 
* All OCR routines are enclosed in broad `try/except` blocks.
* If a failure occurs (e.g., missing Tesseract binary, corrupted image buffer), the error is intercepted and sent to the application `logger`. 
* The service returns empty strings (`""`) and `None` for confidence, allowing the upload process to succeed so users don't lose their file uploads due to an asynchronous OCR crash.
* Large PDFs are capped at 50 pages to prevent memory exhaustion and thread timeouts during processing.

---

## 5. Testing & Limitations

A manual verification script (`backend/scripts/test_ocr.py`) was created to test pipeline branches by dynamically generating test images and digital PDFs.

**Current Dependencies & Limitations:**
* **Host Requirement:** The host machine running the backend container *must* have the `tesseract-ocr` binary installed on the OS level (e.g., `apt-get install tesseract-ocr`). The Python bindings merely wrap this binary. If missing, the pipeline safely falls back to returning empty text.
* **Synchronous Load:** Currently, the OCR runs synchronously within the FastAPI request cycle. For large files, this delays the HTTP response. A future optimization (in a later phase or beyond MVP) would involve moving this to Celery or FastAPI `BackgroundTasks`.

---

## 6. Files Changed

* `[NEW]` `alembic/versions/f1010bb4b221_add_ocr_metadata_fields.py`
* `[NEW]` `scripts/test_ocr.py`
* `[MODIFY]` `app/models/document.py`
* `[MODIFY]` `app/schemas/document.py`
* `[MODIFY]` `app/services/ocr_service.py`
* `[MODIFY]` `app/api/routes.py`
* `[MODIFY]` `requirements.txt`
