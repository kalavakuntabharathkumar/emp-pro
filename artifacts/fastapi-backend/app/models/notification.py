from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="info", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="notifications")
