# EMP Pro — Employee Management System

A comprehensive Employee Management System built with React + FastAPI.

## Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Radix UI, TanStack Query, Wouter
- **Backend**: Python 3.12, FastAPI, SQLAlchemy, SQLite
- **Auth**: Custom JWT (stored in localStorage, verified by FastAPI)
- **Monorepo**: pnpm workspaces

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.12+

### Backend
```bash
cd artifacts/fastapi-backend
pip install -r requirements.txt
python3 main.py
# Runs on http://localhost:8000
```

Seed demo data:
```bash
cd artifacts/fastapi-backend
python3 seed.py
```

### Frontend
```bash
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/emp-pro run dev
# Runs on http://localhost:5000
```

## Project Structure

```
artifacts/
  emp-pro/              # React frontend (Vite)
  fastapi-backend/      # Python FastAPI backend
lib/
  api-spec/             # OpenAPI spec (source of truth)
  api-client-react/     # Generated React hooks (do not edit)
  api-zod/              # Generated Zod types
  db/                   # Drizzle DB config
```

## Demo Credentials

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | alice@emppro.com     | password123 |
| Admin    | david@emppro.com     | password123 |
| Employee | bob@emppro.com       | password123 |

## Features

- **Dashboard** — overview stats and charts
- **Employees** — full CRUD, profiles, department assignment
- **Departments** — manage org structure
- **Projects & Tasks** — project tracking with task assignment
- **Timesheets** — time entry and reporting
- **Attendance** — clock in/out tracking
- **Performance** — review cycles
- **Notifications** — in-app alerts
- **Analytics** — charts and reporting
