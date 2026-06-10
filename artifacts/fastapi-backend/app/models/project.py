from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), default="planning", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    budget = Column(Numeric(15, 2), nullable=True)
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    department = relationship("Department", back_populates="projects")
    manager = relationship("Employee", back_populates="managed_projects", foreign_keys=[manager_id])
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    timesheets = relationship("Timesheet", back_populates="project", foreign_keys="Timesheet.project_id")
