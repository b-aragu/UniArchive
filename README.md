# UniArchive - Intelligent Academic Document Retrieval System

UniArchive is an intelligent, scalable academic document repository. It features a robust Python/FastAPI backend, a modern React/Vite frontend, and integrates advanced capabilities like PostgreSQL Full-Text Search, Tesseract OCR, PyMuPDF digital extraction, FAISS Semantic Vector Search (Sentence-BERT), Reciprocal Rank Fusion (Hybrid Search), and pHash Duplicate Detection.

---

## 🛠️ Technology Stack

### Backend
* **FastAPI (Python 3.9+)**: High-performance web framework for API routing.
* **SQLAlchemy (v2.0+)**: Modern SQL toolkit and Object Relational Mapper.
* **Alembic**: Database migration tool for SQLAlchemy.
* **Uvicorn**: Lightning-fast ASGI web server implementation.
* **Pytest**: Backend testing suite for endpoint and integration verification.

### Database & Vector Search
* **PostgreSQL (v16)**: Relational database with full-text search (FTS) indexing (`pg_trgm`).
* **FAISS (Facebook AI Similarity Search)**: Vector index database used for efficient similarity searches of dense vector embeddings.

### Artificial Intelligence & Processing Pipelines
* **OCR & Preprocessing**:
  * **Tesseract OCR**: Optical Character Recognition engine for text extraction from scans and images.
  * **OpenCV (cv2)**: Digital image processing library used for image binarization, denoising, contrast enhancement, and deskewing.
  * **PyMuPDF (fitz)**: Lightweight PDF extraction engine for parsing digital documents.
* **Semantic Embeddings**:
  * **Sentence-Transformers (`all-MiniLM-L6-v2`)**: Compact, high-quality Sentence-BERT model (~90MB) used to convert text paragraphs into 384-dimensional semantic vector embeddings.
* **Hybrid Search Retrieval**:
  * **Reciprocal Rank Fusion (RRF)**: Custom search algorithm blending and re-ranking keyword FTS scores and semantic cosine-similarity scores.
* **Perceptual Hashing**:
  * **ImageHash (pHash)**: Computes perceptual image hashes to detect visually matching images/pages and prevent duplicate uploads.
* **AI Study Assistant (Groq & Gemini)**:
  * **HTTPX Integration**: Direct REST-based connection (no heavy SDK dependencies) providing automated document summaries, key topics, study notes, revision questions, and search explanations.

### Frontend
* **Vite**: Modern, blazing-fast frontend build tool.
* **React (v19)**: User interface building library.
* **TypeScript**: Type safety layer for frontend code.
* **React Router Dom (v7)**: SPA client-side routing.
* **Axios**: Promised-based HTTP client for API communication.
* **Lucide React**: Premium, modern icon set.
* **CSS Grid & Flexbox**: Fully responsive custom styling system.

---

## 🌟 Core Features

* **Automated Extraction Pipeline**: Automatically chooses between PyMuPDF (for digital PDFs) and Tesseract OCR (for scanned PDFs/images) with OpenCV image quality enhancement.
* **Document Library Page**: Mapped to `/documents` with support for Card and Compact List layouts, multi-metric sorting (Date, Title, OCR Confidence), and advanced hierarchical filters (Course, Semester, Document Type).
* **Secure Document Previews**: Interactive `/documents/:id` page featuring a tabbed interface:
  * **Original File Tab**: Dynamically renders PDFs inside an embedded iframe or images via secure local Object URLs generated from authenticated backend streams (`/api/documents/{id}/download`).
  * **Extracted Text Tab**: Displays extracted raw text, OCR confidence ratings, processing time, and indexing parameters.
* **Interactive Upload UX**: A complete state machine with title auto-population, processing spinners, instant results feedback, and form resetting.
* **Multi-Mode Search Engine**: Includes FTS Keyword Search, FAISS Semantic Search, and RRF Hybrid Search.
* **Duplicate Detection**: Computes perceptual hashes during upload to warn users of duplicate content before storing.
* **Role-Based Access Control (RBAC)**: Supports roles (`Student`, `Moderator`, `Administrator`). Students only see approved files or their own uploads; Moderators/Admins see and manage the entire library.

---

## 🚀 Setup & Running the Project (venv)

The project is run locally using a Python virtual environment (`venv`) for the backend and Node/npm for the frontend.

### Prerequisites
* **Python 3.9+** (with `venv` and `pip`)
* **Node.js 18+** (with `npm`)
* **PostgreSQL** (installed locally)
* **Tesseract OCR** (for image text extraction, e.g. `sudo apt-get install tesseract-ocr libgl1`)

---

### 1. Database Setup
Ensure you have a local PostgreSQL instance running and create a database named `uniarchive` (default values match the `DATABASE_URL` in `.env.example`).


---

### 2. Backend Setup (venv)
Navigate to the backend directory, copy the environment configuration, set up the virtual environment, install dependencies, run migrations, and seed the test database:
```bash
cd backend

# Copy environment variables
cp .env.example .env

# Initialize and activate Python virtual environment
python -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run migrations to build database schema
alembic upgrade head

# Seed roles and sample data
PYTHONPATH=. python scripts/seed_roles.py
PYTHONPATH=. python scripts/seed_test_data.py

# Start the FastAPI backend
uvicorn app.main:app --reload --port 8000
```
* **Backend API** will be available at: `http://localhost:8000`
* **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Frontend Setup
In a separate terminal tab or window, install dependencies and start the Vite React development server:
```bash
cd frontend
npm install
npm run dev
```
* **Frontend Application** will be available at: `http://localhost:5173`

---

### 4. AI Study Assistant Setup (Optional)
To enable live AI generation, add your API keys to `backend/.env`. If keys are not configured, the assistant runs in **Demo Fallback Mode** returning mock study content.
```env
LLM_PROVIDER=groq                     # 'gemini' or 'groq'
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
LLM_MODEL=llama-3.3-70b-versatile              # e.g., 'gemini-1.5-flash' or 'llama-3.3-70b-versatile'
LLM_TEXT_LIMIT=10000                  # Maximum character limit for OCR text inputs
```

---

## 🔑 Demo Credentials
To evaluate the system, use the following pre-seeded credentials:

* **Administrator**: `admin@test.com` / `password123`
* **Moderator**: `mod@test.com` / `password123`
* **Student**: `student@test.com` / `password123`

---

## 🔧 Troubleshooting

* **Model Download Delays:** On the first execution of semantic search or upload pipelines, `sentence-transformers` will download the `all-MiniLM-L6-v2` model (~90MB). This may cause the first request to be slow.
* **Tesseract Not Found:** If running the backend locally, install `tesseract-ocr` and `libgl1` on your host operating system (e.g., `sudo apt-get install tesseract-ocr libgl1`).
