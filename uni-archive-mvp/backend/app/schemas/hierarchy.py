"""
Pydantic schemas for the academic hierarchy: University, Faculty, Department, Course.
Used for API request/response serialization and validation.
"""
from __future__ import annotations
from uuid import UUID

from pydantic import BaseModel, Field


# ========================
# University
# ========================
class UniversityCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, examples=["University of Nairobi"])
    code: str = Field(..., min_length=2, max_length=50, examples=["UON"])


class UniversityOut(BaseModel):
    id: UUID
    name: str
    code: str

    class Config:
        from_attributes = True


# ========================
# Faculty
# ========================
class FacultyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, examples=["Faculty of Science and Technology"])
    university_id: UUID


class FacultyOut(BaseModel):
    id: UUID
    name: str
    university_id: UUID

    class Config:
        from_attributes = True


class FacultyDetail(FacultyOut):
    university: UniversityOut | None = None


# ========================
# Department
# ========================
class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, examples=["Computer Science"])
    code: str = Field(..., min_length=2, max_length=50, examples=["CS"])
    faculty_id: UUID


class DepartmentOut(BaseModel):
    id: UUID
    name: str
    code: str
    faculty_id: UUID

    class Config:
        from_attributes = True


class DepartmentDetail(DepartmentOut):
    faculty: FacultyOut | None = None


# ========================
# Course
# ========================
class CourseCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50, examples=["CS101"])
    name: str = Field(..., min_length=2, max_length=255, examples=["Introduction to Computer Science"])
    department_id: UUID


class CourseOut(BaseModel):
    id: UUID
    code: str
    name: str
    department_id: UUID

    class Config:
        from_attributes = True


class CourseDetail(CourseOut):
    department: DepartmentOut | None = None


# ========================
# Academic Year
# ========================
class AcademicYearCreate(BaseModel):
    label: str = Field(..., min_length=4, max_length=20, examples=["2024/2025"])
    start_year: int = Field(..., ge=2000, le=2100, examples=[2024])
    end_year: int = Field(..., ge=2000, le=2100, examples=[2025])


class AcademicYearOut(BaseModel):
    id: UUID
    label: str
    start_year: int
    end_year: int

    class Config:
        from_attributes = True


# ========================
# Semester
# ========================
class SemesterCreate(BaseModel):
    label: str = Field(..., min_length=2, max_length=50, examples=["Semester 1"])
    academic_year_id: UUID


class SemesterOut(BaseModel):
    id: UUID
    label: str
    academic_year_id: UUID

    class Config:
        from_attributes = True


class SemesterDetail(SemesterOut):
    academic_year: AcademicYearOut | None = None


# ========================
# Document Type
# ========================
class DocumentTypeCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Exam"])


class DocumentTypeOut(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True
