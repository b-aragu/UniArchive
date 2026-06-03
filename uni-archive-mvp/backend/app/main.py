from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

# Import all models so relationships resolve (Alembic also needs this)
import app.models  # noqa: F401

# NOTE: Database tables are now managed by Alembic migrations.
# Run: cd backend && alembic upgrade head

app = FastAPI(
    title="UNI ARCHIVE API",
    description="Intelligent Academic Document Retrieval System with OCR and Semantic Search.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "UNI ARCHIVE API"}