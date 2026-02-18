# FlowDesk API Documentation

Base URL: `http://localhost:5000/api`

------------------------------------------------------------------------

## 🔐 1. Authentication APIs

### 1.1 Register User

**Endpoint** POST `/auth/register`

**Access** Public

**Request Body**

``` json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "employee"
}
```

**Success Response (201)**

``` json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "token": "jwt_token"
  }
}
```

------------------------------------------------------------------------

### 1.2 Login

**Endpoint** POST `/auth/login`

**Access** Public

**Request Body**

``` json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success Response (200)**

``` json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "token": "jwt_token"
  }
}
```

------------------------------------------------------------------------

## 👥 2. Users APIs

All routes require: `Authorization: Bearer <token>`

### 2.1 Get All Users

GET `/users`

### 2.2 Get User by ID

GET `/users/{id}`

------------------------------------------------------------------------

## 📁 3. Projects APIs

### 3.1 Create Project

POST `/projects`

**Access:** Admin, Manager

``` json
{
  "name": "FlowDesk V1",
  "description": "Internal project"
}
```

### 3.2 Get All Projects

GET `/projects`

### 3.3 Get Project by ID

GET `/projects/{id}`

------------------------------------------------------------------------

## 📋 4. Tasks APIs

### 4.1 Create Task

POST `/tasks`

**Access:** Admin, Manager

``` json
{
  "title": "Build Dashboard",
  "description": "Create analytics UI",
  "projectId": "uuid",
  "assignedToId": "employee_uuid"
}
```

Default Status: `DRAFT`

------------------------------------------------------------------------

### 4.2 Get Tasks

GET `/tasks`

**Role Behavior** - Admin → All tasks - Manager → All tasks - Employee →
Only assigned tasks

------------------------------------------------------------------------

### 4.3 Update Task Status

PATCH `/tasks/{id}/status`

``` json
{
  "status": "SUBMITTED",
  "comment": "Work completed"
}
```

### Workflow Rules

Allowed transitions:

-   DRAFT → IN_PROGRESS
-   IN_PROGRESS → SUBMITTED
-   SUBMITTED → APPROVED
-   SUBMITTED → REJECTED
-   REJECTED → IN_PROGRESS
-   APPROVED → Locked

------------------------------------------------------------------------

## 📝 5. Approvals APIs

### 5.1 Get Approval History

GET `/approvals/{taskId}`

------------------------------------------------------------------------

## 🛡 Standard Response Format

### Success

``` json
{
  "success": true,
  "message": "Readable message",
  "data": {}
}
```

### Error

``` json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

------------------------------------------------------------------------

# End of Documentation
