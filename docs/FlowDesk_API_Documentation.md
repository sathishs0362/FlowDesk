# FlowDesk Backend API Documentation

This document covers backend APIs only (`apps/api`).

Base URL: `http://localhost:5000`
API Prefix: `/api`

## Authentication and Authorization

- Public routes: `/api/auth/*`, `/health`
- Protected routes: require header `Authorization: Bearer <accessToken>`
- Roles:
1. `admin`
2. `manager`
3. `employee`

## Global Response Shape

### Success

```json
{
  "success": true,
  "message": "Readable message",
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## Health

### GET `/health`

- Access: Public
- Response: `200 OK`

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "OK"
  }
}
```

## 1. Auth APIs

### POST `/api/auth/register`

- Access: Public
- Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "employee"
}
```

- `role` optional, defaults to `employee`
- Response: `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "createdAt": "2026-02-18T12:00:00.000Z"
    },
    "accessToken": "jwt_token"
  }
}
```

### POST `/api/auth/login`

- Access: Public
- Body:

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

- Response: `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "createdAt": "2026-02-18T12:00:00.000Z"
    },
    "accessToken": "jwt_token"
  }
}
```

## 2. Users APIs

All endpoints in this section require a valid bearer token.

### GET `/api/users`

- Access: Authenticated users
- Response: `200 OK`
- Returns public user list sorted by `createdAt desc`

### GET `/api/users/:id`

- Access: Authenticated users
- Path param: `id` (UUID)
- Response: `200 OK`

## 3. Projects APIs

### POST `/api/projects`

- Access: `admin`, `manager`
- Body:

```json
{
  "name": "FlowDesk V1",
  "description": "Internal project"
}
```

- Response: `201 Created`

### GET `/api/projects`

- Access: Authenticated users
- Response: `200 OK`
- `meta.total` contains number of projects

### GET `/api/projects/:id`

- Access: Authenticated users
- Path param: `id` (UUID)
- Response: `200 OK`

## 4. Tasks APIs

### POST `/api/tasks`

- Access: `admin`, `manager`
- Body:

```json
{
  "title": "Build Dashboard",
  "description": "Create analytics UI",
  "projectId": "project_uuid",
  "assignedToId": "employee_uuid"
}
```

- Constraints:
1. `projectId` must exist
2. `assignedToId` must exist
3. assignee role must be `employee`
- Response: `201 Created`
- Initial status: `DRAFT`

### GET `/api/tasks`

- Access: Authenticated users
- Query params:
1. `page` (default `1`)
2. `limit` (default `25`, max `100`)
3. `projectId` (UUID, optional)
4. `assignedToId` (UUID, optional)
5. `status` (`DRAFT | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED`)
6. `search` (title contains, case-insensitive)

- Role behavior:
1. `employee`: always restricted to own assigned tasks
2. `admin`/`manager`: can view all tasks (or filter by `assignedToId`)

- Response: `200 OK`
- `meta`: `{ total, page, limit, hasMore }`

### PATCH `/api/tasks/:id/status`

- Access: Authenticated users (role and ownership rules below)
- Path param: `id` (UUID)
- Body:

```json
{
  "status": "SUBMITTED",
  "comment": "Work completed"
}
```

- Status transition and actor rules:
1. `DRAFT -> IN_PROGRESS`: only assigned employee
2. `IN_PROGRESS -> SUBMITTED`: only assigned employee
3. `DRAFT -> SUBMITTED`: allowed for assigned employee
4. `SUBMITTED -> APPROVED`: only `admin`/`manager`, `comment` required
5. `SUBMITTED -> REJECTED`: only `admin`/`manager`, `comment` required; task becomes `IN_PROGRESS`
6. `APPROVED`: immutable (no further updates)

- Side effect on approve/reject:
1. Creates an approval record
2. Updates task status in same DB transaction

## 5. Approvals APIs

### GET `/api/approvals/task/:taskId`

- Access: `admin`, `manager`
- Path param: `taskId` (UUID)
- Response: `200 OK`
- Returns approvals ordered by `createdAt desc`
- `meta.total` contains number of approvals

## Common Error Codes

Typical `error.code` values exposed by middleware/services include:

1. `UNAUTHORIZED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `FORBIDDEN`
2. `VALIDATION_ERROR`
3. `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`
4. `PROJECT_NOT_FOUND`, `TASK_NOT_FOUND`, `USER_NOT_FOUND`, `ASSIGNEE_NOT_FOUND`
5. `INVALID_ASSIGNEE`, `INVALID_STATUS`, `INVALID_STATUS_TRANSITION`
6. `FORBIDDEN_SUBMIT`, `FORBIDDEN_IN_PROGRESS`, `FORBIDDEN_REVIEW`
7. `REVIEW_COMMENT_REQUIRED`, `TASK_IMMUTABLE`
8. `ROUTE_NOT_FOUND`, `INTERNAL_SERVER_ERROR`, `DATABASE_ERROR`
