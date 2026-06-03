# Phase 5 — Backend Implementation Report

**Phase:** Phase 5: FastAPI Backend Implementation  
**Status:** ✅ Complete  
**Date Completed:** June 3, 2026  
**Core Technologies:** FastAPI, python-jose, passlib[bcrypt], SQLAlchemy

---

## 1. Authentication & Security Architecture

Phase 5 introduced security policies, session handling, and role verification interfaces for the backend services.

### 1.1 Password Hashing
User passwords are never stored in plain text.
* **Algorithm:** Bcrypt is used via `passlib.context.CryptContext`.
* **Details:** The implementation hashes passwords with automatically generated salts during registration, making them highly resistant to dictionary and rainbow table attacks.

### 1.2 JSON Web Token (JWT) Design
Session data is decentralized using cryptographically signed tokens (`python-jose`).
* **Tokens Distributed:**
  * **Access Token:** High-frequency validation, 30-minute lifespan.
  * **Refresh Token:** Token rotation mechanism, 7-day lifespan.
* **Payload Structure:**
  ```json
  {
    "sub": "uuid-user-identifier",
    "exp": 1780410000,
    "type": "access"
  }
  ```

### 1.3 Role-Based Access Control (RBAC)
Authorizations are enforced via FastAPI dependencies.
* A dependency factory `require_role(allowed_roles)` inspects the active user context during the request pipeline.
* If the user's role is not in the allowed list, the backend immediately halts the transaction and returns a `403 Forbidden` response.

---

## 2. API Router Layout & Functionality

The endpoints are separated into logical domain routers:

```
                          +-------------------------+
                          |   FastAPI Application   |
                          +-------------------------+
                                       |
                  +--------------------+--------------------+
                  |                    |                    |
                  v                    v                    v
       +--------------------+ +--------------------+ +--------------------+
       |   /api/auth/       | |   /api/admin/      | |   /api/            |
       |  (Authentication)  | |  (Admin Controls)  | |   (Document Mgmt)  |
       +--------------------+ +--------------------+ +--------------------+
       | - /register        | | - /users           | | - /documents       |
       | - /login           | | - /reports/stats   | | - /upload          |
       | - /refresh         | |                    | | - /search          |
       | - /me              | |                    | | - /documents/{id}  |
       +--------------------+ +--------------------+ +--------------------+
```

### 2.1 Router Details

#### Authentication Router (`/api/auth`)
Handles identity creation, validation, and session extension:
* **Registration:** Default role allocation is set to `student` to ensure secure defaults.
* **Login:** Uses FastAPI's `OAuth2PasswordRequestForm` to remain compatible with standard API client libraries and the built-in Swagger UI documentation.

#### Admin Router (`/api/admin`)
Restricted to users with the `administrator` role.
* **User Management:** Provides list APIs to review registered users and roles.
* **System Metrics:** Pulls aggregated counts from the database, calculating approved/pending document counts and classifying search log usage.

#### Document Router (`/api`)
Manages academic document lifecycle, search, downloads, and deletions.
* **Upload:** Uploaded files are written with unique hash names to prevent filename collisions. Text is extracted immediately via the OCR fallback service.
* **Search:** Integrates the updated FTS service, applying a plain query match against the document search vector and sorting results by rank.
* **Delete:** Enforces strict ownership checks. Only the original uploader or administrators/moderators can delete documents.

---

## 3. Endpoints Inventory

| Method | Endpoint | Description | Auth Requirement | Role Context |
|:---:|:---|:---|:---:|:---:|
| **POST** | `/api/auth/register` | Register a new system account | Public | Anonymous |
| **POST** | `/api/auth/login` | Log in and receive access/refresh tokens | Public | Anonymous |
| **POST** | `/api/auth/refresh` | Rotate access token using refresh token | Public | Anonymous |
| **GET** | `/api/auth/me` | Fetch active user profile | Bearer Token | Any |
| **GET** | `/api/admin/users` | List all users registered in the system | Bearer Token | `administrator` |
| **GET** | `/api/admin/reports/system-stats` | System statistics (documents, search types) | Bearer Token | `administrator` |
| **GET** | `/api/documents` | Retrieve paginated documents list | Bearer Token | Any |
| **POST** | `/api/upload` | Ingest academic paper with metadata | Bearer Token | Any |
| **GET** | `/api/search` | Execute keyword search against tsvector | Bearer Token | Any |
| **GET** | `/api/documents/{id}` | Read document metadata | Bearer Token | Any |
| **GET** | `/api/documents/{id}/download` | Stream binary academic file | Bearer Token | Any |
| **DELETE** | `/api/documents/{id}` | Remove document and delete file | Bearer Token | Owner / Admin / Mod |
