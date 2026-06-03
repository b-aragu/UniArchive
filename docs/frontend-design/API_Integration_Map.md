# API Integration Map

This document maps the planned frontend routes and components to the specific FastAPI backend endpoints.

## 1. Authentication (`/login`, `/register`)
*   `POST /api/auth/register` -> Creates new user account.
*   `POST /api/auth/login` (OAuth2PasswordRequestForm) -> Receives `access_token` and `refresh_token`.

## 2. Dashboard (`/dashboard`)
*   `GET /api/documents` -> Fetches recent approved documents.
*   `GET /api/users/me` -> Fetches the current user profile and role details to customize the dashboard view.

## 3. Search (`/search`)
*   `GET /api/search?q={query}` -> Triggers PostgreSQL Full-Text Search (Keyword mode).
*   `GET /api/search/semantic?query={query}` -> Triggers FAISS/SBERT Semantic Search (Semantic mode).
*   *(Future)* `GET /api/search/hybrid?query={query}` -> Triggers RRF ranking.
*   **Filters:** Both endpoints accept `course_id` and `document_type_id` query parameters populated via hierarchy dropdowns.

## 4. Upload (`/upload`)
*   `GET /api/hierarchy/courses` -> Populates the Course dropdown metadata selector.
*   `GET /api/hierarchy/document-types` -> Populates the Document Type metadata selector.
*   `POST /api/upload` -> Accepts `multipart/form-data` with the file and metadata. Returns `200 OK` with OCR results upon completion.

## 5. Document Details (`/documents/:id`)
*   `GET /api/documents/{id}` -> Fetches comprehensive metadata (title, OCR text, extraction method, uploader info).
*   `GET /api/documents/{id}/download` -> Triggers binary file download.
*   `DELETE /api/documents/{id}` -> Deletes the document (visible only if User is uploader or Admin/Moderator).

## 6. Admin Panel (`/admin`)
*   `GET /api/admin/users` -> Fetches list of all registered users.
*   `PUT /api/admin/users/{id}/role` -> Updates a user's authorization role.
*   `GET /api/admin/reports/system-stats` -> Fetches global upload, search, and OCR success metrics.

## 7. Moderator Panel (`/moderator`)
*   `GET /api/documents?is_approved=false` -> Fetches documents pending review.
*   `PUT /api/documents/{id}/approve` -> Marks a document as approved and visible to standard students.
