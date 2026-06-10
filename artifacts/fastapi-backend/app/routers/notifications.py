from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.notification import Notification as NotificationModel
from app.models.employee import Employee as EmployeeModel
from app.schemas.notification import Notification
from app.routers.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _build_notif(n: NotificationModel) -> Notification:
    return Notification(
        id=n.id,
        title=n.title,
        message=n.message,
        type=n.type,
        is_read=n.is_read,
        link=n.link,
        created_at=n.created_at,
    )


@router.get("", response_model=list[Notification])
def list_notifications(
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    q = db.query(NotificationModel).filter(NotificationModel.employee_id == current_user.id)
    if unread_only:
        q = q.filter(NotificationModel.is_read == False)
    return [_build_notif(n) for n in q.order_by(NotificationModel.created_at.desc()).all()]


@router.post("/{id}/read", response_model=Notification)
def mark_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    n = db.query(NotificationModel).filter(
        NotificationModel.id == id,
        NotificationModel.employee_id == current_user.id
    ).first()
    if n:
        n.is_read = True
        db.commit()
        db.refresh(n)
    return _build_notif(n) if n else None


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    db.query(NotificationModel).filter(
        NotificationModel.employee_id == current_user.id,
        NotificationModel.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
