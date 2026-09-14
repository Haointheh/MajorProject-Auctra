from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from model import User
from auth import require_approved_seller, require_kyc_approved_bidder, require_role
from schemas.dashboard_schemas import SellerDashboardResponse, BidderDashboardResponse, AdminDashboardResponse, AdminUserEntry
from services.seller_dashboard import get_seller_dashboard_data
from services.bidder_dashboard import get_bidder_dashboard_data
from services.admin_dashboard import get_admin_dashboard_data, get_all_users_for_admin
from services.connection_manager import manager

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


@router.get("/admin/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(
    current_user=Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    return get_admin_dashboard_data(db)


@router.get("/admin/users", response_model=list[AdminUserEntry])
def admin_all_users(
    current_user=Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    return get_all_users_for_admin(db)


@router.patch("/admin/users/{user_id}/block")
async def block_user(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot block an admin account")

    user.is_blocked = True
    db.commit()

    # auth.py's get_current_user already rejects every *new* request from
    # this user from here on — but if they're already logged in and mid-
    # session (e.g. sitting on an auction page), that only takes effect on
    # their next API call. Push it live instead, over the same personal
    # notification socket every other per-user push already uses, so they
    # get logged out immediately rather than continuing to click around
    # until something eventually 403s. "type" (not "notification_type")
    # is what useNotificationSocket.js checks to route this to a forced
    # logout instead of the normal notification bell/toast path.
    await manager.send_to_user(user.id, {"type": "account_blocked"})

    return {"message": f"User {user.email} has been blocked."}


@router.patch("/admin/users/{user_id}/unblock")
async def unblock_user(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_blocked = False
    db.commit()

    # Purely informational — nothing on the frontend actually needs to
    # change state to "re-enable" bidding/collateral, since nothing was
    # disabled client-side to begin with (the block was always enforced
    # server-side). This just lets them know right away instead of finding
    # out only when they happen to try something and it works.
    await manager.send_to_user(user.id, {"type": "account_unblocked"})

    return {"message": f"User {user.email} has been unblocked."}