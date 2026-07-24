# import os
# import shutil
# from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
# from sqlalchemy.orm import Session
# from datetime import date

# from database import get_db
# from model import User, KYCDocument
# from auth import get_kyc_pending_user

# from auth import get_kyc_pending_user, require_role

# from schemas import KYCResponse

# from typing import Literal
# from sqlalchemy.exc import IntegrityError

# router = APIRouter()

# from file_validation import validate_and_read, ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE

# UPLOAD_DIR = "uploads/kyc"
# os.makedirs(UPLOAD_DIR, exist_ok=True)


# DocumentType = Literal["citizenship", "national_id", "passport"]

# @router.post("/kyc/submit")
# def submit_kyc(
#     date_of_birth: date = Form(...),
#     address: str = Form(...),
#     document_type: DocumentType = Form(...),
#     document_number: str = Form(...),
#     front_image: UploadFile = File(...),
#     back_image: UploadFile = File(...),
#     current_user: User = Depends(get_kyc_pending_user),
#     db: Session = Depends(get_db),
# ):
#     existing = db.query(KYCDocument).filter(KYCDocument.user_id == current_user.id).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="KYC already submitted for this user")

#     front_bytes = validate_and_read(front_image)
#     back_bytes = validate_and_read(back_image)

#     front_ext = os.path.splitext(front_image.filename)[1]
#     back_ext = os.path.splitext(back_image.filename)[1]

#     front_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_front{front_ext}")
#     back_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_back{back_ext}")

#     with open(front_path, "wb") as f:
#         f.write(front_bytes)
#     with open(back_path, "wb") as f:
#         f.write(back_bytes)

#     new_kyc = KYCDocument(
#         user_id=current_user.id,
#         date_of_birth=date_of_birth,
#         address=address,
#         document_type=document_type,
#         document_number=document_number,
#         role=current_user.role,
#         front_image_path=front_path,
#         back_image_path=back_path,
#     )

#     db.add(new_kyc)

