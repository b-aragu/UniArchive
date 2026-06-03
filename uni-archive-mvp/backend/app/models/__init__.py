"""
SQLAlchemy models registry.

All models are imported here so that:
1. Alembic can discover them for auto-generation
2. Relationship back_populates resolve correctly
3. Single import point for the application
"""
from app.models.role import Role
from app.models.user import User
from app.models.university import University
from app.models.faculty import Faculty
from app.models.department import Department
from app.models.course import Course
from app.models.academic_year import AcademicYear
from app.models.semester import Semester
from app.models.document_type import DocumentType
from app.models.document import Document
from app.models.embedding import Embedding
from app.models.search_log import SearchLog
from app.models.feedback import Feedback
from app.models.duplicate_pair import DuplicatePair
from app.models.audit_log import AuditLog

__all__ = [
    "Role",
    "User",
    "University",
    "Faculty",
    "Department",
    "Course",
    "AcademicYear",
    "Semester",
    "DocumentType",
    "Document",
    "Embedding",
    "SearchLog",
    "Feedback",
    "DuplicatePair",
    "AuditLog",
]