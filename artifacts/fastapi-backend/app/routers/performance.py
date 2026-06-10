from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.performance import PerformanceReview as ReviewModel
from app.models.employee import Employee as EmployeeModel
from app.schemas.performance import PerformanceReview, PerformanceReviewInput, PerformanceReviewUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/performance", tags=["performance"])


def _build_review(r: ReviewModel) -> PerformanceReview:
    return PerformanceReview(
        id=r.id,
        employee_id=r.employee_id,
        employee_name=r.employee.full_name if r.employee else None,
        reviewer_id=r.reviewer_id,
        reviewer_name=r.reviewer.full_name if r.reviewer else None,
        period=r.period,
        overall_rating=float(r.overall_rating),
        productivity_rating=float(r.productivity_rating) if r.productivity_rating else None,
        quality_rating=float(r.quality_rating) if r.quality_rating else None,
        teamwork_rating=float(r.teamwork_rating) if r.teamwork_rating else None,
        communication_rating=float(r.communication_rating) if r.communication_rating else None,
        goals_achieved=r.goals_achieved,
        goals_total=r.goals_total,
        comments=r.comments,
        status=r.status,
        created_at=r.created_at,
    )


@router.get("", response_model=list[PerformanceReview])
def list_reviews(
    employee_id: Optional[int] = Query(None),
    period: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    q = db.query(ReviewModel)
    if employee_id:
        q = q.filter(ReviewModel.employee_id == employee_id)
    if period:
        q = q.filter(ReviewModel.period == period)
    return [_build_review(r) for r in q.all()]


@router.post("", response_model=PerformanceReview, status_code=201)
def create_review(
    body: PerformanceReviewInput,
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    r = ReviewModel(reviewer_id=current_user.id, **body.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return _build_review(r)


@router.get("/{id}", response_model=PerformanceReview)
def get_review(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    r = db.query(ReviewModel).filter(ReviewModel.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")
    return _build_review(r)


@router.patch("/{id}", response_model=PerformanceReview)
def update_review(
    id: int,
    body: PerformanceReviewUpdate,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    r = db.query(ReviewModel).filter(ReviewModel.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(r, field, value)
    db.commit()
    db.refresh(r)
    return _build_review(r)
