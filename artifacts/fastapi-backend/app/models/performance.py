from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PerformanceReview(Base):
    __tablename__ = "performance_reviews"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    period = Column(String(50), nullable=False)
    overall_rating = Column(Numeric(3, 1), nullable=False)
    productivity_rating = Column(Numeric(3, 1), nullable=True)
    quality_rating = Column(Numeric(3, 1), nullable=True)
    teamwork_rating = Column(Numeric(3, 1), nullable=True)
    communication_rating = Column(Numeric(3, 1), nullable=True)
    goals_achieved = Column(Integer, nullable=True)
    goals_total = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)
    status = Column(String(20), default="draft", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="performance_reviews", foreign_keys=[employee_id])
    reviewer = relationship("Employee", foreign_keys=[reviewer_id])
