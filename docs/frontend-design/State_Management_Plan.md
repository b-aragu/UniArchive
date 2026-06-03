# State Management & Authentication Flow

## 1. Authentication Strategy (JWT)

The frontend will use React Context (`AuthContext`) to manage the global authentication state.

### A. JWT Storage
*   **Access Token:** Stored in memory (React State) to prevent XSS attacks.
*   **Refresh Token:** Stored in an `HttpOnly` Secure cookie (preferred) or `localStorage` (fallback MVP) to persist sessions across browser reloads.

### B. Axios Interceptors
All API requests will be routed through a customized Axios instance (`api/client.ts`).
*   **Request Interceptor:** Automatically attaches `Authorization: Bearer <token>` to the headers of outgoing requests.
*   **Response Interceptor:** Listens for `401 Unauthorized` responses. If caught, it pauses the request queue, fires a request to `/api/auth/refresh` using the refresh token, updates the access token in memory, and replays the paused requests. If the refresh fails, it triggers the Logout Flow.

## 2. Authentication Flows

### A. Login Flow
1.  User submits credentials via `/login`.
2.  Backend verifies password hash and returns `access_token` and `user_data`.
3.  `AuthContext` updates, setting `isAuthenticated = true` and `user = {role: "student"}`.
4.  React Router navigates the user to `/dashboard`.

### B. Logout Flow
1.  User clicks Logout in the TopNav.
2.  `AuthContext` clears the in-memory access token.
3.  `localStorage` (or cookies) are wiped of the refresh token.
4.  React Router redirects the user to `/login`.

## 3. Role-Based Routing (RBAC)

The `AuthContext` exposes the `user.role` property. Two wrapper components handle route protection:

*   **`<ProtectedRoute>`:** Checks if `isAuthenticated === true`. If false, `<Navigate to="/login" />`.
*   **`<RoleRoute allowedRoles={['admin']}>`:** Checks if `isAuthenticated === true` AND `allowedRoles.includes(user.role)`. If false, `<Navigate to="/dashboard" />` or renders an Unauthorized error boundary.

## 4. Local State (Non-Global)
To prevent over-engineering, standard application state will be kept local to components:
*   **Search State:** The query string, selected filters, and results array will live inside `SearchPage.tsx` using `useState`.
*   **Upload State:** The upload progress integer (`0-100`) and the `isUploading` boolean will live inside `UploadPage.tsx`.
