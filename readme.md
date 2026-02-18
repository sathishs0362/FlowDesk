# FlowDesk

FlowDesk is a pnpm monorepo with:

1. `apps/api` - Express + Prisma + PostgreSQL backend
2. `apps/web` - React + Vite frontend

## What This Application Does

FlowDesk is a workflow and task execution platform for teams with role-based operations.

Core capabilities:

1. User authentication and role-based access (`admin`, `manager`, `employee`)
2. Project creation and management
3. Task assignment to employees with lifecycle tracking
4. Task status workflow across stages:
   - `DRAFT`
   - `IN_PROGRESS`
   - `SUBMITTED`
   - `APPROVED`
   - `REJECTED`
5. Approval flow where managers/admins review submitted work
6. Kanban board for drag-and-drop task progression
7. Dashboard overview for task distribution, SLA risk, and execution health
8. Realtime updates and presence indicators in the frontend

## Prerequisites

1. Node.js `>= 20`
2. pnpm `>= 10`
3. PostgreSQL database (local or hosted)

## Project Structure

```txt
apps/
  api/   # Backend
  web/   # Frontend
docs/
```

## Installation

From repository root:

```bash
pnpm install
```

## Environment Setup

### Backend (`apps/api/.env`)

Create `apps/api/.env` with:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db_name>
JWT_SECRET=replace_with_at_least_32_characters
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
```

### Frontend (`apps/web/.env`)

Create `apps/web/.env` (or use `.env.example`) with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000/ws
VITE_LOG_LEVEL=info
VITE_FLAG_REALTIME=true
VITE_FLAG_PRESENCE=true
VITE_FLAG_ANALYTICS=true
VITE_FLAG_OFFLINE_QUEUE=true
```

## Database Setup (Backend)

Run Prisma migration and generate client:

```bash
pnpm --filter api prisma:migrate
pnpm --filter api prisma:generate
```

## Run in Development

Run both apps in parallel from root:

```bash
pnpm dev
```

Or run separately:

```bash
pnpm dev:api
pnpm dev:web
```

Default URLs:

1. Frontend: `http://localhost:5173`
2. Backend: `http://localhost:5000`
3. API base: `http://localhost:5000/api`
4. Health check: `http://localhost:5000/health`

## Build and Quality

```bash
pnpm --filter api build
pnpm --filter web build
pnpm --filter web lint
```

## API Documentation

Backend API reference:

- `docs/FlowDesk_API_Documentation.md`

Frontend architecture reference:

- `docs/FlowDesk_Frontend_Architecture.md`
