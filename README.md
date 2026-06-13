# EMP Pro — Enterprise Employee Management System

A modern full-stack Employee Management System built with React, FastAPI, and SQLite.

EMP Pro helps organizations manage employees, departments, attendance, projects, analytics, performance tracking, and internal workflows through a unified enterprise dashboard.

---

# Tech Stack

## Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS 4
* Radix UI
* TanStack Query
* Wouter

## Backend

* Python 3.12
* FastAPI
* SQLAlchemy
* SQLite

## Authentication

* JWT Authentication
* LocalStorage-based session management

## Monorepo

* pnpm Workspaces

---

# Features

* Dashboard analytics
* Employee management
* Department management
* Project & task tracking
* Attendance system
* Performance reviews
* Notifications
* Timesheets
* Analytics & charts
* JWT authentication
* Responsive UI
* FastAPI REST APIs

---

# Project Structure

```bash
EMPPro/
│
├── artifacts/
│   ├── emp-pro/              # React frontend
│   ├── fastapi-backend/      # FastAPI backend
│   ├── api-server/
│   └── mockup-sandbox/
│
├── lib/
│   ├── api-spec/
│   ├── api-client-react/
│   ├── api-zod/
│   └── db/
│
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# Prerequisites

Make sure the following are installed:

* Node.js 20+
* pnpm 9+
* Python 3.12+
* Git

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/your-username/emp-pro.git
cd emp-pro
```

---

# Backend Setup (FastAPI)

## Navigate to Backend

```bash
cd artifacts/fastapi-backend
```

## Create Virtual Environment

### Windows

```bash
python -m venv .venv
```

Activate environment:

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run Backend Server

```bash
python -m uvicorn app.main:app --reload
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

---

## Seed Demo Data (Optional)

```bash
python seed.py
```

---

# Frontend Setup (React + Vite)

## Open New Terminal

Navigate to frontend:

```bash
cd artifacts/emp-pro
```

---

## Install Dependencies

```bash
pnpm install
```

---

## Run Frontend

```bash
pnpm dev
```

Frontend runs on:

```bash
http://localhost:5000
```

---

# Demo Credentials

| Role     | Email                                       | Password    |
| -------- | ------------------------------------------- | ----------- |
| Admin    | [alice@emppro.com](mailto:alice@emppro.com) | password123 |
| Admin    | [david@emppro.com](mailto:david@emppro.com) | password123 |
| Employee | [bob@emppro.com](mailto:bob@emppro.com)     | password123 |

---

# Environment Variables

Create a `.env` file if needed using:

```bash
cp .env.example .env
```

Example variables:

```env
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
GEMINI_API_KEY=
SMTP_USER=
SMTP_PASSWORD=
```

---

# API Documentation

FastAPI Swagger Docs:

```bash
http://127.0.0.1:8000/docs
```

ReDoc:

```bash
http://127.0.0.1:8000/redoc
```

---

# Common Issues

## pnpm dev not working

Run frontend inside:

```bash
artifacts/emp-pro
```

NOT from project root.

Correct:

```bash
cd artifacts/emp-pro
pnpm dev
```

---

## Uvicorn app loading error

If this fails:

```bash
python -m uvicorn main:app --reload
```

Use this instead:

```bash
python -m uvicorn app.main:app --reload
```

---

## Virtual Environment Activation Error

Ensure virtual environment exists:

```bash
python -m venv .venv
```

Then activate:

### Windows

```bash
.venv\Scripts\activate
```

---

# Development Notes

* SQLite database is ignored from Git
* `.env` files are ignored for security
* `.env.example` contains safe placeholders only
* Uses pnpm workspaces for monorepo management

---

# Future Improvements

* Docker support
* PostgreSQL integration
* Role-based access control
* Real-time notifications
* AI assistant integration
* Advanced analytics
* CI/CD pipelines

---