#     try:
#         db.commit()
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(
#             status_code=400,
#             detail="This document number has already been used to verify an account with the same role."
#         )

#     db.refresh(new_kyc)

#     return {"message": "KYC submitted successfully. Awaiting admin approval."}

# @router.get("/kyc/pending", response_model=list[KYCResponse])
# def list_pending_kyc(
#     current_user: User = Depends(require_role(["admin"])),
#     db: Session = Depends(get_db),
# ):
#     pending_docs = (
#         db.query(KYCDocument)
#         .join(User)
#         .filter(User.kyc_status == "pending")
#         .all()
#     )
#     return pending_docs

# @router.patch("/kyc/{kyc_id}/approve")
# def approve_kyc(
#     kyc_id: int,
#     current_user: User = Depends(require_role(["admin"])),
#     db: Session = Depends(get_db),
# ):
#     kyc_doc = db.query(KYCDocument).filter(KYCDocument.id == kyc_id).first()
#     if not kyc_doc:
#         raise HTTPException(status_code=404, detail="KYC submission not found")

#     kyc_doc.user.kyc_status = "approved"
#     db.commit()

#     return {"message": f"KYC for user {kyc_doc.user.email} approved."}


# @router.patch("/kyc/{kyc_id}/reject")
# def reject_kyc(
#     kyc_id: int,
#     current_user: User = Depends(require_role(["admin"])),
#     db: Session = Depends(get_db),
# ):
#     kyc_doc = db.query(KYCDocument).filter(KYCDocument.id == kyc_id).first()
#     if not kyc_doc:
#         raise HTTPException(status_code=404, detail="KYC submission not found")

#     kyc_doc.user.kyc_status = "rejected"
#     db.commit()

#     return {"message": f"KYC for user {kyc_doc.user.email} rejected."}


# @router.post("/kyc/resume", response_model=Token)
# def resume_kyc(credentials: UserLogin, db: Session = Depends(get_db)):
#     """
#     Re-issue a fresh 'kyc_pending' token for an account whose original
#     signup token expired, or whose KYC was rejected and needs resubmitting.
#     Login stays blocked for unapproved accounts, so this is the only way
#     back in for them — it re-verifies the password just like /login does.
#     """
#     user = db.query(User).filter(User.email == credentials.email).first()

#     if not user or not verify_password(credentials.password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     if user.kyc_status == "approved":
#         raise HTTPException(status_code=400, detail="KYC already approved. Please log in normally.")

#     token_data = {"sub": user.email, "purpose": "kyc_pending"}
#     access_token = create_access_token(token_data)

#     return Token(access_token=access_token, token_type="bearer")




# import optional added
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from model import User, KYCDocument
from auth import get_kyc_pending_user, verify_password, create_access_token

from auth import get_kyc_pending_user, require_role

from schemas.schemas import KYCResponse, UserLogin, Token

from typing import Literal , Optional                                
from sqlalchemy.exc import IntegrityError

router = APIRouter()

from file_validation import validate_and_read, ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE

UPLOAD_DIR = "uploads/kyc"
os.makedirs(UPLOAD_DIR, exist_ok=True)


DocumentType = Literal["citizenship", "national_id", "passport"]


@router.post("/kyc/resume", response_model=Token)
def resume_kyc(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Re-issue a fresh 'kyc_pending' token for an account whose original
    signup token expired, or whose KYC was rejected and needs resubmitting.
    Login stays blocked for unapproved accounts, so this is the only way
    back in for them — it re-verifies the password just like /login does.
    """
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.kyc_status == "approved":
        raise HTTPException(status_code=400, detail="KYC already approved. Please log in normally.")

    token_data = {"sub": user.email, "purpose": "kyc_pending"}
    access_token = create_access_token(token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        name=user.name,
        email=user.email,
    )


@router.get("/kyc/me", response_model=KYCResponse)
def get_my_kyc(
    current_user: User = Depends(get_kyc_pending_user),
    db: Session = Depends(get_db),
):
    """
    Lets the frontend pre-fill the resubmission form with whatever was
    submitted previously (used on the "Resume verification" screen).
    Only works with a kyc_pending token, same as /kyc/submit.
    """
    kyc_doc = db.query(KYCDocument).filter(KYCDocument.user_id == current_user.id).first()
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="No previous KYC submission found")
    return kyc_doc   

@router.get("/kyc/pending", response_model=list[KYCResponse])
def list_pending_kyc(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    pending_docs = (
        db.query(KYCDocument)
        .join(User)
        .filter(User.kyc_status == "pending")
        .all()
    )
    return pending_docs

@router.patch("/kyc/{kyc_id}/approve")
def approve_kyc(
    kyc_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    kyc_doc = db.query(KYCDocument).filter(KYCDocument.id == kyc_id).first()
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="KYC submission not found")

    kyc_doc.user.kyc_status = "approved"
    db.commit()

    return {"message": f"KYC for user {kyc_doc.user.email} approved."}


@router.patch("/kyc/{kyc_id}/reject")
def reject_kyc(
    kyc_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    kyc_doc = db.query(KYCDocument).filter(KYCDocument.id == kyc_id).first()
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="KYC submission not found")

    kyc_doc.user.kyc_status = "rejected"
    db.commit()

    return {"message": f"KYC for user {kyc_doc.user.email} rejected."}


# ... (rest of your existing imports/setup stay the same)

# @router.get("/kyc/me", response_model=KYCResponse)
# def get_my_kyc(
#     current_user: User = Depends(get_kyc_pending_user),
#     db: Session = Depends(get_db),
# ):
#     """
#     Lets the frontend pre-fill the resubmission form with whatever was
#     submitted previously (used on the "Resume verification" screen).
#     Only works with a kyc_pending token, same as /kyc/submit.
#     """
#     kyc_doc = db.query(KYCDocument).filter(KYCDocument.user_id == current_user.id).first()
#     if not kyc_doc:
#         raise HTTPException(status_code=404, detail="No previous KYC submission found")
#     return kyc_doc


@router.post("/kyc/submit")
def submit_kyc(
    date_of_birth: Optional[date] = Form(None),
    address: Optional[str] = Form(None),
    document_type: Optional[DocumentType] = Form(None),
    document_number: Optional[str] = Form(None),
    front_image: Optional[UploadFile] = File(None),
    back_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_kyc_pending_user),
    db: Session = Depends(get_db),
):
    existing = db.query(KYCDocument).filter(KYCDocument.user_id == current_user.id).first()

    # A previous submission is only blocking if it's still pending review or
    # was already approved. A rejected submission can be overwritten so the
    # user isn't permanently locked out.
    if existing and current_user.kyc_status != "rejected":
        raise HTTPException(status_code=400, detail="KYC already submitted for this user")

    if not existing:
        # First-time submission — nothing to fall back to, so every field
        # is actually required.
        missing = [
            name
            for name, val in [
                ("date_of_birth", date_of_birth),
                ("address", address),
                ("document_type", document_type),
                ("document_number", document_number),
                ("front_image", front_image),
                ("back_image", back_image),
            ]
            if val is None
        ]
        if missing:
            raise HTTPException(
                status_code=422,
                detail=f"Missing required fields: {', '.join(missing)}"
            )

    # Resolve final values: whatever was provided this time, otherwise keep
    # whatever was on the previous (rejected) submission.
    final_dob = date_of_birth if date_of_birth is not None else existing.date_of_birth
    final_address = address if address is not None else existing.address
    final_document_type = document_type if document_type is not None else existing.document_type
    final_document_number = document_number if document_number is not None else existing.document_number

    front_path = existing.front_image_path if existing else None
    back_path = existing.back_image_path if existing else None

    if front_image is not None:
        front_bytes = validate_and_read(front_image)
        front_ext = os.path.splitext(front_image.filename)[1]
        front_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_front{front_ext}")
        with open(front_path, "wb") as f:
            f.write(front_bytes)

    if back_image is not None:
        back_bytes = validate_and_read(back_image)
        back_ext = os.path.splitext(back_image.filename)[1]
        back_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_back{back_ext}")
        with open(back_path, "wb") as f:
            f.write(back_bytes)

    if existing:
        # Resubmission after rejection — overwrite the previous record and
        # put the account back in the review queue. Any field left out of
        # this submission just keeps its old value (set above).
        existing.date_of_birth = final_dob
        existing.address = final_address
        existing.document_type = final_document_type
        existing.document_number = final_document_number
        existing.front_image_path = front_path
        existing.back_image_path = back_path
        current_user.kyc_status = "pending"

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="This document number has already been used to verify an account with the same role."
            )

        return {"message": "KYC resubmitted successfully. Awaiting admin approval."}

    new_kyc = KYCDocument(
        user_id=current_user.id,
        date_of_birth=final_dob,
        address=final_address,
        document_type=final_document_type,
        document_number=final_document_number,
        role=current_user.role,
        front_image_path=front_path,
        back_image_path=back_path,
    )

    db.add(new_kyc)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="This document number has already been used to verify an account with the same role."
        )

    db.refresh(new_kyc)

    return {"message": "KYC submitted successfully. Awaiting admin approval."}