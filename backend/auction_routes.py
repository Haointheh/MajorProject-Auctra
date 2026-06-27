import os
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Literal

from database import get_db
from model import User, Auction, AuctionImage, CategoryEnum
from auth import require_approved_seller
from file_validation import validate_and_read
from auction_schemas import AuctionResponse

router = APIRouter()

UPLOAD_DIR = "uploads/auctions"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/auctions", response_model=AuctionResponse)
def create_auction(
    title: str = Form(...),
    description: str = Form(...),
    category: CategoryEnum = Form(...),
    condition: Literal["excellent", "good", "fair", "poor"] = Form(...),
    base_price: int = Form(...),
    start_time: datetime = Form(...),
    duration_days: int = Form(...),
    images: List[UploadFile] = File(...),
    current_user: User = Depends(require_approved_seller),
    db: Session = Depends(get_db),
):
    # --- Validation that doesn't fit naturally into Form()/Pydantic ---
    if base_price <= 0:
        raise HTTPException(status_code=400, detail="base_price must be greater than 0")

    if duration_days <= 0:
        raise HTTPException(status_code=400, detail="duration_days must be greater than 0")

    if len(images) < 1 or len(images) > 5:
        raise HTTPException(status_code=400, detail="An auction must have between 1 and 5 images")

    # --- Compute end_time from start_time + duration ---
    end_time = start_time + timedelta(days=duration_days)

    # --- Validate all images BEFORE creating anything in the DB ---
    validated_images = []
    for image in images:
        contents = validate_and_read(image)
        validated_images.append((image, contents))

    # --- Create the Auction row first, so it gets an id ---
    new_auction = Auction(
        seller_id=current_user.id,
        title=title,
        description=description,
        category=category,
        condition=condition,
        base_price=base_price,
        start_time=start_time,
        end_time=end_time,
        status="scheduled",
    )
    db.add(new_auction)
    db.commit()
    db.refresh(new_auction)

    # --- Now save image files to disk and create AuctionImage rows ---
    for index, (image, contents) in enumerate(validated_images, start=1):
        ext = os.path.splitext(image.filename)[1]
        image_path = os.path.join(UPLOAD_DIR, f"{new_auction.id}_{index}{ext}")

        with open(image_path, "wb") as f:
            f.write(contents)

        db_image = AuctionImage(auction_id=new_auction.id, image_path=image_path)
        db.add(db_image)

    db.commit()
    db.refresh(new_auction)

    return new_auction