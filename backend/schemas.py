from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import date, datetime


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["user", "seller"]  # admin can never be chosen here


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    kyc_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

class KYCUserInfo(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class KYCResponse(BaseModel):
    id: int
    date_of_birth: date
    address: str
    front_image_path: str
    back_image_path: str
    submitted_at: datetime
    user: KYCUserInfo

    class Config:
        from_attributes = True

class SignupResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"

