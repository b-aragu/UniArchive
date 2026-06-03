from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as documents_router
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin_router, prefix="/api/admin", tags=["Administration"])
app.include_router(documents_router, prefix="/api", tags=["Documents"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "UNI ARCHIVE API"}