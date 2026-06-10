from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.models.task import Task as TaskModel, task_assignees
from app.models.employee import Employee as EmployeeModel
from app.schemas.task import Task, TaskInput, TaskUpdate, AssigneeInfo
from app.routers.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _build_task(t: TaskModel) -> Task:
    assignees = [
        AssigneeInfo(id=a.id, full_name=a.full_name, avatar_url=a.avatar_url)
        for a in (t.assignees or [])
    ]
    primary = assignees[0] if assignees else None
    return Task(
        id=t.id,
        title=t.title,
        description=t.description,
        status=t.status,
        priority=t.priority,
        project_id=t.project_id,
        project_name=t.project.name if t.project else None,
        assignee_id=primary.id if primary else None,
        assignee_name=primary.full_name if primary else None,
        assignee_avatar=primary.avatar_url if primary else None,
        assignees=assignees,
        due_date=t.due_date,
        estimated_hours=float(t.estimated_hours) if t.estimated_hours else None,
        actual_hours=float(t.actual_hours) if t.actual_hours else None,
        created_at=t.created_at,
    )


def _set_assignees(t: TaskModel, assignee_ids: List[int], db: Session):
    employees = db.query(EmployeeModel).filter(EmployeeModel.id.in_(assignee_ids)).all()
    t.assignees = employees
    t.assignee_id = employees[0].id if employees else None


@router.get("", response_model=list[Task])
def list_tasks(
    project_id: Optional[int] = Query(None),
    assignee_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    q = db.query(TaskModel)
    if project_id:
        q = q.filter(TaskModel.project_id == project_id)
    if assignee_id:
        q = q.filter(
            TaskModel.id.in_(
                db.query(task_assignees.c.task_id).filter(
                    task_assignees.c.employee_id == assignee_id
                )
            )
        )
    if status:
        q = q.filter(TaskModel.status == status)
    if priority:
        q = q.filter(TaskModel.priority == priority)
    return [_build_task(t) for t in q.all()]


@router.post("", response_model=Task, status_code=201)
def create_task(
    body: TaskInput,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    data = body.model_dump(exclude={"assignee_ids"})
    data.pop("assignee_id", None)
    t = TaskModel(**data)
    db.add(t)
    db.flush()
    if body.assignee_ids:
        _set_assignees(t, body.assignee_ids, db)
    db.commit()
    db.refresh(t)
    return _build_task(t)


@router.get("/{id}", response_model=Task)
def get_task(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    t = db.query(TaskModel).filter(TaskModel.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    return _build_task(t)


@router.patch("/{id}", response_model=Task)
def update_task(
    id: int,
    body: TaskUpdate,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    t = db.query(TaskModel).filter(TaskModel.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    data = body.model_dump(exclude_unset=True, exclude={"assignee_ids"})
    data.pop("assignee_id", None)
    for field, value in data.items():
        setattr(t, field, value)
    if body.assignee_ids is not None:
        _set_assignees(t, body.assignee_ids, db)
    db.commit()
    db.refresh(t)
    return _build_task(t)


@router.delete("/{id}", status_code=204)
def delete_task(
    id: int,
    db: Session = Depends(get_db),
    _: EmployeeModel = Depends(get_current_user),
):
    t = db.query(TaskModel).filter(TaskModel.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(t)
    db.commit()
