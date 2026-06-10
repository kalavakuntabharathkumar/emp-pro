from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class ReviewStatus(str, Enum):
    draft = "draft"
    submitted = "submitted"
    acknowledged = "acknowledged"


class PerformanceReviewInput(BaseModel):
    employee_id: int
    period: str
    overall_rating: float
    productivity_rating: Optional[float] = None
    quality_rating: Optional[float] = None
    teamwork_rating: Optional[float] = None
    communication_rating: Optional[float] = None
    goals_achieved: Optional[int] = None
    goals_total: Optional[int] = None
    comments: Optional[str] = None


class PerformanceReviewUpdate(BaseModel):
    overall_rating: Optional[float] = None
    productivity_rating: Optional[float] = None
    quality_rating: Optional[float] = None
    teamwork_rating: Optional[float] = None
    communication_rating: Optional[float] = None
    goals_achieved: Optional[int] = None
    goals_total: Optional[int] = None
    comments: Optional[str] = None
    status: Optional[ReviewStatus] = None


class PerformanceReview(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    reviewer_id: int
    reviewer_name: Optional[str] = None
    period: str
    overall_rating: float
    productivity_rating: Optional[float] = None
    quality_rating: Optional[float] = None
    teamwork_rating: Optional[float] = None
    communication_rating: Optional[float] = None
    goals_achieved: Optional[int] = None
    goals_total: Optional[int] = None
    comments: Optional[str] = None
    status: ReviewStatus
    created_at: datetime

    class Config:
        from_attributes = True
