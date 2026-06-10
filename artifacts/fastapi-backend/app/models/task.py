from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, Date, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


task_assignees = Table(
    "task_assignees",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("employee_id", Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True),
)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="todo", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    due_date = Column(Date, nullable=True)
    estimated_hours = Column(Numeric(6, 2), nullable=True)
    actual_hours = Column(Numeric(6, 2), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("Employee", back_populates="assigned_tasks", foreign_keys=[assignee_id])
    assignees = relationship("Employee", secondary=task_assignees, lazy="joined")
    timesheets = relationship("Timesheet", back_populates="task", foreign_keys="Timesheet.task_id")
