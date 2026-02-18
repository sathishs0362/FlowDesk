# FlowDesk Frontend Architecture

This document describes the architecture of the frontend application in `apps/web`.

## 1. Tech Stack

- Framework: React 19 + TypeScript
- Build tool: Vite
- Routing: `react-router-dom` (BrowserRouter)
- State management: Redux Toolkit
- Server state: RTK Query (with Axios-based base query)
- Drag-and-drop: `@dnd-kit/*` (Kanban)

## 2. High-Level Architecture

The frontend follows a feature-first modular structure on top of a shared app/services layer:

1. `src/main.tsx`: app bootstrap (Redux Provider, Router, global error boundary)
2. `src/App.tsx`: route graph and top-level global UI (`TopLoadingBar`, `OfflineBanner`, `ToastContainer`)
3. `src/features/*`: domain features (auth, projects, tasks, approvals, kanban, dashboard)
4. `src/services/*`: infrastructure (HTTP client, RTK Query base API, error normalization, realtime)
5. `src/app/*`: Redux store, root reducer, global slices, middleware
6. `src/components/*`: reusable and cross-cutting UI components

## 3. Directory Layout

`apps/web/src` is organized as:

- `app/`: store setup and global slices (`ui`, `workspace`, `featureFlags`, `presence`)
- `features/`: feature modules with pages/components/hooks/api files
- `services/`: API client and infrastructure adapters
- `routes/`: route guards (`ProtectedRoute`)
- `layouts/`: app shell layout (`DashboardLayout`)
- `security/`: permission matrix and access checks
- `hooks/`: reusable hooks wrapping auth, workspace, permissions, network state, Redux
- `components/`: generic UI and global UX components
- `types/`: API/domain type contracts used across modules

## 4. Application Bootstrap Flow

From `src/main.tsx`:

1. Create Redux store from `app/store.ts`
2. Initialize Axios interceptors via `setupAxiosInterceptors(store)`
3. Initialize realtime listener via `setupRealtime(store)`
4. Render app under:
   - `StrictMode`
   - `AppErrorBoundary`
   - Redux `Provider`
   - `BrowserRouter`

## 5. Routing and Navigation

Defined in `src/App.tsx`:

- Public routes:
1. `/login`
2. `/register`

- Protected route wrapper:
1. `ProtectedRoute` checks authentication (and optional role list)
2. Redirects unauthenticated users to `/login`

- Authenticated route tree:
1. `/dashboard` uses `DashboardLayout`
2. Nested pages:
   - `/dashboard/overview`
   - `/dashboard/projects`
   - `/dashboard/tasks`
   - `/dashboard/kanban`

`DashboardLayout` is the shell containing sidebar navigation, topbar, breadcrumbs, workspace-aware presence summary, and logout action.

## 6. State Management

Redux store (`app/store.ts`) combines:

1. `api` slice (RTK Query reducer)
2. `auth` slice
3. `ui` slice (toasts)
4. `workspace` slice
5. `featureFlags` slice
6. `presence` slice

Middleware chain:

1. default RTK middleware
2. RTK Query middleware
3. custom `rtkQueryErrorMiddleware`

## 7. Data Access and API Layer

### 7.1 Base API

- `services/api.ts` defines a base RTK Query `createApi` instance
- All feature APIs inject endpoints into this base API
- Tag types: `Auth`, `Users`, `Projects`, `Tasks`, `Approvals`

### 7.2 HTTP Transport

- `services/axios.ts` creates `apiClient` with `env.API_URL`
- Request interceptor:
1. reads token from Redux/auth storage
2. checks JWT expiry
3. attaches `Authorization: Bearer <token>`
- Response interceptor:
1. normalizes API errors
2. logs failures
3. logs user out on `401`

### 7.3 Base Query Behavior

`services/baseQuery.ts` provides RTK Query base query over Axios with:

1. offline guard for non-GET mutations
2. retry/backoff for network and `5xx` failures
3. standardized normalized error object

### 7.4 Feature API Modules

- `features/auth/auth.api.ts`: login/register mutations
- `features/projects/projects.api.ts`: project list/create
- `features/tasks/tasks.api.ts`: task list/feed/create/status update
- `features/approvals/approvals.api.ts`: approvals by task
- `services/users.api.ts`: users list

## 8. Realtime and Presence

`services/realtime.ts` manages WebSocket lifecycle:

1. connects to `env.WS_URL` using current auth token
2. reconnects with delay on disconnect
3. reacts to events:
   - task updates: invalidate task cache tags
   - approval updates: invalidate approvals tags
   - presence updates: update `presence` slice
   - notifications: push toast

Presence state:

- `presence.projectViewers: Record<projectId, userNames[]>`
- `presence.taskEditors: Record<taskId, userNames[]>`

## 9. Security Model (Frontend)

### 9.1 Authentication

- Auth token and user state stored in `features/auth/auth.slice.ts`
- Persistence via `auth.storage.ts`
- `useAuth()` exposes `isAuthenticated`, `user`, `role`, `token`

### 9.2 Authorization

- Role-permission matrix in `security/permissions.ts`
- `usePermission()` evaluates permissions using role + workspace scoped permissions
- `AccessGuard` conditionally renders UI by required permission
- Route-level auth enforced by `ProtectedRoute`

## 10. Feature Module Responsibilities

1. Auth:
   - login/register forms and pages
   - auth session state and persistence
2. Projects:
   - project listing and create form
3. Tasks:
   - paginated/filterable task list
   - task create flow
   - optimistic task status mutation across cached queries
4. Kanban:
   - status-column board with drag/drop
   - transition validation by role/rules
   - batch task movement and dependency checks
5. Approvals:
   - fetch approval history per task
6. Dashboard:
   - overview entry page within authenticated shell

## 11. Cross-Cutting UX Concerns

1. Error boundary at app root (`AppErrorBoundary`)
2. Global toast notifications (`ToastContainer` + `ui` slice)
3. Offline indicator (`OfflineBanner`) and offline mutation guard
4. Loading progress (`TopLoadingBar`)
5. Navigation breadcrumbs (`Breadcrumbs`)

## 12. Environment and Configuration

Frontend runtime config (`config/env.ts`):

1. `VITE_API_URL` (default `http://localhost:5000/api`)
2. `VITE_WS_URL` (default `ws://localhost:5000/ws`)
3. `VITE_LOG_LEVEL`
4. feature flags:
   - `VITE_FLAG_REALTIME`
   - `VITE_FLAG_PRESENCE`
   - `VITE_FLAG_ANALYTICS`
   - `VITE_FLAG_OFFLINE_QUEUE`

## 13. Data Flow Summary

Primary request path:

1. Page/Component triggers hook or mutation
2. Feature API endpoint executes via RTK Query
3. Axios base query sends request with auth token
4. Response transformed into typed domain data
5. Redux/RTK Query cache updates UI
6. Realtime events invalidate/patch cache for eventual consistency
