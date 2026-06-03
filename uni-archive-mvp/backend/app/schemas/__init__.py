"""
Pydantic schemas registry.
"""
from app.schemas.user import RoleOut, UserCreate, UserDetail, UserOut
from app.schemas.hierarchy import (
    AcademicYearCreate,
    AcademicYearOut,
    CourseCreate,
    CourseDetail,
    CourseOut,
    DepartmentCreate,
    DepartmentDetail,
    DepartmentOut,
    DocumentTypeCreate,
    DocumentTypeOut,
    FacultyCreate,
    FacultyDetail,
    FacultyOut,
    SemesterCreate,
    SemesterDetail,
    SemesterOut,
    UniversityCreate,
    UniversityOut,
)
from app.schemas.document import (
    DocumentCreate,
    DocumentDetail,
    DocumentOut,
    PaginatedDocuments,
    SearchResult,
)
from app.schemas.tracking import (
    AuditLogOut,
    DuplicatePairOut,
    FeedbackCreate,
    FeedbackOut,
    SearchLogCreate,
    SearchLogOut,
)

__all__ = [
    # User & Role
    "RoleOut",
    "UserCreate",
    "UserOut",
    "UserDetail",
    # Hierarchy
    "UniversityCreate",
    "UniversityOut",
    "FacultyCreate",
    "FacultyOut",
    "FacultyDetail",
    "DepartmentCreate",
    "DepartmentOut",
    "DepartmentDetail",
    "CourseCreate",
    "CourseOut",
    "CourseDetail",
    "AcademicYearCreate",
    "AcademicYearOut",
    "SemesterCreate",
    "SemesterOut",
    "SemesterDetail",
    "DocumentTypeCreate",
    "DocumentTypeOut",
    # Document
    "DocumentCreate",
    "DocumentOut",
    "DocumentDetail",
    "SearchResult",
    "PaginatedDocuments",
    # Tracking
    "SearchLogCreate",
    "SearchLogOut",
    "FeedbackCreate",
    "FeedbackOut",
    "DuplicatePairOut",
    "AuditLogOut",
]
