# UNI ARCHIVE MVP

React + FastAPI + PostgreSQL MVP for an Intelligent Academic Document Retrieval System with OCR-ready upload and search.

## MVP Features
- Upload academic documents
- Store document metadata in PostgreSQL
- Extract OCR text placeholder service, ready for Tesseract integration
- Search documents by title, course code, document type, academic year, and extracted text
- React dashboard with Upload and Search pages
- Docker Compose for PostgreSQL

## Quick Start

### 1. Start PostgreSQL
```bash
docker compose up -d db
```

### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend runs on:
```text
http://localhost:8000
```

API docs:
```text
http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```text
http://localhost:5173
```

## Antigravity Development Flow
Open this folder in Google Antigravity and run the prompts in `docs/ANTIGRAVITY_PROMPTS.md`.