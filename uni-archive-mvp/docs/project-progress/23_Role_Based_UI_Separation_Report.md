# Role-Based UI Separation Report

This report documents the implementation and results of the **Role-Based UI Separation Pass** on the UniArchive platform.

---

## 1. Feature-Role Access Matrix

The following matrix maps application features to the roles authorized to access/perform them.

| Feature Area | Student | Moderator | Administrator | Backend Check |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication & Profile** |
| Register / Login | ✅ | ✅ | ✅ | Ingests role from database |
| Session Persistence | ✅ | ✅ | ✅ | LocalStorage + token validity check |
| **Document Exploration** |
| View Library Documents | ✅ | ✅ | ✅ | Enforced via `is_approved == true` filter |
| Download Document PDF | ✅ | ✅ | ✅ | `/api/documents/{id}/download` |
| View Document Details | ✅ | ✅ | ✅ | `/api/documents/{id}` |
| **Search Functionality** |
| Keyword Search | ✅ | ✅ | ✅ | Enforced via `is_approved == true` filter |
| Semantic Search | ✅ | ✅ | ✅ | Enforced via `is_approved == true` filter |
| Hybrid Search | ✅ | ✅ | ✅ | Enforced via `is_approved == true` filter |
| **Document Submission** |
| Upload Document | ✅ | ✅ | ✅ | Auto-saves with `is_approved = False` for Student |
| **Moderation Workflows** |
| Access Moderation Queue | ❌ | ✅ | ✅ | Route dependency `require_role(["moderator", "administrator"])` |
| Approve Pending Uploads | ❌ | ✅ | ✅ | `POST /api/documents/{id}/approve` |
| Reject/Delete Uploads | ❌ | ✅ | ✅ | `DELETE /api/documents/{id}` |
| View Duplicate Reports | ❌ | ✅ | ✅ | `/api/admin/duplicates` (available to mods & admins) |
| **System Administration** |
| Access Admin Panel | ❌ | ❌ | ✅ | Route dependency `require_role(["administrator"])` |
| Manage System Users | ❌ | ❌ | ✅ | `/api/admin/users` |
| View System Stats | ❌ | ❌ | ✅ | `/api/reports/system-stats` |

---

## 2. Implementation Overview

### Backend Moderation Audit
- **Audit Findings**: No pre-existing `PUT`/`PATCH` endpoints for updating document status or approvals existed. The `DELETE /api/documents/{document_id}` endpoint was already restricted to uploader/moderator/administrator and successfully removed files and database entries, making it suitable for rejection.
- **Approve Endpoint**: Added `POST /api/documents/{document_id}/approve` (restricted to `moderator` and `administrator` roles) to change status to `approved` and `is_approved = True`.
- **Exposed Endpoint Updates**: Removed global `administrator` dependency from the `/api/admin` router. Exponentiated access to `/api/admin/duplicates` to both `moderator` and `administrator`, keeping `/users` and `/reports/system-stats` restricted to `administrator`.

### Frontend Updates
1. **Sidebar Navigation**: Dynamically builds navigation links based on user role:
   - `student`: Dashboard, Documents, Search, Upload, Logout.
   - `moderator`: Dashboard, Documents, Search, Upload, Moderator Panel, Logout.
   - `administrator`: Dashboard, Documents, Search, Upload, Moderator Panel, Admin Panel, Logout.
2. **Access Control (Routes)**: Wrapped restricted routes under `<Route element={<RoleRoute allowedRoles={[...]} />}>`. Unprivileged access attempts display a custom `UnauthorizedPage` inline, preventing redirects.
3. **Role & Session Recovery**: Recover user object (including role) dynamically from `localStorage` inside `AuthContext.tsx` on page refreshes.
4. **Moderator Panel Actions**: Wired the "Approve" button to `POST /api/documents/{id}/approve` and the "Reject" button to `DELETE /api/documents/{id}` with a confirmation modal.
