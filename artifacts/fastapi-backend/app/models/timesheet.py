from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Timesheet(Base):
    __tablename__ = "timesheets"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    date = Column(Date, nullable=False)
    hours = Column(Numeric(5, 2), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="timesheets", foreign_keys=[employee_id])
    project = relationship("Project", back_populates="timesheets", foreign_keys=[project_id])
    task = relationship("Task", back_populates="timesheets", foreign_keys=[task_id])
