# Frontend Audit and Implementation Plan

**Project:** UniArchive  
**Phase Target:** Phase 10 (Frontend Implementation)  
**Date Executed:** June 3, 2026  

---

## 1. Current Frontend Audit

### Status Overview
The current React application within `uni-archive-mvp/frontend` serves as a bare-minimum sandbox. It runs on Vite + React + TypeScript and relies on rudimentary state-based routing (`useState<Page>`) instead of a robust URL-based router.

### Identified Deficiencies (Missing Functionality)
1. **Routing:** No `react-router-dom`. The browser's URL does not update or sync with the views, preventing direct deep-linking (e.g., sharing a specific search result or document page).
2. **Authentication Flow:** Missing Login and Register pages. There is no context or global state to hold JWT access tokens or manage user sessions.
3. **API Integration:** The current `api/client.ts` uses plain `axios` but lacks JWT request interceptors, preventing authenticated calls to secure backend routes.
4. **Missing Pages:** 
   - `LoginPage.tsx` / `RegisterPage.tsx`
   - `DocumentDetail.tsx`
   - `AdminPanel.tsx` / `ModeratorPanel.tsx`
5. **UI Framework & Aesthetics:** The MVP lacks a cohesive design system (such as TailwindCSS or MUI). Modern web design standards (glassmorphism, micro-animations, structured layout grids) are currently unfulfilled.

---

## 2. Phase 10 Implementation Plan

### 2.1 Recommended Component Structure
The project should transition to a scalable React directory architecture:
```
frontend/src/
├── api/
│   └── axiosClient.ts      # Axios instance with JWT interceptors
├── components/
│   ├── Layout.tsx          # Main shell with sidebar/navbar
│   ├── ProtectedRoute.tsx  # RBAC routing wrapper
│   ├── SearchBar.tsx       # Keyword + Semantic toggle
│   └── DocumentCard.tsx    # Reusable listing item
├── context/
│   └── AuthContext.tsx     # Global auth state provider
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   ├── UserDashboard.tsx
│   │   └── AdminPanel.tsx
│   ├── documents/
│   │   ├── DocumentDetail.tsx
│   │   └── UploadPage.tsx
│   └── search/
│       └── SearchPage.tsx
└── styles/                 # Global styles or Tailwind directives
```

---

### 2.2 Page-by-Page Plan & API Integration

#### 1. Authentication Pages (Login & Register)
*   **Purpose:** Allow users to authenticate to retrieve JWT access tokens.
*   **API Endpoints:**
    *   `POST /api/auth/register`
    *   `POST /api/auth/login`
*   **Details:** Form validation, error handling for duplicate emails, token persistence via `localStorage`, and updates to the `AuthContext`.

#### 2. Dashboard
*   **Purpose:** Landing page for logged-in users to see recent uploads or pending tasks.
*   **API Endpoints:**
    *   `GET /api/documents?limit=10` (Recent documents)
*   **Details:** Role-based views. Admins see an overview widget; standard students see their upload history or recommended documents.

#### 3. Upload Page
*   **Purpose:** Submit new documents into the UniArchive OCR and Semantic embedding pipelines.
*   **API Endpoints:**
    *   `POST /api/upload` (Form-data: file, title, course_id, etc.)
*   **Details:** Dropzone for PDFs/images, visual progress indicator, and a graceful success message showing the extracted OCR metadata.

#### 4. Search Page
*   **Purpose:** The core retrieval engine UI.
*   **API Endpoints:**
    *   `GET /api/search?q={query}` (Keyword / FTS)
    *   `GET /api/search/semantic?query={query}` (Semantic vector search)
*   **Details:** 
    *   A toggle to switch between Keyword and Semantic searches (before Phase 8 Hybrid Search is introduced).
    *   Result cards displaying the document title, OCR snippet, confidence score, and extraction method.

#### 5. Document Detail Page
*   **Purpose:** Deep-dive view of a single document, showing metadata and allowing download or deletion.
*   **API Endpoints:**
    *   `GET /api/documents/{id}`
    *   `GET /api/documents/{id}/download`
    *   `DELETE /api/documents/{id}`
*   **Details:** PDF viewer integration or direct download link, displaying hierarchical metadata (Course, Department, Upload Date).

#### 6. Admin / Moderator Panels
*   **Purpose:** Tools for managing the system.
*   **API Endpoints:**
    *   `GET /api/admin/users`
    *   `GET /api/admin/reports/system-stats`
*   **Details:** Protected routes ensuring only users with valid roles can access. Data tables displaying users and system aggregate metrics.

---

### 2.3 MVP Demo Flow
For the final project presentation, the frontend should support the following seamless demo flow:
1.  **Auth:** Log in as an Administrator.
2.  **Upload:** Navigate to the Upload tab, drop a scanned PDF, and watch the system extract text and index it.
3.  **Search:** Navigate to Search, run a *Keyword Search* to show fast lexical matching. Switch to *Semantic Search* and type a conceptual query (e.g., "AI structures") to demonstrate the SBERT integration returning contextually relevant documents.
4.  **Retrieval:** Click on a search result to view the Document Details and download the original file.

---

### 2.4 Risk Notes & Mitigation
*   **CORS Issues:** The FastAPI backend must be configured to allow origins from the Vite dev server (`http://localhost:5173`).
*   **Token Expiry:** `axios` interceptors must gracefully handle 401 Unauthorized errors to either attempt a token refresh (via `/api/auth/refresh`) or redirect to `/login`.
*   **Large File Uploads:** React state needs to prevent UI freezing during large file uploads, possibly using chunked uploads or native XHR progress events.
