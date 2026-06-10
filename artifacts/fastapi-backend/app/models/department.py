from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    head_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    employees = relationship("Employee", back_populates="department", foreign_keys="Employee.department_id")
    projects = relationship("Project", back_populates="department")
