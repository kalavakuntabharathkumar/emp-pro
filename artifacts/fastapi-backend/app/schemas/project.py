from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum


class ProjectStatus(str, Enum):
    planning = "planning"
    in_progress = "in_progress"
    on_hold = "on_hold"
    completed = "completed"
    cancelled = "cancelled"


class ProjectPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ProjectInput(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.planning
    priority: ProjectPriority = ProjectPriority.medium
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    budget: Optional[float] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    progress: Optional[int] = None


class Project(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: ProjectStatus
    priority: ProjectPriority
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    manager_id: Optional[int] = None
    manager_name: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    budget: Optional[float] = None
    progress: int = 0
    task_count: int = 0
    completed_task_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
