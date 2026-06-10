from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, Date
from sqlalchemy.orm import relationship
from app.core.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    status = Column(String(20), default="present", nullable=False)
    work_hours = Column(Numeric(5, 2), nullable=True)
    notes = Column(Text, nullable=True)

    employee = relationship("Employee", back_populates="attendance_records", foreign_keys=[employee_id])
