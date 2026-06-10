from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    info = "info"
    warning = "warning"
    success = "success"
    error = "error"
    task = "task"
    attendance = "attendance"
    timesheet = "timesheet"
    performance = "performance"


class Notification(BaseModel):
    id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
