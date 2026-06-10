from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum


class TimesheetStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class TimesheetInput(BaseModel):
    employee_id: Optional[int] = None
    project_id: int
    task_id: Optional[int] = None
    date: date
    hours: float
    description: Optional[str] = None


class TimesheetUpdate(BaseModel):
    hours: Optional[float] = None
    description: Optional[str] = None
    task_id: Optional[int] = None


class Timesheet(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    project_id: int
    project_name: Optional[str] = None
    task_id: Optional[int] = None
    task_title: Optional[str] = None
    date: date
    hours: float
    description: Optional[str] = None
    status: TimesheetStatus
    created_at: datetime

    class Config:
        from_attributes = True
