# Database Dictionary

This document details the structures of all tables deployed in the **UniArchive** database.

---

## 1. Authentication Layer

### 1.1 roles
Defines system authorization groups.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `name` | `VARCHAR` | Unique | `NOT NULL`, Unique | Name of the role (e.g. `student`). |
| `description` | `TEXT` | Nullable | None | Details about role privileges. |

---

### 1.2 users
User accounts and profile references.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `email` | `VARCHAR` | Unique | `NOT NULL`, Unique | Primary login email. |
| `password_hash` | `VARCHAR` | | `NOT NULL` | Salled Bcrypt password hash. |
| `full_name` | `VARCHAR` | Nullable | None | User's full name. |
| `role_id` | `UUID` | FK | `NOT NULL`, Ref: `roles.id`, `ON DELETE RESTRICT` | Access privileges reference. |
| `is_active` | `BOOLEAN` | | `NOT NULL`, Default: `TRUE` | Controls login access. |
| `created_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Registration date. |
| `updated_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Profile modification date. |

---

## 2. Academic Layer

### 2.1 universities
Top-level institution context.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `name` | `VARCHAR` | Unique | `NOT NULL`, Unique | Full university name. |
| `code` | `VARCHAR` | Unique | `NOT NULL`, Unique | Code abbreviation (e.g., `UON`). |

---

### 2.2 faculties
Divisions within a university.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `name` | `VARCHAR` | | `NOT NULL` | Faculty name. |
| `university_id` | `UUID` | FK | `NOT NULL`, Ref: `universities.id`, `ON DELETE CASCADE` | Parent university. |

---

### 2.3 departments
Focus areas within a faculty.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `name` | `VARCHAR` | | `NOT NULL` | Department name. |
| `code` | `VARCHAR` | Unique | `NOT NULL`, Unique | Department shorthand code. |
| `faculty_id` | `UUID` | FK | `NOT NULL`, Ref: `faculties.id`, `ON DELETE CASCADE` | Parent faculty. |

---

### 2.4 courses
Academic course units.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `code` | `VARCHAR` | Unique | `NOT NULL`, Unique | Course code (e.g. `CS302`). |
| `name` | `VARCHAR` | | `NOT NULL` | Course title. |
| `department_id` | `UUID` | FK | `NOT NULL`, Ref: `departments.id`, `ON DELETE CASCADE` | Parent department. |

---

## 3. Documents & Classification Layer

### 3.1 academic_years
Academic calendar boundaries.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `label` | `VARCHAR` | Unique | `NOT NULL`, Unique | Label name (e.g., `2025/2026`). |
| `start_year` | `INTEGER` | | `NOT NULL` | Period start year. |
| `end_year` | `INTEGER` | | `NOT NULL` | Period end year. |

---

### 3.2 semesters
Term divisions of academic years.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `label` | `VARCHAR` | | `NOT NULL` | Semester name (e.g., `Semester 1`). |
| `academic_year_id` | `UUID` | FK | `NOT NULL`, Ref: `academic_years.id`, `ON DELETE CASCADE` | Parent academic year. |

---

### 3.3 document_types
Document classifications.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `name` | `VARCHAR` | Unique | `NOT NULL`, Unique | Classification name (e.g. `Exam`). |

---

