import logging
from app.db.database import SessionLocal
from app.models.document import Document
from app.models.user import User
from app.models.course import Course
from app.models.semester import Semester
from app.models.document_type import DocumentType
from app.models.role import Role
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

demo_docs = [
    {
        "title": "Database Systems Notes",
        "ocr_text": "A database management system (DBMS) is software that interacts with end users, applications, and the database itself to capture and analyze the data. Relational database normalization is a crucial process to reduce data redundancy and improve data integrity. First Normal Form (1NF) requires atomicity. Third Normal Form (3NF) ensures no transitive dependencies.",
    },
    {
        "title": "Artificial Intelligence Assignment",
        "ocr_text": "Neural networks and machine learning form the backbone of modern artificial intelligence. A neural network consists of an input layer, hidden layers, and an output layer. Backpropagation is the algorithm used to train neural networks by updating weights based on the loss gradient. Support Vector Machines (SVM) are another popular ML algorithm.",
    },
    {
        "title": "Computer Networks Exam",
        "ocr_text": "The OSI model consists of 7 layers. Packet routing and network layers are responsible for directing data packets from source to destination across multiple networks. Routers operate at Layer 3 (Network Layer) and use IP addresses. TCP is connection-oriented while UDP is connectionless. Subnet masking divides a large network into smaller ones.",
    },
    {
        "title": "Linear Algebra Tutorial",
        "ocr_text": "In this tutorial, we will cover matrix operations. A matrix is a rectangular array of numbers. Matrix multiplication requires the number of columns in the first matrix to match the number of rows in the second. Eigenvalues and eigenvectors are fundamental concepts used in transformations and PCA (Principal Component Analysis).",
    },
    {
        "title": "Operating Systems CAT",
        "ocr_text": "Process scheduling is a core function of an operating system. It decides which process runs at a given time. Algorithms include First-Come, First-Served (FCFS), Shortest Job Next (SJN), and Round Robin (RR). A deadlock occurs when two or more processes wait indefinitely for a resource held by another process in the wait loop.",
    },
    {
        "title": "Software Engineering Notes",
        "ocr_text": "The software development lifecycle (SDLC) defines the phases of software development from requirements gathering to deployment and maintenance. Agile methodology emphasizes iterative development and rapid delivery. Design patterns like Singleton, Observer, and Factory are reusable solutions to common problems in software design.",
    }
]

def seed_documents():
    db = SessionLocal()
    
    # 1. Create dependencies
    role = db.query(Role).filter_by(name="student").first()
    if not role:
        role = Role(id=uuid.uuid4(), name="student", description="Student Role")
        db.add(role)
        
    user = db.query(User).filter_by(email="demo@uniarchive.com").first()
    if not user:
        user = User(
            id=uuid.uuid4(),
            email="demo@uniarchive.com",
            full_name="Demo User",
            password_hash="fake",
            role_id=role.id,
            is_active=True
        )
        db.add(user)

    course = db.query(Course).first()
    if not course:
        course = Course(id=uuid.uuid4(), code="COMP101", title="Intro to Computing")
        db.add(course)

    semester = db.query(Semester).first()
    if not semester:
        semester = Semester(id=uuid.uuid4(), name="Fall 2026")
        db.add(semester)

    doc_type = db.query(DocumentType).first()
    if not doc_type:
        doc_type = DocumentType(id=uuid.uuid4(), name="Notes")
        db.add(doc_type)

    db.commit()

    # 2. Insert documents
    inserted = 0
    for doc_data in demo_docs:
        existing = db.query(Document).filter_by(title=doc_data["title"]).first()
        if not existing:
            doc = Document(
                id=uuid.uuid4(),
                title=doc_data["title"],
                course_id=course.id,
                semester_id=semester.id,
                document_type_id=doc_type.id,
                uploaded_by=user.id,
                file_path="mock/path.pdf",
                original_filename=f"{doc_data['title'].replace(' ', '_')}.pdf",
                mime_type="application/pdf",
                file_size=1024,
                ocr_text=doc_data["ocr_text"],
                ocr_confidence=99.0,
                status="processed",
                is_approved=True
            )
            db.add(doc)
            inserted += 1

    db.commit()
    logger.info(f"Successfully inserted {inserted} demo documents.")
    db.close()

if __name__ == "__main__":
    seed_documents()
