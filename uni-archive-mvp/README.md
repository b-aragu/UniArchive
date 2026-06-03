# UniArchive - Intelligent Academic Document Retrieval System

UniArchive is an intelligent, scalable academic document repository. It features a robust Python/FastAPI backend, a modern React/Vite frontend, and integrates advanced capabilities like PostgreSQL Full-Text Search, Tesseract OCR, PyMuPDF digital extraction, FAISS Semantic Vector Search (Sentence-BERT), Reciprocal Rank Fusion (Hybrid Search), and pHash Duplicate Detection.

## Features Completed
- **Role-Based Access Control (RBAC):** Students, Moderators, and Administrators.
- **Automated OCR Pipeline:** Extracts text from PDFs and images seamlessly.
- **Duplicate Detection:** Prevents storage redundancy via perceptual hashing.
- **Multi-Mode Search Engine:** Keyword (FTS), Semantic (FAISS), and Hybrid (RRF).
- **Responsive Dashboard:** Upload, search, and manage documents seamlessly.

---

## 1. Installation & Environment Setup

### Prerequisites
- Docker & Docker Compose
- Python 3.9+ (if running locally without Docker)
- Node.js 18+ (if running frontend locally)

### Clone the Repository
```bash
git clone https://github.com/yourusername/UniArchive.git
cd UniArchive/uni-archive-mvp
```

### Environment Variables
Copy the `.env.example` to `.env` inside the `backend` directory.

```bash
cp backend/.env.example backend/.env
```
Ensure the `DATABASE_URL` matches your local or Docker PostgreSQL instance.

---

## 2. Docker Production Deployment (Recommended)
You can deploy the entire stack (Database, Backend, Frontend) with a single command using the provided production compose file.

```bash
docker-compose -f docker-compose.production.yml up --build -d
```
- **Frontend** will be available at: `http://localhost:80`
- **Backend API** will be available at: `http://localhost:8000/docs`

---

## 3. Local Development Setup

If you prefer to run the services individually for development or debugging:

### Start PostgreSQL
```bash
docker-compose up -d db
```

### Backend Setup (Migrations & Seeding)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run Alembic migrations to construct the schema
alembic upgrade head

# Seed the database with roles and test data
PYTHONPATH=. python scripts/seed_roles.py
PYTHONPATH=. python scripts/seed_test_data.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:5173`.

---

## 4. Demo Credentials
To evaluate the system, use the following pre-seeded credentials depending on the desired role:

*   **Administrator**: `admin@test.com` / `password123`
*   **Moderator**: `mod@test.com` / `password123`
*   **Student**: `student@test.com` / `password123`

---

## 5. Troubleshooting

*   **Port 5432 Conflicts:** The local `docker-compose.yml` maps PostgreSQL to port `5433` on the host to avoid conflicts. Ensure `DATABASE_URL` in your `.env` reflects this if running the backend locally (`localhost:5433`).
*   **Model Download Delays:** On the first execution of the semantic search or upload pipelines, the `sentence-transformers` library will download the `all-MiniLM-L6-v2` model (~90MB). This may cause the first request to be slow.
*   **Tesseract Not Found:** If running the backend locally (not in Docker), you must install `tesseract-ocr` and `libgl1` on your host operating system. (e.g., `sudo apt-get install tesseract-ocr libgl1`).