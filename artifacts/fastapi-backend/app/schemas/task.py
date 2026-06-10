from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"
    cancelled = "cancelled"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AssigneeInfo(BaseModel):
    id: int
    full_name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class TaskInput(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    priority: TaskPriority
    project_id: int
    assignee_ids: Optional[List[int]] = None
    due_date: Optional[date] = None
    estimated_hours: Optional[float] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_ids: Optional[List[int]] = None
    due_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None


class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    project_id: int
    project_name: Optional[str] = None
    assignee_id: Optional[int] = None
    assignee_name: Optional[str] = None
    assignee_avatar: Optional[str] = None
    assignees: List[AssigneeInfo] = []
    due_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
