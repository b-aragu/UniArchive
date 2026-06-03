# API Documentation

This document describes the API endpoints for the **UniArchive** backend. 

All request and response payloads use JSON format (except file uploads which use `multipart/form-data`). Date-time values follow ISO 8601 representation.

---

## 1. Authentication Endpoints

### 1.1 User Registration
Create a new user account. Defaults to the `student` role if no specific role ID is provided.

* **URL:** `/api/auth/register`
* **Method:** `POST`
* **Authentication:** None (Public)
* **Request Body (JSON):**
  ```json
  {
    "email": "user@university.edu",
    "password": "SecurePassword123",
    "full_name": "Jane Doe",
    "role_id": null
  }
  ```
* **Response Body (`201 Created`):**
  ```json
  {
    "id": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
    "email": "user@university.edu",
    "full_name": "Jane Doe",
    "role_id": "4020a1df-b8a7-47b2-a720-33bf3d778d91",
    "is_active": true,
    "created_at": "2026-06-03T11:15:00Z"
  }
  ```
* **Errors:**
  * `400 Bad Request`: Email already exists.

---

### 1.2 User Login
Authenticate credentials and issue JSON Web Tokens.

* **URL:** `/api/auth/login`
* **Method:** `POST`
* **Authentication:** None (Public)
* **Request Body (`application/x-www-form-urlencoded`):**
  * `username`: `user@university.edu`
  * `password`: `SecurePassword123`
* **Response Body (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
      "email": "user@university.edu",
      "full_name": "Jane Doe",
      "role": "student"
    }
  }
  ```
* **Errors:**
  * `401 Unauthorized`: Incorrect email or password.

---

### 1.3 Refresh Token
Issue a new access token using a valid refresh token.

* **URL:** `/api/auth/refresh`
* **Method:** `POST`
* **Authentication:** None (Public)
* **Query Parameters:**
  * `refresh_token` (string): The refresh token.
* **Response Body (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```
* **Errors:**
  * `401 Unauthorized`: Invalid or expired refresh token.

---

### 1.4 Get Profile
Retrieve details of the currently authenticated user.

* **URL:** `/api/auth/me`
* **Method:** `GET`
* **Authentication:** Bearer Token
* **Response Body (`200 OK`):**
  ```json
  {
    "id": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
    "email": "user@university.edu",
    "full_name": "Jane Doe",
    "role_id": "4020a1df-b8a7-47b2-a720-33bf3d778d91",
    "is_active": true,
    "created_at": "2026-06-03T11:15:00Z"
  }
  ```

---

## 2. Administration Endpoints

### 2.1 List Users
Retrieve a list of registered users.

* **URL:** `/api/admin/users`
* **Method:** `GET`
* **Authentication:** Bearer Token (Admin Role Required)
* **Query Parameters:**
  * `skip` (int, default: 0): Skip offset.
  * `limit` (int, default: 100): Limit size.
* **Response Body (`200 OK`):**
  ```json
  [
    {
      "id": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
      "email": "user@university.edu",
      "full_name": "Jane Doe",
      "role_id": "4020a1df-b8a7-47b2-a720-33bf3d778d91",
      "is_active": true,
      "created_at": "2026-06-03T11:15:00Z",
      "role": {
        "id": "4020a1df-b8a7-47b2-a720-33bf3d778d91",
        "name": "student",
        "description": "Regular student user"
      }
    }
  ]
  ```

---

### 2.2 System Statistics
Retrieve aggregated data about system usage.

* **URL:** `/api/admin/reports/system-stats`
* **Method:** `GET`
* **Authentication:** Bearer Token (Admin Role Required)
* **Response Body (`200 OK`):**
  ```json
  {
    "users": {
      "total": 45
    },
    "documents": {
      "total": 120,
      "approved": 112,
      "pending": 8
    },
    "searches": {
      "total": 340,
      "breakdown": {
        "keyword": 280,
        "semantic": 60
      }
    }
  }
  ```

---

## 3. Document Endpoints

### 3.1 List Documents
Retrieve a paginated list of approved documents. Can be filtered by course or type.

* **URL:** `/api/documents`
* **Method:** `GET`
* **Authentication:** Bearer Token
* **Query Parameters:**
  * `skip` (int, default: 0)
  * `limit` (int, default: 20)
  * `course_id` (UUID, optional)
  * `document_type_id` (UUID, optional)
* **Response Body (`200 OK`):**
  ```json
  {
    "items": [
      {
        "id": "a90a23bc-5e3e-4b47-b892-23fcfd8c1122",
        "title": "CS302 Compiler Design Exam 2025",
        "course_id": "802bbd2f-a189-4ef2-ba20-993ffd7782ac",
        "semester_id": "cd0b2ad3-28ad-482a-a92c-88bfda77da41",
        "document_type_id": "b1cd2ac3-ad82-4fbc-b82d-99fdba7792ae",
        "uploaded_by": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
        "file_path": "uploads/a90a23bc...pdf",
        "original_filename": "compiler_design_2025.pdf",
        "mime_type": "application/pdf",
        "file_size": 1245000,
        "ocr_confidence": 0.88,
        "status": "processed",
        "is_approved": true,
        "created_at": "2026-06-03T11:20:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20,
    "total_pages": 1
  }
  ```

