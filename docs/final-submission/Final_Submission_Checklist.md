# Final Submission Checklist

**Project:** UniArchive  
**Team:** Final Year Project Team  
**Date:** June 3, 2026  

This document serves as the pre-flight checklist for submitting the Final Year Project and preparing the artifacts for the examination panel.

## 1. Documentation & Code Repository
- [x] Codebase cleaned (removed scratch files, debug logs)
- [x] `.env.example` verified to contain necessary configuration templates
- [x] `README.md` updated with comprehensive installation and execution steps
- [x] Project architecture diagrams generated and saved in `docs/`
- [x] Git commits squashed/cleaned and pushed to the primary branch (`main`)

## 2. Docker & Deployment
- [x] `Dockerfile` created for FastAPI Backend
- [x] `Dockerfile` created for React/Vite Frontend
- [x] `docker-compose.production.yml` configured to orchestrate DB, Backend, and Frontend
- [x] Production build tested locally without errors
- [x] Environment variables documented for production

## 3. Academic Deliverables
- [x] **Final Report:** Implemented sections up to testing/results. (Needs final proofreading)
- [x] **Demo Script:** Prepared (`docs/final-demo/Demo_Script.md`)
- [x] **Supervisor Walkthrough:** Prepared (`docs/final-demo/Supervisor_Walkthrough.md`)
- [x] **Presentation Deck:** Outline prepared (needs slide generation)
- [x] **Test Dataset:** Seed documents, including `UniArchive_Test_Document.pdf`, bundled for live demonstration

## 4. System Functionality (Verified)
- [x] **Auth:** Registration and RBAC functionality working.
- [x] **Upload:** Documents safely parsed and stored.
- [x] **OCR:** PyMuPDF and Tesseract fallback functional.
- [x] **Semantic Search:** Sentence-BERT generating and FAISS indexing vectors.
- [x] **Hybrid Search:** Reciprocal Rank Fusion returning accurate sorted lists.
- [x] **Duplicate Detection:** Perceptual hashing properly trapping identical file uploads.

## 5. Next Actions for the Team
1.  Complete the final proofreading of the Academic Report (`docs/final-report/*`).
2.  Design and format the Presentation Slides based on `presentation_outline.md`.
3.  Deploy the Docker container to a staging cloud server (e.g., AWS EC2, DigitalOcean) if required, or prepare a robust local machine for the demo.
4.  Conduct a final dry-run of the Demo Script.
