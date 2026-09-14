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
    password_bytes = plain_password.encode("utf-8")
    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too long. Please use 72 characters or fewer.",
        )
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

    # Neither of these purpose-scoped tokens correspond to a real, existing
    # User row yet (kyc_pending does, but is deliberately still walled off
    # from general use; signup_pending never does, by design — the whole
    # point is the account doesn't exist until /signup/complete succeeds).
    if purpose in ("kyc_pending", "signup_pending"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This token cannot be used for this action",
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    # This was missing entirely — admin's block/unblock (dashboard_routes.py)
    # only ever set the is_blocked flag; nothing actually checked it, so a
    # blocked user could keep bidding, winning, depositing collateral, etc.
    # Checking here (rather than adding a one-off check in bidding_routes.py)
    # means every endpoint behind get_current_user — directly, or via
    # require_role/require_approved_seller/require_kyc_approved_bidder,
    # which all wrap this — is covered in one place.
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Contact support if you believe this is a mistake.",
        )

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

def get_signup_pending_email(token: str = Depends(oauth2_scheme)) -> str:
    """
    Used only by POST /signup/complete. Unlike get_kyc_pending_user, there's
    no User row to look up yet at this stage — the whole point of this
    token is to authorize finishing signup for an email that passed OTP
    verification, without an account existing until that final step
    actually succeeds. Returns the verified email itself; the route looks
    up the still-pending OTPVerification row from there.
    """
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

    if purpose != "signup_pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This token cannot be used for this action",
        )

    return email

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