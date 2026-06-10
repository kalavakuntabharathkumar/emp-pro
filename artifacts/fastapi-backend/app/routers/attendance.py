from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.attendance import Attendance as AttendanceModel
from app.models.employee import Employee as EmployeeModel
from app.schemas.attendance import Attendance, AttendanceInput
from app.routers.auth import get_current_user

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _build_att(a: AttendanceModel) -> Attendance:
    work_hours = None
    if a.check_in and a.check_out:
        delta = a.check_out - a.check_in
        work_hours = round(delta.total_seconds() / 3600, 2)
    return Attendance(
        id=a.id,
        employee_id=a.employee_id,
        employee_name=a.employee.full_name if a.employee else None,
        date=a.date,
        check_in=a.check_in,
        check_out=a.check_out,
        status=a.status,
        work_hours=float(a.work_hours) if a.work_hours else work_hours,
        notes=a.notes,
    )


@router.get("", response_model=list[Attendance])
def list_attendance(
    employee_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    q = db.query(AttendanceModel)
    if employee_id:
        q = q.filter(AttendanceModel.employee_id == employee_id)
    elif (current_user.role if isinstance(current_user.role, str) else current_user.role.value) == "employee":
        q = q.filter(AttendanceModel.employee_id == current_user.id)
    if date_from:
        q = q.filter(AttendanceModel.date >= date_from)
    if date_to:
        q = q.filter(AttendanceModel.date <= date_to)
    return [_build_att(a) for a in q.order_by(AttendanceModel.date.desc()).all()]


@router.post("", response_model=Attendance, status_code=201)
def create_attendance(
    body: AttendanceInput,
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    emp_id = body.employee_id or current_user.id
    check_in = body.check_in or datetime.now()
    hour = check_in.hour
    status = "present" if hour <= 9 else "late"
    a = AttendanceModel(
        employee_id=emp_id,
        date=body.date,
        check_in=check_in,
        status=status,
        notes=body.notes,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return _build_att(a)


@router.post("/{id}/checkout", response_model=Attendance)
def check_out(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    a = db.query(AttendanceModel).filter(AttendanceModel.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    checkout_time = datetime.now()
    a.check_out = checkout_time
    if a.check_in:
        delta = checkout_time - a.check_in
        a.work_hours = round(delta.total_seconds() / 3600, 2)
    db.commit()
    db.refresh(a)
    return _build_att(a)