---

### 3.2 Upload Document
Upload a new document file with academic metadata.

* **URL:** `/api/upload`
* **Method:** `POST`
* **Authentication:** Bearer Token
* **Request Body (`multipart/form-data`):**
  * `file` (binary file): The document (PDF/Image).
  * `title` (string): Title of the document.
  * `course_id` (UUID, optional)
  * `semester_id` (UUID, optional)
  * `document_type_id` (UUID, optional)
* **Response Body (`200 OK`):**
  ```json
  {
    "id": "a90a23bc-5e3e-4b47-b892-23fcfd8c1122",
    "title": "CS302 Compiler Design Exam 2025",
    "course_id": "802bbd2f-a189-4ef2-ba20-993ffd7782ac",
    "semester_id": "cd0b2ad3-28ad-482a-a92c-88bfda77da41",
    "document_type_id": "b1cd2ac3-ad82-4fbc-b82d-99fdba7792ae",
    "uploaded_by": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
    "file_path": "uploads/a90a23bc...pdf",
    "original_filename": "compiler_design_2025.pdf",
    "mime_type": "application/pdf",
    "file_size": 1245000,
    "ocr_confidence": 0.88,
    "status": "processed",
    "is_approved": false,
    "created_at": "2026-06-03T11:20:00Z"
  }
  ```

---

### 3.3 Search Documents
Perform full-text keyword search.

* **URL:** `/api/search`
* **Method:** `GET`
* **Authentication:** Bearer Token
* **Query Parameters:**
  * `q` (string, optional): Search query.
  * `course_id` (UUID, optional)
  * `document_type_id` (UUID, optional)
* **Response Body (`200 OK`):**
  ```json
  [
    {
      "id": "a90a23bc-5e3e-4b47-b892-23fcfd8c1122",
      "title": "CS302 Compiler Design Exam 2025",
      "course_id": "802bbd2f-a189-4ef2-ba20-993ffd7782ac",
      "semester_id": "cd0b2ad3-28ad-482a-a92c-88bfda77da41",
      "document_type_id": "b1cd2ac3-ad82-4fbc-b82d-99fdba7792ae",
      "uploaded_by": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
      "file_path": "uploads/a90a23bc...pdf",
      "original_filename": "compiler_design_2025.pdf",
      "mime_type": "application/pdf",
      "file_size": 1245000,
      "ocr_confidence": 0.88,
      "status": "processed",
      "is_approved": true,
      "created_at": "2026-06-03T11:20:00Z",
      "snippet": "...syntax directed translation in compiler design exam...",
      "relevance_score": 1.482,
      "search_type": "keyword"
    }
  ]
  ```

---

### 3.4 Get Document Details
Retrieve the details of a specific document, including foreign key relation records.

* **URL:** `/api/documents/{id}`
* **Method:** `GET`
* **Authentication:** Bearer Token
* **Response Body (`200 OK`):**
  ```json
  {
    "id": "a90a23bc-5e3e-4b47-b892-23fcfd8c1122",
    "title": "CS302 Compiler Design Exam 2025",
    "course_id": "802bbd2f-a189-4ef2-ba20-993ffd7782ac",
    "semester_id": "cd0b2ad3-28ad-482a-a92c-88bfda77da41",
    "document_type_id": "b1cd2ac3-ad82-4fbc-b82d-99fdba7792ae",
    "uploaded_by": "1c3c9c6f-a89e-4eb5-8e2b-2f31a1e7b1a2",
    "file_path": "uploads/a90a23bc...pdf",
    "original_filename": "compiler_design_2025.pdf",
    "mime_type": "application/pdf",
    "file_size": 1245000,
    "ocr_text": "Extracted text content from the compiler design exam...",
    "ocr_confidence": 0.88,
    "status": "processed",
    "is_approved": true,
    "created_at": "2026-06-03T11:20:00Z",
    "course": {
      "id": "802bbd2f-a189-4ef2-ba20-993ffd7782ac",
      "code": "CS302",
      "name": "Compiler Design"
    },
    "document_type": {
      "id": "b1cd2ac3-ad82-4fbc-b82d-99fdba7792ae",
      "name": "Exam"
    }
  }
  ```

---

### 3.5 Download Document File
Stream the actual file contents.

* **URL:** `/api/documents/{id}/download`
* **Method:** `GET`
* **Authentication:** Bearer Token
* **Response:** File stream (Binary data matching the original MIME type).
* **Errors:**
  * `404 Not Found`: Document details or binary file not found.

---

### 3.6 Delete Document
Permanently remove a document and delete its file from disk.

* **URL:** `/api/documents/{id}`
* **Method:** `DELETE`
* **Authentication:** Bearer Token (Must be owner, moderator, or admin)
* **Response Body (`204 No Content`):** None.
* **Errors:**
  * `403 Forbidden`: Not authorized to delete this document.
  * `404 Not Found`: Document not found.
