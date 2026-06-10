from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class EmployeeStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    on_leave = "on_leave"


class EmployeeRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    job_title = Column(String(100), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    status = Column(String(20), default="active", nullable=False)
    role = Column(String(20), default="employee", nullable=False)
    hire_date = Column(Date, nullable=False)
    salary = Column(Numeric(12, 2), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    manager = relationship("Employee", remote_side="Employee.id", foreign_keys=[manager_id])

    timesheets = relationship("Timesheet", back_populates="employee", foreign_keys="Timesheet.employee_id")
    attendance_records = relationship("Attendance", back_populates="employee", foreign_keys="Attendance.employee_id")
    performance_reviews = relationship("PerformanceReview", back_populates="employee", foreign_keys="PerformanceReview.employee_id")
    notifications = relationship("Notification", back_populates="employee")
    managed_projects = relationship("Project", back_populates="manager", foreign_keys="Project.manager_id")
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
