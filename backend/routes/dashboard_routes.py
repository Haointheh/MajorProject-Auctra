from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import require_approved_seller, require_kyc_approved_bidder, require_role
from schemas.dashboard_schemas import SellerDashboardResponse, BidderDashboardResponse, AdminDashboardResponse
from services.seller_dashboard import get_seller_dashboard_data
from services.bidder_dashboard import get_bidder_dashboard_data
from services.admin_dashboard import get_admin_dashboard_data

router = APIRouter()

@router.get("/bidder/dashboard", response_model=BidderDashboardResponse)
def bidder_dashboard(
    current_user=Depends(require_kyc_approved_bidder),
    db: Session = Depends(get_db),
):
    return get_bidder_dashboard_data(current_user.id, db)


@router.get("/seller/dashboard", response_model=SellerDashboardResponse)
def seller_dashboard(
    current_user=Depends(require_approved_seller),
    db: Session = Depends(get_db),
):
    return get_seller_dashboard_data(current_user.id, db)

@router.get("/bidder/dashboard", response_model=BidderDashboardResponse)
def bidder_dashboard(
    current_user=Depends(require_kyc_approved_bidder),
    db: Session = Depends(get_db),
):
    return get_bidder_dashboard_data(current_user.id, db)

@router.get("/admin/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(
    current_user=Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    return get_admin_dashboard_data(db)