"""Seed script — run after DB tables are created."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
import app.models  # noqa

from app.models.employee import Employee
from app.models.department import Department
from app.models.project import Project
from app.models.task import Task
from app.models.timesheet import Timesheet
from app.models.attendance import Attendance
from app.models.performance import PerformanceReview
from app.models.notification import Notification
from app.core.security import get_password_hash

from datetime import date, datetime, timedelta
import random

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Skip if already seeded
if db.query(Employee).count() > 0:
    print("Already seeded.")
    db.close()
    sys.exit(0)

# Departments
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

# Employees
employees_data = [
    ("Bharath Kumar", "bharathkumarkalavakunta@gmail.com", "CTO", 0, "admin", 145000, "Bhavani"),
    ("Bob Martinez", "bob@emppro.com", "Senior Engineer", 0, "employee", 110000, "password123"),
    ("vijayalakshmi", "vijayalakshmi@gmail.com", "Product Manager", 1, "employee", 105000, "vijji"),
    ("David Lee", "david@emppro.com", "HR Director", 2, "admin", 98000, "password123"),
    ("ashritha", "ashritha@gmail.com", "Sales Manager", 3, "employee", 92000, "ashritha"),
    ("Frank Brown", "frank@emppro.com", "Software Engineer", 0, "employee", 95000, "password123"),
    ("Grace Kim", "grace@emppro.com", "Marketing Lead", 4, "employee", 88000, "password123"),
    ("Hank Torres", "hank@emppro.com", "Finance Analyst", 5, "employee", 82000, "password123"),
    ("Iris Patel", "iris@emppro.com", "UX Designer", 1, "employee", 90000, "password123"),
    ("Jake Adams", "jake@emppro.com", "DevOps Engineer", 0, "employee", 100000, "password123"),
]

emps = []
for i, (name, email, title, dept_idx, role, salary, pwd) in enumerate(employees_data):
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

# Set department heads
depts[0].head_id = emps[0].id
depts[2].head_id = emps[3].id
depts[3].head_id = emps[4].id

# Projects
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

# Tasks
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

# Timesheets (last 2 weeks)
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

# Attendance (last 14 days, excluding today so check-in works on a fresh DB)
for i in range(1, 15):
    d = today - timedelta(days=i)
    if d.weekday() < 5:
        for emp in emps:
            status = random.choices(
                ["present", "late", "absent"],
                weights=[75, 15, 10]
            )[0]
            check_in_hour = 9 if status == "present" else (10 if status == "late" else None)
            check_in = datetime(d.year, d.month, d.day, check_in_hour, random.randint(0, 30)) if check_in_hour else None
            check_out = datetime(d.year, d.month, d.day, 18, random.randint(0, 30)) if check_in else None
            work_hours = None
            if check_in and check_out:
                work_hours = round((check_out - check_in).total_seconds() / 3600, 2)
            a = Attendance(
                employee_id=emp.id,
                date=d,
                check_in=check_in,
                check_out=check_out,
                status=status,
                work_hours=work_hours,
            )
            db.add(a)

# Performance Reviews
for emp in emps[1:]:
    r = PerformanceReview(
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
        comments="Strong performance this quarter. Keep up the excellent work.",
        status="submitted",
    )
    db.add(r)

# Notifications
notif_data = [
    (0, "New task assigned", "You have been assigned to API performance optimization", "task"),
    (1, "Timesheet pending approval", "Your timesheet for last week is pending approval", "timesheet"),
    (2, "Performance review ready", "Your Q1 2026 performance review is ready to view", "performance"),
    (0, "Employee onboarded", "New employee Grace Kim has joined Marketing", "info"),
    (3, "Attendance alert", "3 employees were late today", "warning"),
]

for emp_idx, title, message, ntype in notif_data:
    n = Notification(
        employee_id=emps[emp_idx].id,
        title=title,
        message=message,
        type=ntype,
        is_read=False,
    )
    db.add(n)

db.commit()
db.close()
print("Seeding complete! 10 employees, 5 projects, 8 tasks, attendance + timesheets + reviews seeded.")
print("\nLogin credentials:")
print("  Admin: bharathkumarkalavakunta@gmail.com / Hello@8978")
print("  Admin: david@emppro.com / password123")
print("  Employee: bob@emppro.com / password123")
