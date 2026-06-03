# Google Antigravity Prompts for UNI ARCHIVE MVP

Use these in order. Keep Antigravity in approval/confirm mode for terminal and destructive actions.

## Prompt 1 — Inspect and Plan
You are working on my final-year project called UNI ARCHIVE: Intelligent Academic Document Retrieval System. Inspect this full repository. Give me a short implementation plan for completing the MVP using React + FastAPI + PostgreSQL. Do not change files yet.

## Prompt 2 — Backend Database and API
Implement the FastAPI backend fully for the MVP. Ensure the database tables are created, uploads are saved to backend/uploads, metadata is stored, and `/api/documents`, `/api/upload`, `/api/search`, and `/health` work. Add clear error handling.

## Prompt 3 — OCR Integration
Upgrade the OCR service so PDFs and images can be processed. Use Tesseract for images. For PDFs, extract text directly if possible, otherwise convert pages to images and OCR them. Keep it lightweight and document setup steps.

## Prompt 4 — Frontend MVP
Complete the React frontend with Dashboard, Upload, Search, and Document List pages. Make it clean, simple, and academic. Connect it to the backend API.

## Prompt 5 — Testing and Verification
Run backend and frontend tests manually. Use the browser to upload a sample PDF/image, search for a term, and verify results. Produce a verification artifact with screenshots and fixes needed.

## Prompt 6 — Final Polish
Add README instructions, sample data notes, and a short demo script I can use for presentation.