import os
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Literal

from database import get_db
from model import User, Auction, AuctionImage, CategoryEnum, Bid, Collateral, CollateralStatusEnum
from auth import require_approved_seller, get_current_user
from file_validation import validate_and_read
from schemas.auction_schemas import AuctionResponse, AuctionUpdate, CompletePurchaseRequest
from services.auction_status import compute_status
from services.payment_completion import complete_purchase
from collateral_utils import calculate_collateral_amount             #added

from sqlalchemy import func



router = APIRouter()

UPLOAD_DIR = "uploads/auctions"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/auctions", response_model=list[AuctionResponse])
def list_auctions(db: Session = Depends(get_db)):
    auctions = db.query(Auction).all()

    results = []
    for auction in auctions:
        response = AuctionResponse.model_validate(auction)
        response.status = compute_status(auction)
        
        current_highest = db.query(func.max(Bid.amount)).filter(Bid.auction_id == auction.id).scalar()
        response.current_highest_bid = current_highest
        response.estimated_collateral = calculate_collateral_amount(auction)    #added
        
        results.append(response)

    return results

@router.get("/auctions/{auction_id}", response_model=AuctionResponse)
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    response = AuctionResponse.model_validate(auction)
    response.status = compute_status(auction)

    current_highest = db.query(func.max(Bid.amount)).filter(Bid.auction_id == auction_id).scalar()
    response.current_highest_bid = current_highest
    response.estimated_collateral = calculate_collateral_amount(auction)

    return response


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

    response = AuctionResponse.model_validate(new_auction)
    response.status = compute_status(new_auction)
    return response

@router.patch("/auctions/{auction_id}", response_model=AuctionResponse)
def update_auction(
    auction_id: int,
    payload: AuctionUpdate,
    current_user: User = Depends(require_approved_seller),
    db: Session = Depends(get_db),
):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    if auction.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own auctions")

    if compute_status(auction) != "scheduled":
        raise HTTPException(status_code=400, detail="Auction can only be edited while status is 'scheduled'")

    update_data = payload.model_dump(exclude_unset=True)

    current_duration = auction.end_time - auction.start_time
    new_start_time = update_data.get("start_time", auction.start_time)
    new_duration = timedelta(days=update_data["duration_days"]) if "duration_days" in update_data else current_duration

    if "title" in update_data:
        auction.title = update_data["title"]
    if "description" in update_data:
        auction.description = update_data["description"]
    if "condition" in update_data:
        auction.condition = update_data["condition"]

    auction.start_time = new_start_time
    auction.end_time = new_start_time + new_duration

    db.commit()
    db.refresh(auction)

    response = AuctionResponse.model_validate(auction)
    response.status = compute_status(auction)
    return response

@router.delete("/auctions/{auction_id}")
def delete_auction(
    auction_id: int,
    current_user: User = Depends(require_approved_seller),
    db: Session = Depends(get_db),
):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    if auction.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own auctions")

    if compute_status(auction) != "scheduled":
        raise HTTPException(status_code=400, detail="Auction can only be cancelled while status is 'scheduled'")

    auction.status = "cancelled"
    db.commit()

    return {"message": f"Auction {auction_id} has been cancelled."}

@router.post("/auctions/{auction_id}/complete-purchase")
def complete_purchase_route(
    auction_id: int,
    payload: CompletePurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    bids_query = db.query(Bid).filter(Bid.auction_id == auction_id).order_by(Bid.amount.desc())

    if auction.is_cascaded:
        active_bid = bids_query.offset(1).first()
    else:
        active_bid = bids_query.first()

    if not active_bid:
        raise HTTPException(status_code=400, detail="No eligible bid found for this auction")

    if active_bid.bidder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the current eligible bidder can complete this purchase")

    try:
        result = complete_purchase(
            auction=auction,
            payment_method=payload.payment_method,
            transaction_reference=payload.transaction_reference,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    db.commit()

    return result