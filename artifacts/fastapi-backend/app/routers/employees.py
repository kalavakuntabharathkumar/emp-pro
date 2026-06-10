from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.employee import Employee as EmployeeModel
from app.schemas.employee import Employee, EmployeeInput, EmployeeUpdate, EmployeeListResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/employees", tags=["employees"])


def _build_employee(emp: EmployeeModel) -> Employee:
    return Employee(
        id=emp.id,
        full_name=emp.full_name,
        email=emp.email,
        phone=emp.phone,
        job_title=emp.job_title,
        department_id=emp.department_id,
        department_name=emp.department.name if emp.department else None,
        manager_id=emp.manager_id,
        manager_name=emp.manager.full_name if emp.manager else None,
        status=emp.status,
        role=emp.role,
        hire_date=emp.hire_date,
        salary=float(emp.salary) if emp.salary else None,
        avatar_url=emp.avatar_url,
        address=emp.address,
        created_at=emp.created_at,
    )


@router.get("", response_model=EmployeeListResponse)
def list_employees(
    department_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    q = db.query(EmployeeModel)
    if department_id:
        q = q.filter(EmployeeModel.department_id == department_id)
    if status:
        q = q.filter(EmployeeModel.status == status)
    if search:
        q = q.filter(
            (EmployeeModel.full_name.ilike(f"%{search}%")) |
            (EmployeeModel.email.ilike(f"%{search}%")) |
            (EmployeeModel.job_title.ilike(f"%{search}%"))
        )
    total = q.count()
    employees = q.offset((page - 1) * page_size).limit(page_size).all()
    return EmployeeListResponse(
        items=[_build_employee(e) for e in employees],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=Employee, status_code=201)
def create_employee(
    body: EmployeeInput,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    existing = db.query(EmployeeModel).filter(EmployeeModel.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    password = body.password or "changeme123"
    emp = EmployeeModel(
        full_name=body.full_name,
        email=body.email,
        password_hash=get_password_hash(password),
        phone=body.phone,
        job_title=body.job_title,
        department_id=body.department_id,
        manager_id=body.manager_id,
        status=body.status,
        role=body.role,
        hire_date=body.hire_date,
        salary=body.salary,
        avatar_url=body.avatar_url,
        address=body.address,
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return _build_employee(emp)


@router.get("/{id}", response_model=Employee)
def get_employee(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    emp = db.query(EmployeeModel).filter(EmployeeModel.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _build_employee(emp)


@router.patch("/{id}", response_model=Employee)
def update_employee(
    id: int,
    body: EmployeeUpdate,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    emp = db.query(EmployeeModel).filter(EmployeeModel.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(emp, field, value)
    db.commit()
    db.refresh(emp)
    return _build_employee(emp)


@router.delete("/{id}", status_code=204)
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    emp = db.query(EmployeeModel).filter(EmployeeModel.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
