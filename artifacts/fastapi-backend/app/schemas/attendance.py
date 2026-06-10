from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    half_day = "half_day"
    on_leave = "on_leave"


class AttendanceInput(BaseModel):
    employee_id: Optional[int] = None
    date: date
    check_in: Optional[datetime] = None
    notes: Optional[str] = None


class Attendance(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: AttendanceStatus
    work_hours: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
