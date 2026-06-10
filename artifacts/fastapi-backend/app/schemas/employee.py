from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from enum import Enum


class EmployeeStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    on_leave = "on_leave"


class EmployeeRole(str, Enum):
    admin = "admin"
    employee = "employee"


class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    status: EmployeeStatus = EmployeeStatus.active
    role: EmployeeRole = EmployeeRole.employee
    hire_date: date
    salary: Optional[float] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None


class EmployeeInput(EmployeeBase):
    password: Optional[str] = "changeme123"


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    status: Optional[EmployeeStatus] = None
    role: Optional[EmployeeRole] = None
    salary: Optional[float] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None


class Employee(EmployeeBase):
    id: int
    department_name: Optional[str] = None
    manager_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    items: list[Employee]
    total: int
    page: int
    page_size: int
