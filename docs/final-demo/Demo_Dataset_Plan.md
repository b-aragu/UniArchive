# Demo Dataset Plan

To properly evaluate UniArchive during the final demo, a realistic, highly curated dataset representing a standard academic environment will be seeded into the system. 

## 1. Academic Hierarchy (Seed Data)
*   **Departments:** Computer Science (CS), Information Technology (IT), Mathematics (MATH).
*   **Courses:** 
    *   CS201 (Data Structures)
    *   CS304 (Operating Systems)
    *   IT401 (Computer Networks)
    *   MATH101 (Linear Algebra)

## 2. Document Categories
The dataset must include various academic document formats to prove the robustness of the OCR and Search pipelines.
*   Exams
*   CATs (Continuous Assessment Tests)
*   Assignments
*   Notes (Lecture Slides)
*   Tutorials
*   Lab Reports
*   Project Reports

## 3. Sample Records & Typologies

### A. Digital PDFs (Perfect Extraction)
*   `CS304_OS_Lecture_3_Memory_Management.pdf` (Notes)
*   `IT401_Networks_Assignment_1.pdf` (Assignment)
*   `MATH101_Linear_Algebra_Tutorial_2.pdf` (Tutorial)

### B. Scanned PDFs (Tesseract OCR Required)
*   `CS201_Data_Structures_Past_Exam_2024.pdf` (Exam - Scan of a physical paper)
*   `MATH101_CAT_1_Handwritten.pdf` (CAT - Noisy scan)

### C. Image Uploads (OpenCV Preprocessing Required)
*   `CS304_OS_Whiteboard_Diagram.jpg` (Notes)
*   `IT401_Lab_Topology_Screenshot.png` (Lab Report)

## 4. File Naming & Metadata Strategy
*   Files should be named descriptively on the host machine for easy identification.
*   **Metadata Upload Strategy:** Each file will be uploaded with specific tags:
    *   `title`: Human readable (e.g., "Operating Systems 2024 Final Exam")
    *   `course_id`: Mapped exactly to the seeded UUID for the course.
    *   `document_type_id`: Mapped to the specific category.
*   **Noise Injection:** At least two documents will feature low contrast, skew, or watermarks to demonstrate the OpenCV preprocessing filters in action during the live OCR pipeline execution.
