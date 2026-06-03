"""
Seed script for initial lookup data.

Populates:
- Roles (Student, Moderator, Administrator)
- Document Types (Exam, CAT, Assignment, Notes, Lecture Slides, Lab Report)
- A sample university with faculties, departments, and courses

Usage:
    cd backend
    source .venv/bin/activate
    python -m app.db.seed
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.models import (
    AcademicYear,
    Course,
    Department,
    DocumentType,
    Faculty,
    Role,
    Semester,
    University,
)


def seed_roles(db):
    """Seed the three required roles."""
    roles_data = [
        {"name": "student", "description": "Regular student user. Can upload, search, and download documents."},
        {"name": "moderator", "description": "Can review, approve, and reject uploaded documents."},
        {"name": "administrator", "description": "Full system access. Can manage users, roles, and all content."},
    ]
    for data in roles_data:
        existing = db.query(Role).filter_by(name=data["name"]).first()
        if not existing:
            db.add(Role(**data))
            print(f"  ✓ Role: {data['name']}")
        else:
            print(f"  ○ Role already exists: {data['name']}")


def seed_document_types(db):
    """Seed standard academic document types."""
    types = [
        "Exam",
        "CAT",
        "Assignment",
        "Notes",
        "Lecture Slides",
        "Lab Report",
        "Tutorial",
        "Project Report",
    ]
    for name in types:
        existing = db.query(DocumentType).filter_by(name=name).first()
        if not existing:
            db.add(DocumentType(name=name))
            print(f"  ✓ Document Type: {name}")
        else:
            print(f"  ○ Document Type already exists: {name}")


def seed_academic_hierarchy(db):
    """Seed a sample university structure for demo and development."""

    # University
    uni = db.query(University).filter_by(code="UON").first()
    if not uni:
        uni = University(name="University of Nairobi", code="UON")
        db.add(uni)
        db.flush()
        print("  ✓ University: University of Nairobi (UON)")
    else:
        print("  ○ University already exists: UON")

    # Faculty
    faculty = db.query(Faculty).filter_by(name="Faculty of Science and Technology").first()
    if not faculty:
        faculty = Faculty(name="Faculty of Science and Technology", university_id=uni.id)
        db.add(faculty)
        db.flush()
        print("  ✓ Faculty: Faculty of Science and Technology")
    else:
        print("  ○ Faculty already exists")

    # Departments
    departments_data = [
        {"name": "Computer Science", "code": "CS"},
        {"name": "Mathematics", "code": "MATH"},
        {"name": "Information Technology", "code": "IT"},
    ]
    departments = {}
    for data in departments_data:
        dept = db.query(Department).filter_by(code=data["code"]).first()
        if not dept:
            dept = Department(**data, faculty_id=faculty.id)
            db.add(dept)
            db.flush()
            print(f"  ✓ Department: {data['name']} ({data['code']})")
        else:
            print(f"  ○ Department already exists: {data['code']}")
        departments[data["code"]] = dept

    # Courses
    courses_data = [
        {"code": "CS101", "name": "Introduction to Computer Science", "dept": "CS"},
        {"code": "CS201", "name": "Data Structures and Algorithms", "dept": "CS"},
        {"code": "CS301", "name": "Database Systems", "dept": "CS"},
        {"code": "CS302", "name": "Software Engineering", "dept": "CS"},
        {"code": "CS401", "name": "Artificial Intelligence", "dept": "CS"},
        {"code": "CS402", "name": "Computer Networks", "dept": "CS"},
        {"code": "IT101", "name": "Fundamentals of Information Technology", "dept": "IT"},
        {"code": "IT201", "name": "Web Development", "dept": "IT"},
        {"code": "MATH101", "name": "Calculus I", "dept": "MATH"},
        {"code": "MATH201", "name": "Linear Algebra", "dept": "MATH"},
    ]
    for data in courses_data:
        existing = db.query(Course).filter_by(code=data["code"]).first()
        if not existing:
            db.add(Course(code=data["code"], name=data["name"], department_id=departments[data["dept"]].id))
            print(f"  ✓ Course: {data['code']} — {data['name']}")
        else:
            print(f"  ○ Course already exists: {data['code']}")


def seed_academic_years(db):
    """Seed academic years and semesters."""
    years_data = [
        {"label": "2022/2023", "start_year": 2022, "end_year": 2023},
        {"label": "2023/2024", "start_year": 2023, "end_year": 2024},
        {"label": "2024/2025", "start_year": 2024, "end_year": 2025},
        {"label": "2025/2026", "start_year": 2025, "end_year": 2026},
    ]

    for data in years_data:
        ay = db.query(AcademicYear).filter_by(label=data["label"]).first()
        if not ay:
            ay = AcademicYear(**data)
            db.add(ay)
            db.flush()
            print(f"  ✓ Academic Year: {data['label']}")
        else:
            print(f"  ○ Academic Year already exists: {data['label']}")

        # Create semesters for each year
        for sem_label in ["Semester 1", "Semester 2", "Semester 3"]:
            existing = (
                db.query(Semester)
                .filter_by(label=sem_label, academic_year_id=ay.id)
                .first()
            )
            if not existing:
                db.add(Semester(label=sem_label, academic_year_id=ay.id))
                print(f"    ✓ Semester: {data['label']} → {sem_label}")
            else:
                print(f"    ○ Semester already exists: {data['label']} → {sem_label}")


def main():
    print("\n🌱 UniArchive Database Seed Script")
    print("=" * 50)

    db = SessionLocal()
    try:
        print("\n📌 Seeding Roles...")
        seed_roles(db)

        print("\n📌 Seeding Document Types...")
        seed_document_types(db)

        print("\n📌 Seeding Academic Hierarchy...")
        seed_academic_hierarchy(db)

        print("\n📌 Seeding Academic Years & Semesters...")
        seed_academic_years(db)

        db.commit()
        print("\n✅ Seed completed successfully!")
        print("=" * 50)
    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
