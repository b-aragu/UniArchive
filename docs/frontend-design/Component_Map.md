# Frontend Component Architecture & Wireframes

## 1. Component Hierarchy Map

```text
src/
└── components/
    ├── Layout/
    │   ├── AppShell.tsx          (Main wrapper, Sidebar, Topbar)
    │   ├── Sidebar.tsx           (Navigation links based on role)
    │   └── TopNav.tsx            (User profile dropdown, logout)
    ├── Auth/
    │   ├── LoginForm.tsx
    │   ├── RegisterForm.tsx
    │   └── ProtectedRoute.tsx    (Wrapper restricting access)
    ├── Search/
    │   ├── SearchBar.tsx         (Input field and mode toggle)
    │   ├── SearchFilters.tsx     (Course, Document Type dropdowns)
    │   ├── SearchResultCard.tsx  (Displays snippet, score, metadata)
    │   └── ModeToggle.tsx        (Keyword | Semantic | Hybrid)
    ├── Upload/
    │   ├── DropzoneArea.tsx      (Drag & Drop file input)
    │   ├── MetadataForm.tsx      (Title, Course, Semester selectors)
    │   └── ProgressTracker.tsx   (Upload & OCR status indicators)
    ├── Documents/
    │   ├── DocumentViewer.tsx    (PDF preview or download button)
    │   └── DocumentMetadata.tsx  (Tags, uploader info)
    └── Admin/
        ├── UserTable.tsx         (Data grid of users and roles)
        ├── StatsWidget.tsx       (Dashboard metric cards)
        └── ModerationQueue.tsx   (List of pending uploads)
```

## 2. Wireframe Mockups

### A. Search UI Design
```text
+---------------------------------------------------------+
| [UniArchive Logo]   Home  |  Upload  |  Search  | Admin |
+---------------------------------------------------------+
|                                                         |
|  [     Enter concept or keyword to search...      ] [Q] |
|                                                         |
|  Mode: (*) Keyword  ( ) Semantic  ( ) Hybrid (Beta)     |
|  Filter by Course: [ All ]    Type: [ Exams ]           |
|                                                         |
|  -----------------------------------------------------  |
|  RESULTS (3 found)                                      |
|  -----------------------------------------------------  |
|  [📄] Operating Systems CAT 1 (2024)                    |
|       Score: 92% | Type: Keyword Match                  |
|       "...deadlock occurs when a set of processes..."   |
|       Course: CS304 | Extracted via: PyMuPDF            |
|                                                         |
|  [📄] Advanced OS Notes - Deadlock Chapter              |
|       Score: 84% | Type: Semantic Match                 |
|       "...resource starvation leading to system halt..."|
|       Course: CS304 | Extracted via: Tesseract          |
+---------------------------------------------------------+
```

### B. Upload Workflow Design
```text
+---------------------------------------------------------+
| UPLOAD ACADEMIC DOCUMENT                                |
+---------------------------------------------------------+
|  1. Select File                                         |
|  +---------------------------------------------------+  |
|  |             Drag & Drop PDF or Image              |  |
|  |             [ Browse Local Files ]                |  |
|  +---------------------------------------------------+  |
|                                                         |
|  2. Metadata Entry                                      |
|  Title:   [____________________________________]        |
|  Course:  [ Select Course ▼ ]                           |
|  Type:    [ Select Type ▼ ]                             |
|                                                         |
|  [ Submit Document ]                                    |
|                                                         |
|  -----------------------------------------------------  |
|  STATUS:                                                |
|  [===>      ] Uploading File... (50%)                   |
|  [          ] Extracting OCR... (Waiting)               |
|  [          ] Semantic Indexing... (Waiting)            |
+---------------------------------------------------------+
```

### C. Admin & Moderation Workflow Design
```text
+---------------------------------------------------------+
| ADMIN DASHBOARD                                         |
+---------------------------------------------------------+
| [ Users: 42 ]   [ Docs: 1,024 ]   [ Pending: 3 ]        |
|                                                         |
| --- MODERATION QUEUE ---------------------------------- |
| Doc ID | Title           | Uploader | Action            |
| #102   | Fake Notes.pdf  | user_5   | [Approve] [Deny]  |
| #103   | CS Exam 2023    | user_8   | [Approve] [Deny]  |
|                                                         |
| --- USER MANAGEMENT ----------------------------------- |
| Email          | Role       | Action                    |
| john@uni.edu   | Student    | [Promote] [Ban]           |
| admin@uni.edu  | Admin      | [Edit]                  |
+---------------------------------------------------------+
```
