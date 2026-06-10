from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.timesheet import Timesheet as TimesheetModel
from app.models.employee import Employee as EmployeeModel
from app.schemas.timesheet import Timesheet, TimesheetInput, TimesheetUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/timesheets", tags=["timesheets"])


def _build_ts(ts: TimesheetModel) -> Timesheet:
    return Timesheet(
        id=ts.id,
        employee_id=ts.employee_id,
        employee_name=ts.employee.full_name if ts.employee else None,
        project_id=ts.project_id,
        project_name=ts.project.name if ts.project else None,
        task_id=ts.task_id,
        task_title=ts.task.title if ts.task else None,
        date=ts.date,
        hours=float(ts.hours),
        description=ts.description,
        status=ts.status,
        created_at=ts.created_at,
    )


@router.get("", response_model=list[Timesheet])
def list_timesheets(
    employee_id: Optional[int] = Query(None),
    project_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    q = db.query(TimesheetModel)
    if employee_id:
        q = q.filter(TimesheetModel.employee_id == employee_id)
    elif (current_user.role if isinstance(current_user.role, str) else current_user.role.value) == "employee":
        q = q.filter(TimesheetModel.employee_id == current_user.id)
    if project_id:
        q = q.filter(TimesheetModel.project_id == project_id)
    if date_from:
        q = q.filter(TimesheetModel.date >= date_from)
    if date_to:
        q = q.filter(TimesheetModel.date <= date_to)
    if status:
        q = q.filter(TimesheetModel.status == status)
    return [_build_ts(ts) for ts in q.order_by(TimesheetModel.date.desc()).all()]


@router.post("", response_model=Timesheet, status_code=201)
def create_timesheet(
    body: TimesheetInput,
    db: Session = Depends(get_db),
    current_user: EmployeeModel = Depends(get_current_user),
):
    emp_id = body.employee_id or current_user.id
    ts = TimesheetModel(
        employee_id=emp_id,
        project_id=body.project_id,
        task_id=body.task_id,
        date=body.date,
        hours=body.hours,
        description=body.description,
        status="pending",
    )
    db.add(ts)
    db.commit()
    db.refresh(ts)
    return _build_ts(ts)


@router.patch("/{id}", response_model=Timesheet)
def update_timesheet(
    id: int,
    body: TimesheetUpdate,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    ts = db.query(TimesheetModel).filter(TimesheetModel.id == id).first()
    if not ts:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(ts, field, value)
    db.commit()
    db.refresh(ts)
    return _build_ts(ts)


@router.post("/{id}/approve", response_model=Timesheet)
def approve_timesheet(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    ts = db.query(TimesheetModel).filter(TimesheetModel.id == id).first()
    if not ts:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    ts.status = "approved"
    db.commit()
    db.refresh(ts)
    return _build_ts(ts)
