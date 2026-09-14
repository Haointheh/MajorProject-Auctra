import os
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta, date
from typing import Literal, Optional

from database import get_db
from model import User, OTPVerification, KYCDocument
from schemas.schemas import UserResponse, UserLogin, Token, LoginResponse, OTPRequest, OTPVerify
from auth import hash_password, verify_password, create_access_token, get_signup_pending_email
from email_utils import generate_otp, send_otp_email
from file_validation import validate_and_read

router = APIRouter()

UPLOAD_DIR = "uploads/kyc"
os.makedirs(UPLOAD_DIR, exist_ok=True)

DocumentType = Literal["citizenship", "national_id", "passport"]


@router.post("/login", response_model=LoginResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.is_blocked:
        raise HTTPException(
            status_code=403,
            detail="Your account has been blocked. Contact support if you believe this is a mistake.",
        )

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

    # Clears out any previous attempt for this email — including one that
    # got all the way through OTP verification but never finished KYC.
    # That's what makes the whole flow self-healing: there's no dead-end
    # state left behind for a retry to get stuck on.
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


@router.post("/signup/verify", response_model=Token)
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    """
    Confirms the OTP only — does NOT create the account. That's the whole
    point of this redesign: creating the User here (like the old version
    did) meant backing out of the KYC step left a permanent, half-finished
    account with no way to complete or restart it. Now nothing is written
    to `users` until /signup/complete actually succeeds with valid KYC
    documents attached, in the same transaction.

    Returns a short-lived signup_pending token instead of a user — the
    frontend uses this to call /signup/complete next.
    """
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == data.email,
        OTPVerification.otp == data.otp,
        OTPVerification.is_used == False
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.now() > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")

    # Marks the *code* as used, so it can't be replayed to fetch another
    # token — but deliberately does NOT delete the row. It still holds the
    # name/password_hash/role that /signup/complete needs to finally create
    # the account.
    otp_record.is_used = True
    db.commit()

    token_data = {"sub": data.email, "purpose": "signup_pending"}
    access_token = create_access_token(token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=otp_record.role,
        name=otp_record.name,
        email=otp_record.email,
    )


@router.post("/signup/complete", response_model=UserResponse)
def complete_signup(
    date_of_birth: date = Form(...),
    address: str = Form(...),
    document_type: DocumentType = Form(...),
    document_number: str = Form(...),
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...),
    email: str = Depends(get_signup_pending_email),
    db: Session = Depends(get_db),
):
    """
    The actual final step. Creates the User AND the KYCDocument together,
    in one commit — only reachable with a signup_pending token, which only
    exists after OTP verification. If image validation fails below, we
    never reach db.add()/db.commit() at all, so nothing is left behind.
    """
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.is_used == True,
    ).first()

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No verified signup found for this email. Please start signup again.",
        )

    # Safety net: someone else may have registered this email in the
    # window between OTP verification and finishing KYC (e.g. two tabs).
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # --- Validate images BEFORE creating anything in the DB ---
    front_bytes = validate_and_read(front_image)
    back_bytes = validate_and_read(back_image)

    # --- Create the account ---
    new_user = User(
        name=otp_record.name,
        email=otp_record.email,
        password_hash=otp_record.password_hash,
        role=otp_record.role,
    )
    db.add(new_user)
    db.flush()  # assigns new_user.id without ending the transaction

    # --- Save image files to disk now that validation passed ---
    front_ext = os.path.splitext(front_image.filename)[1]
    back_ext = os.path.splitext(back_image.filename)[1]
    front_path = os.path.join(UPLOAD_DIR, f"{new_user.id}_front{front_ext}")
    back_path = os.path.join(UPLOAD_DIR, f"{new_user.id}_back{back_ext}")

    with open(front_path, "wb") as f:
        f.write(front_bytes)
    with open(back_path, "wb") as f:
        f.write(back_bytes)

    new_kyc = KYCDocument(
        user_id=new_user.id,
        date_of_birth=date_of_birth,
        address=address,
        document_type=document_type,
        document_number=document_number,
        role=new_user.role,
        front_image_path=front_path,
        back_image_path=back_path,
    )
    db.add(new_kyc)

    # --- Everything commits together — account + KYC document as one unit ---
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="This document number has already been used to verify an account with the same role.",
        )

    # Signup is fully complete — this pending record has served its purpose.
    db.delete(otp_record)
    db.commit()

    db.refresh(new_user)
    return new_user