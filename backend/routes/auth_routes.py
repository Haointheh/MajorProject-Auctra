
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from model import User, OTPVerification
from schemas.schemas import UserResponse, UserLogin, Token, LoginResponse, OTPRequest, OTPVerify
from auth import hash_password, verify_password, create_access_token
from email_utils import generate_otp, send_otp_email

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.kyc_status != "approved":
        raise HTTPException(
            status_code=403,
            detail=f"Login not allowed. KYC status: {user.kyc_status}"
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )

    return LoginResponse(user=user, access_token=access_token, token_type="bearer")

@router.post("/signup/request")
def request_otp(user_data: OTPRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = generate_otp()
    expires_at = datetime.now() + timedelta(minutes=10)

    db.query(OTPVerification).filter(
        OTPVerification.email == user_data.email
    ).delete()

    otp_record = OTPVerification(
        email=user_data.email,
        otp=otp,
        name=user_data.name,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        expires_at=expires_at,
        is_used=False
    )

    db.add(otp_record)
    db.commit()

    send_otp_email(user_data.email, otp)

    return {"message": "Verification code sent to your email. Please verify within 10 minutes."}


@router.post("/signup/verify", response_model=UserResponse)
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == data.email,
        OTPVerification.otp == data.otp,
        OTPVerification.is_used == False
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.now() > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")

    new_user = User(
        name=otp_record.name,
        email=otp_record.email,
        password_hash=otp_record.password_hash,
        role=otp_record.role,
    )

    db.add(new_user)

    otp_record.is_used = True

    db.commit()
    db.refresh(new_user)

    return new_user