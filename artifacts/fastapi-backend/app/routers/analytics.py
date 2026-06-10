from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import Optional

from app.core.database import get_db
from app.models.employee import Employee as EmployeeModel
from app.models.project import Project as ProjectModel
from app.models.task import Task as TaskModel
from app.models.timesheet import Timesheet as TimesheetModel
from app.models.attendance import Attendance as AttendanceModel
from app.models.performance import PerformanceReview as ReviewModel
from app.models.department import Department as DepartmentModel
from app.models.notification import Notification as NotificationModel
from app.schemas.analytics import (
    DashboardStats, ActivityItem, AttendanceSummary,
    ProjectStat, DepartmentHeadcount, TimesheetHoursStat
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    today = date.today()
    total_emp = db.query(EmployeeModel).count()
    active_emp = db.query(EmployeeModel).filter(EmployeeModel.status == "active").count()
    total_proj = db.query(ProjectModel).count()
    active_proj = db.query(ProjectModel).filter(ProjectModel.status == "in_progress").count()
    total_tasks = db.query(TaskModel).count()
    completed_tasks = db.query(TaskModel).filter(TaskModel.status == "done").count()
    pending_ts = db.query(TimesheetModel).filter(TimesheetModel.status == "pending").count()
    present_today = db.query(AttendanceModel).filter(
        AttendanceModel.date == today,
        AttendanceModel.status == "present"
    ).count()
    on_leave = db.query(AttendanceModel).filter(
        AttendanceModel.date == today,
        AttendanceModel.status == "on_leave"
    ).count()
    avg_rating = db.query(func.avg(ReviewModel.overall_rating)).scalar()

    recent_notifs = db.query(NotificationModel).order_by(
        NotificationModel.created_at.desc()
    ).limit(10).all()
    activities = [
        ActivityItem(
            id=n.id,
            type=n.type,
            message=n.message,
            user_name=n.employee.full_name if n.employee else None,
            created_at=n.created_at.isoformat(),
        )
        for n in recent_notifs
    ]

    return DashboardStats(
        total_employees=total_emp,
        active_employees=active_emp,
        total_projects=total_proj,
        active_projects=active_proj,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_timesheets=pending_ts,
        present_today=present_today,
        on_leave_today=on_leave,
        avg_performance_rating=round(float(avg_rating), 1) if avg_rating else None,
        recent_activities=activities,
    )


@router.get("/attendance-summary", response_model=list[AttendanceSummary])
def get_attendance_summary(
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    today = date.today()
    results = []
    for i in range(7, -1, -1):
        week_end = today - timedelta(days=today.weekday()) - timedelta(weeks=i)
        week_start = week_end - timedelta(days=6)
        present = db.query(AttendanceModel).filter(
            AttendanceModel.date >= week_start,
            AttendanceModel.date <= week_end,
            AttendanceModel.status == "present",
        ).count()
        absent = db.query(AttendanceModel).filter(
            AttendanceModel.date >= week_start,
            AttendanceModel.date <= week_end,
            AttendanceModel.status == "absent",
        ).count()
        late = db.query(AttendanceModel).filter(
            AttendanceModel.date >= week_start,
            AttendanceModel.date <= week_end,
            AttendanceModel.status == "late",
        ).count()
        results.append(AttendanceSummary(
            week=week_start.strftime("W%U"),
            present=present,
            absent=absent,
            late=late,
        ))
    return results


@router.get("/project-stats", response_model=list[ProjectStat])
def get_project_stats(
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    rows = db.query(ProjectModel.status, func.count(ProjectModel.id)).group_by(ProjectModel.status).all()
    return [ProjectStat(status=str(row[0]), count=row[1]) for row in rows]


@router.get("/department-headcount", response_model=list[DepartmentHeadcount])
def get_dept_headcount(
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    rows = db.query(DepartmentModel.name, func.count(EmployeeModel.id)).join(
        EmployeeModel, EmployeeModel.department_id == DepartmentModel.id, isouter=True
    ).group_by(DepartmentModel.id, DepartmentModel.name).all()
    return [DepartmentHeadcount(department=row[0], count=row[1]) for row in rows]


@router.get("/timesheet-hours", response_model=list[TimesheetHoursStat])
def get_timesheet_hours(
    weeks: int = Query(8, ge=1, le=52),
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    today = date.today()
    results = []
    for i in range(weeks - 1, -1, -1):
        week_end = today - timedelta(days=today.weekday()) - timedelta(weeks=i)
        week_start = week_end - timedelta(days=6)
        total = db.query(func.sum(TimesheetModel.hours)).filter(
            TimesheetModel.date >= week_start,
            TimesheetModel.date <= week_end,
        ).scalar() or 0
        results.append(TimesheetHoursStat(
            week=week_start.strftime("W%U"),
            hours=float(total),
        ))
    return results