### 3.4 documents
Academic paper catalog metadata.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `title` | `VARCHAR` | | `NOT NULL` | Document title. |
| `course_id` | `UUID` | FK, Nullable | Ref: `courses.id`, `ON DELETE SET NULL` | Linked course unit. |
| `semester_id` | `UUID` | FK, Nullable | Ref: `semesters.id`, `ON DELETE SET NULL` | Linked semester. |
| `document_type_id` | `UUID` | FK, Nullable | Ref: `document_types.id`, `ON DELETE SET NULL` | Linked document type. |
| `uploaded_by` | `UUID` | FK, Nullable | Ref: `users.id`, `ON DELETE SET NULL` | Uploading user. |
| `file_path` | `VARCHAR` | | `NOT NULL` | Absolute file path on disk. |
| `original_filename` | `VARCHAR` | | `NOT NULL` | Original filename on upload. |
| `mime_type` | `VARCHAR` | Nullable | None | File MIME type (e.g. `application/pdf`). |
| `file_size` | `BIGINT` | Nullable | None | Size of file in bytes. |
| `ocr_text` | `TEXT` | Nullable | None | Extracted text contents. |
| `ocr_confidence` | `FLOAT` | Nullable | None | Average confidence score of OCR. |
| `phash` | `VARCHAR` | Nullable | None | Perceptual hash for duplicate checks. |
| `status` | `VARCHAR` | | `NOT NULL`, Default: `'pending'` | Processing status (e.g., `'processed'`). |
| `is_approved` | `BOOLEAN` | | `NOT NULL`, Default: `FALSE` | Approved state for searches. |
| `created_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Creation time. |
| `updated_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Last update time. |
| `search_vector` | `TSVECTOR` | | Generated Always Stored | Inverted FTS vector column. |

---

## 4. Metadata & Logs Layer

### 4.1 embeddings
Chunk vectors for semantic searches.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `document_id` | `UUID` | FK | `NOT NULL`, Ref: `documents.id`, `ON DELETE CASCADE` | Source document. |
| `chunk_index` | `INTEGER` | | `NOT NULL` | Segment index offset. |
| `chunk_text` | `TEXT` | | `NOT NULL` | Segment text snippet. |
| `vector` | `BYTEA` | | `NOT NULL` | Serialized 384-dimensional vector. |
| `created_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Generation date. |

---

### 4.2 search_logs
Query analytic tracking records.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `user_id` | `UUID` | FK, Nullable | Ref: `users.id`, `ON DELETE SET NULL` | Searching user. |
| `query_text` | `TEXT` | | `NOT NULL` | Query string. |
| `search_type` | `VARCHAR` | | `NOT NULL` | Type (e.g. `'keyword'`). |
| `result_count` | `INTEGER` | | `NOT NULL` | Number of documents returned. |
| `response_time_ms` | `FLOAT` | | `NOT NULL` | Query execution time. |
| `created_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Execution time. |

---

### 4.3 feedback
Document reviews and quality reports.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `user_id` | `UUID` | FK, Nullable | Ref: `users.id`, `ON DELETE SET NULL` | Submitting user. |
| `document_id` | `UUID` | FK | `NOT NULL`, Ref: `documents.id`, `ON DELETE CASCADE` | Target document. |
| `rating` | `INTEGER` | | `NOT NULL` | Rating value between 1 and 5. |
| `comment` | `TEXT` | Nullable | None | Review message. |
| `created_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Submission time. |

---

### 4.4 duplicate_pairs
Visual/textual duplicates reporting.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `document_a_id` | `UUID` | FK | `NOT NULL`, Ref: `documents.id`, `ON DELETE CASCADE` | First document. |
| `document_b_id` | `UUID` | FK | `NOT NULL`, Ref: `documents.id`, `ON DELETE CASCADE` | Second duplicate document. |
| `similarity_score` | `FLOAT` | | `NOT NULL` | Perceptual resemblance percentage. |
| `detection_method` | `VARCHAR` | | `NOT NULL` | Method (e.g., `'phash'`). |
| `detected_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Detection timestamp. |

---

### 4.5 audit_logs
Immutable record of administrative actions.

| Column | Type | Keys/Null | Constraints | Description |
|:---|:---|:---:|:---|:---|
| `id` | `UUID` | PK | `NOT NULL`, Default: `gen_random_uuid()` | Unique primary key. |
| `user_id` | `UUID` | FK, Nullable | Ref: `users.id`, `ON DELETE SET NULL` | Performing user. |
| `action` | `VARCHAR` | | `NOT NULL` | Description of action (e.g., `'approve'`). |
| `entity_type` | `VARCHAR` | | `NOT NULL` | Affected table. |
| `entity_id` | `UUID` | Nullable | None | ID of targeted record. |
| `details` | `JSONB` | Nullable | None | Arbitrary context details. |
| `created_at` | `TIMESTAMP` | | `NOT NULL`, Default: `utcnow()` | Transaction log timestamp. |
