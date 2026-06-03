# Phase 9: Duplicate Detection Report

**Project:** UniArchive  
**Author:** Final Year Project Team  
**Date:** June 3, 2026  

## 1. Objective
To prevent redundant storage and maintain repository quality by detecting identical or near-duplicate documents during the upload flow, providing administrative tools to review duplicate pairs.

## 2. Implementation Architecture
The Duplicate Detection service (`duplicate_service.py`) intercepts the upload pipeline immediately after OCR processing but before the document is finalized. It employs a two-tier fallback approach:

1. **Perceptual Hashing (pHash):** 
   - **Mechanism:** Computes a 64-bit perceptual hash using the `imagehash` library. For PDFs, it extracts and hashes the first page. For images, it hashes the entire image.
   - **Scoring:** Calculates the Hamming distance between the new hash and existing hashes.
   - **Threshold:** A Hamming distance `<= 15` (approx 76.5% visual similarity) is flagged as a duplicate. This accounts for minor variations like cropped margins or slight noise.

2. **Text Similarity (Fallback):**
   - **Mechanism:** If `pHash` is unavailable (e.g., pure text files) or falls outside the threshold, the system computes the Jaccard Similarity of the extracted `ocr_text`.
   - **Scoring:** `(Intersection of Words) / (Union of Words)` over the first 5000 characters.
   - **Threshold:** `>= 85%` text overlap is flagged as a duplicate.

## 3. Database & API Integration
*   **Database:** Utilizing the existing `phash` column in the `documents` table and inserting relationships into the `duplicate_pairs` table.
*   **Upload Endpoint (`/api/upload`):** The endpoint computes the `pHash`, checks for matches, and natively attaches a `duplicate_warning` object to the JSON response if matches exist. **Crucially, it does not crash or reject the upload**, allowing moderators to manually resolve it later.
*   **Admin Endpoints:** 
    *   `GET /api/admin/duplicates` (Lists all system-wide duplicate pairs)
    *   `GET /api/documents/{id}/duplicates` (Lists specific duplicates for a single file)

## 4. Test Results
Execution of `backend/scripts/test_duplicates.py` validated the pipeline:

| Scenario | Expected Outcome | Actual Outcome | Mechanism Used |
| :--- | :--- | :--- | :--- |
| **Identical Image** (Byte copy) | Duplicate Flagged | ✅ Flagged (Score: 1.0) | pHash |
| **Similar Image** (Added Text) | Duplicate Flagged | ✅ Flagged (Score: 0.8125) | pHash |
| **Different Image** | Clean | ✅ Passed (0 matches) | None |
| **Pure Text Match** (No Image) | Duplicate Flagged | ✅ Flagged (Score: 1.0) | Text Similarity |

## 5. Conclusion
Phase 9 is fully complete. The UniArchive backend is now capable of heuristically identifying duplicate document uploads efficiently using Python-based perceptual hashing and Jaccard distance calculation.
