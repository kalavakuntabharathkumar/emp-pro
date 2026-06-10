from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import engine, Base, SessionLocal
from app.routers import auth, employees, departments, projects, tasks, timesheets, attendance, performance, notifications, analytics

import app.models  # noqa: F401 — ensures all models are registered before create_all


def _auto_seed():
    """Seed demo data on first run if the database is empty."""
    from app.models.employee import Employee
    db = SessionLocal()
    try:
        if db.query(Employee).count() > 0:
            return
    finally:
        db.close()

    # DB is empty — run full seed
    import random
    from datetime import date, datetime, timedelta
    from app.models.department import Department
    from app.models.project import Project
    from app.models.task import Task
    from app.models.timesheet import Timesheet
    from app.models.attendance import Attendance
    from app.models.performance import PerformanceReview
    from app.models.notification import Notification
    from app.core.security import get_password_hash

    db = SessionLocal()
    try:
        depts = []
        for name, desc in [
            ("Engineering", "Software development and infrastructure"),
            ("Product", "Product design and management"),
            ("Human Resources", "People operations and culture"),
            ("Sales", "Revenue and business development"),
            ("Marketing", "Brand, growth, and content"),
            ("Finance", "Budgeting and financial operations"),
        ]:
            d = Department(name=name, description=desc)
            db.add(d)
            depts.append(d)
        db.flush()

        employees_data = [
            ("Bharath Kumar", "bharathkumarkalavakunta@gmail.com", "CTO", 0, "admin", 145000, "Hello@8978"),
            ("Bob Martinez", "bob@emppro.com", "Senior Engineer", 0, "employee", 110000, "password123"),
            ("Carol White", "carol@emppro.com", "Product Manager", 1, "employee", 105000, "password123"),
            ("David Lee", "david@emppro.com", "HR Director", 2, "admin", 98000, "password123"),
            ("Eva Chen", "eva@emppro.com", "Sales Manager", 3, "employee", 92000, "password123"),
            ("Frank Brown", "frank@emppro.com", "Software Engineer", 0, "employee", 95000, "password123"),
            ("Grace Kim", "grace@emppro.com", "Marketing Lead", 4, "employee", 88000, "password123"),
            ("Hank Torres", "hank@emppro.com", "Finance Analyst", 5, "employee", 82000, "password123"),
            ("Iris Patel", "iris@emppro.com", "UX Designer", 1, "employee", 90000, "password123"),
            ("Jake Adams", "jake@emppro.com", "DevOps Engineer", 0, "employee", 100000, "password123"),
        ]

        emps = []
        for name, email, title, dept_idx, role, salary, pwd in employees_data:
            e = Employee(
                full_name=name,
                email=email,
                password_hash=get_password_hash(pwd),
                job_title=title,
                department_id=depts[dept_idx].id,
                status="active",
                role=role,
                hire_date=date(2022, random.randint(1, 12), random.randint(1, 28)),
                salary=salary,
            )
            db.add(e)
            emps.append(e)
        db.flush()

        depts[0].head_id = emps[0].id
        depts[2].head_id = emps[3].id
        depts[3].head_id = emps[4].id

        projects_data = [
            ("Platform Redesign", "Full redesign of core platform", "in_progress", "critical", 0, 0, 65),
            ("Mobile App Launch", "iOS and Android app for customers", "in_progress", "high", 0, 1, 40),
            ("CRM Integration", "Integrate Salesforce CRM", "planning", "medium", 3, 4, 15),
            ("HR System Upgrade", "Upgrade legacy HR tools", "completed", "low", 2, 3, 100),
            ("Marketing Automation", "Automate campaign workflows", "on_hold", "medium", 4, 6, 30),
        ]

        projs = []
        for name, desc, status, priority, dept_idx, mgr_idx, progress in projects_data:
            p = Project(
                name=name,
                description=desc,
                status=status,
                priority=priority,
                department_id=depts[dept_idx].id,
                manager_id=emps[mgr_idx].id,
                start_date=date(2025, random.randint(1, 6), 1),
                end_date=date(2026, random.randint(7, 12), 30),
                budget=random.choice([50000, 75000, 120000, 200000]),
                progress=progress,
            )
            db.add(p)
            projs.append(p)
        db.flush()

        task_data = [
            ("Design new dashboard UI", "done", "high", 0, 0),
            ("Build authentication service", "in_progress", "critical", 0, 1),
            ("API performance optimization", "todo", "medium", 0, 5),
            ("Write mobile onboarding flow", "in_progress", "high", 1, 2),
            ("Set up CI/CD pipeline for mobile", "review", "medium", 1, 9),
            ("CRM data mapping doc", "todo", "low", 2, 4),
            ("Migrate employee records", "done", "high", 3, 3),
            ("Email campaign builder", "todo", "medium", 4, 6),
        ]

        tasks = []
        for title, status, priority, proj_idx, emp_idx in task_data:
            t = Task(
                title=title,
                status=status,
                priority=priority,
                project_id=projs[proj_idx].id,
                assignee_id=emps[emp_idx].id,
                due_date=date(2026, random.randint(7, 12), random.randint(1, 28)),
                estimated_hours=random.choice([8, 16, 24, 40]),
            )
            db.add(t)
            tasks.append(t)
        db.flush()

        today = date.today()
        for i in range(14):
            d = today - timedelta(days=i)
            if d.weekday() < 5:
                for emp in random.sample(emps[:6], 4):
                    ts = Timesheet(
                        employee_id=emp.id,
                        project_id=random.choice(projs).id,
                        task_id=random.choice(tasks).id,
                        date=d,
                        hours=random.choice([4, 6, 7, 8]),
                        description="Working on sprint tasks",
                        status="approved" if i > 5 else "pending",
                    )
                    db.add(ts)

        for i in range(14):
            d = today - timedelta(days=i)
            if d.weekday() < 5:
                for emp in emps:
                    status = random.choices(["present", "late", "absent"], weights=[75, 15, 10])[0]
                    check_in_hour = 9 if status == "present" else (10 if status == "late" else None)
                    check_in = datetime(d.year, d.month, d.day, check_in_hour, random.randint(0, 30)) if check_in_hour else None
                    check_out = datetime(d.year, d.month, d.day, 18, random.randint(0, 30)) if check_in else None
                    work_hours = round((check_out - check_in).total_seconds() / 3600, 2) if check_in and check_out else None
                    db.add(Attendance(
                        employee_id=emp.id,
                        date=d,
                        check_in=check_in,
                        check_out=check_out,
                        status=status,
                        work_hours=work_hours,
                    ))

        for emp in emps[1:]:
            db.add(PerformanceReview(
                employee_id=emp.id,
                reviewer_id=emps[0].id,
                period="Q1 2026",
                overall_rating=round(random.uniform(3.0, 5.0), 1),
                productivity_rating=round(random.uniform(3.0, 5.0), 1),
                quality_rating=round(random.uniform(3.0, 5.0), 1),
                teamwork_rating=round(random.uniform(3.0, 5.0), 1),
                communication_rating=round(random.uniform(3.0, 5.0), 1),
                goals_achieved=random.randint(3, 8),
                goals_total=8,
                comments="Strong performance this quarter.",
                status="submitted",
            ))

        for emp_idx, title, message, ntype in [
            (0, "New task assigned", "You have been assigned to API performance optimization", "task"),
            (1, "Timesheet pending approval", "Your timesheet for last week is pending approval", "timesheet"),
            (2, "Performance review ready", "Your Q1 2026 performance review is ready to view", "performance"),
            (0, "Employee onboarded", "New employee Grace Kim has joined Marketing", "info"),
            (3, "Attendance alert", "3 employees were late today", "warning"),
        ]:
            db.add(Notification(
                employee_id=emps[emp_idx].id,
                title=title,
                message=message,
                type=ntype,
                is_read=False,
            ))

        db.commit()
        print("Auto-seed complete: 10 employees seeded. Login: bharathkumarkalavakunta@gmail.com / Hello@8978")
    except Exception as e:
        db.rollback()
        print(f"Auto-seed failed: {e}")
    finally:
        db.close()


