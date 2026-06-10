from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, decode_token
from app.core.config import settings
from app.models.employee import Employee
from app.schemas.auth import LoginInput, AuthToken, UserProfile, ResetPasswordInput

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Employee:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(Employee).filter(Employee.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def _build_user_profile(user: Employee) -> UserProfile:
    dept_name = user.department.name if user.department else None
    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role if isinstance(user.role, str) else user.role.value,
        avatar_url=user.avatar_url,
        department_id=user.department_id,
        department_name=dept_name,
        job_title=user.job_title,
    )


@router.post("/login", response_model=AuthToken)
def login(body: LoginInput, db: Session = Depends(get_db)):
    user = db.query(Employee).filter(Employee.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return AuthToken(
        access_token=token,
        token_type="bearer",
        user=_build_user_profile(user)
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user: Employee = Depends(get_current_user)):
    return _build_user_profile(current_user)


@router.post("/reset-password")
def reset_password(body: ResetPasswordInput, db: Session = Depends(get_db)):
    from app.core.security import get_password_hash
    user = db.query(Employee).filter(Employee.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that email address")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user.password_hash = get_password_hash(body.new_password)
    db.commit()
    return {"message": "Password reset successfully"}
