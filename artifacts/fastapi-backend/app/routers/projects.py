from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.project import Project as ProjectModel
from app.models.task import Task as TaskModel
from app.models.employee import Employee as EmployeeModel
from app.schemas.project import Project, ProjectInput, ProjectUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


def _build_project(p: ProjectModel, db: Session) -> Project:
    task_count = db.query(TaskModel).filter(TaskModel.project_id == p.id).count()
    completed = db.query(TaskModel).filter(
        TaskModel.project_id == p.id,
        TaskModel.status == "done"
    ).count()
    return Project(
        id=p.id,
        name=p.name,
        description=p.description,
        status=p.status,
        priority=p.priority,
        department_id=p.department_id,
        department_name=p.department.name if p.department else None,
        manager_id=p.manager_id,
        manager_name=p.manager.full_name if p.manager else None,
        start_date=p.start_date,
        end_date=p.end_date,
        budget=float(p.budget) if p.budget else None,
        progress=p.progress or 0,
        task_count=task_count,
        completed_task_count=completed,
        created_at=p.created_at,
    )


@router.get("", response_model=list[Project])
def list_projects(
    status: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    q = db.query(ProjectModel)
    if status:
        q = q.filter(ProjectModel.status == status)
    if department_id:
        q = q.filter(ProjectModel.department_id == department_id)
    projects = q.all()
    return [_build_project(p, db) for p in projects]


@router.post("", response_model=Project, status_code=201)
def create_project(
    body: ProjectInput,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    p = ProjectModel(**body.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return _build_project(p, db)


@router.get("/{id}", response_model=Project)
def get_project(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    p = db.query(ProjectModel).filter(ProjectModel.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return _build_project(p, db)


@router.patch("/{id}", response_model=Project)
def update_project(
    id: int,
    body: ProjectUpdate,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    p = db.query(ProjectModel).filter(ProjectModel.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return _build_project(p, db)


@router.delete("/{id}", status_code=204)
def delete_project(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    p = db.query(ProjectModel).filter(ProjectModel.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()