def _migrate_task_assignees():
    """Migrate existing single assignee_id values into the task_assignees junction table."""
    from app.models.task import Task as TaskModel, task_assignees as ta_table
    from sqlalchemy import text
    db = SessionLocal()
    try:
        tasks = db.query(TaskModel).filter(TaskModel.assignee_id.isnot(None)).all()
        for t in tasks:
            exists = db.execute(
                text("SELECT 1 FROM task_assignees WHERE task_id=:tid AND employee_id=:eid"),
                {"tid": t.id, "eid": t.assignee_id}
            ).fetchone()
            if not exists:
                db.execute(ta_table.insert().values(task_id=t.id, employee_id=t.assignee_id))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Task assignee migration warning: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _auto_seed()
    _migrate_task_assignees()
    yield


app = FastAPI(title="EMP Pro API", version="1.0.0", root_path="/api", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(departments.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(timesheets.router)
app.include_router(attendance.router)
app.include_router(performance.router)
app.include_router(notifications.router)
app.include_router(analytics.router)


@app.get("/healthz")
def health_check():
    return {"status": "ok"}


# Serve React frontend (built files)
# main.py lives at: <root>/artifacts/fastapi-backend/app/main.py
# Going up 3 dirs from app/ reaches <root>/artifacts/, then emp-pro/dist/public
from fastapi.staticfiles import StaticFiles
import os as _os

_HERE = _os.path.dirname(_os.path.abspath(__file__))
_static_dir = _os.path.normpath(_os.path.join(_HERE, "..", "..", "emp-pro", "dist", "public"))
if _os.path.isdir(_static_dir):
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
