from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.department import Department as DepartmentModel
from app.models.employee import Employee as EmployeeModel
from app.schemas.department import Department, DepartmentInput, DepartmentUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/departments", tags=["departments"])


def _build_dept(dept: DepartmentModel, db: Session) -> Department:
    head_name = None
    if dept.head_id:
        head = db.query(EmployeeModel).filter(EmployeeModel.id == dept.head_id).first()
        head_name = head.full_name if head else None
    count = db.query(EmployeeModel).filter(EmployeeModel.department_id == dept.id).count()
    return Department(
        id=dept.id,
        name=dept.name,
        description=dept.description,
        head_id=dept.head_id,
        head_name=head_name,
        employee_count=count,
        created_at=dept.created_at,
    )


@router.get("", response_model=list[Department])
def list_departments(
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    depts = db.query(DepartmentModel).all()
    return [_build_dept(d, db) for d in depts]


@router.post("", response_model=Department, status_code=201)
def create_department(
    body: DepartmentInput,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    dept = DepartmentModel(name=body.name, description=body.description, head_id=body.head_id)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return _build_dept(dept, db)


@router.get("/{id}", response_model=Department)
def get_department(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    dept = db.query(DepartmentModel).filter(DepartmentModel.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return _build_dept(dept, db)


@router.patch("/{id}", response_model=Department)
def update_department(
    id: int,
    body: DepartmentUpdate,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    dept = db.query(DepartmentModel).filter(DepartmentModel.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    return _build_dept(dept, db)
