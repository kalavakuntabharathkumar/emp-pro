from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DepartmentInput(BaseModel):
    name: str
    description: Optional[str] = None
    head_id: Optional[int] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    head_id: Optional[int] = None


class Department(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    head_id: Optional[int] = None
    head_name: Optional[str] = None
    employee_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
