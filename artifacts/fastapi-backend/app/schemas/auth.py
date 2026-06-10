from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True


class AuthToken(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile


class ResetPasswordInput(BaseModel):
    email: EmailStr
    new_password: str
