import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from model import User, KYCDocument
from auth import get_kyc_pending_user

from auth import get_kyc_pending_user, require_role

from schemas import KYCResponse

router = APIRouter()

from file_validation import validate_and_read, ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE

UPLOAD_DIR = "uploads/kyc"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/kyc/submit")
def submit_kyc(
    date_of_birth: date = Form(...),
    address: str = Form(...),
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...),
    current_user: User = Depends(get_kyc_pending_user),
    db: Session = Depends(get_db),
):
    existing = db.query(KYCDocument).filter(KYCDocument.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="KYC already submitted for this user")

    front_bytes = validate_and_read(front_image)
    back_bytes = validate_and_read(back_image)

    front_ext = os.path.splitext(front_image.filename)[1]
    back_ext = os.path.splitext(back_image.filename)[1]

    front_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_front{front_ext}")
    back_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_back{back_ext}")

    with open(front_path, "wb") as f:
        f.write(front_bytes)
    with open(back_path, "wb") as f:
        f.write(back_bytes)

    new_kyc = KYCDocument(
        user_id=current_user.id,
        date_of_birth=date_of_birth,
        address=address,
        front_image_path=front_path,
        back_image_path=back_path,
    )

    db.add(new_kyc)
    db.commit()
    db.refresh(new_kyc)

    return {"message": "KYC submitted successfully. Awaiting admin approval."}

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