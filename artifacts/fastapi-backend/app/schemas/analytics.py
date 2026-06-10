from pydantic import BaseModel
from typing import Optional


class ActivityItem(BaseModel):
    id: int
    type: str
    message: str
    user_name: Optional[str] = None
    created_at: str


class DashboardStats(BaseModel):
    total_employees: int
    active_employees: int
    total_projects: int
    active_projects: int
    total_tasks: int
    completed_tasks: int
    pending_timesheets: int
    present_today: int
    on_leave_today: int
    avg_performance_rating: Optional[float] = None
    recent_activities: list[ActivityItem] = []


class AttendanceSummary(BaseModel):
    week: str
    present: int
    absent: int
    late: int


class ProjectStat(BaseModel):
    status: str
    count: int


class DepartmentHeadcount(BaseModel):
    department: str
    count: int


class TimesheetHoursStat(BaseModel):
    week: str
    hours: float
