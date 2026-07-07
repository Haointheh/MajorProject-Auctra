from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from database import get_db
from model import User
from jose import jwt
from config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_MINUTES



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        purpose: str = payload.get("purpose")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if purpose == "kyc_pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This token cannot be used for this action",
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user

def get_kyc_pending_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        purpose: str = payload.get("purpose")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if purpose != "kyc_pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This token cannot be used for this action",
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user

def require_role(allowed_roles: list):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Not authorized for this action")
        return current_user
    return role_checker

def require_approved_seller(current_user: User = Depends(get_current_user)):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can perform this action")
    if current_user.kyc_status != "approved":
        raise HTTPException(status_code=403, detail=f"KYC must be approved to create auctions (current status: {current_user.kyc_status})")
    return current_user

def require_kyc_approved_bidder(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["user", "seller"]:
        raise HTTPException(status_code=403, detail="Not authorized to place bids")
    if current_user.kyc_status != "approved":
        raise HTTPException(status_code=403, detail=f"KYC must be approved to place bids (current status: {current_user.kyc_status})")
    return current_user