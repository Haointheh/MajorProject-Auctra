from fastapi import FastAPI, Depends
from database import Base, engine, SessionLocal
from routes.auth_routes import router as auth_router
from routes.kyc_routes import router as kyc_router
from routes.auction_routes import router as auction_router
from auth import get_current_user
from model import User, Auction
import model
from routes.bidding_routes import router as bidding_router
from routes.collateral_routes import router as collateral_router
from routes.dashboard_routes import router as dashboard_router
from routes.notification_routes import router as notification_router
from routes.websocket_routes import router as websocket_router
from services.auction_resolution import resolve_auction
from services.payment_deadline_job import send_payment_reminders, cascade_overdue_payments, fail_expired_cascades
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
import os           #added
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from services.ending_soon_job import send_ending_soon_notifications
from services.connection_manager import manager
from services.countdown_job import broadcast_countdowns

app = FastAPI()

# Allow the Vite dev server (and any other local frontend ports) to call this API.
# Add your deployed frontend URL here too once you have one.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/kyc", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(kyc_router)
app.include_router(auction_router)
app.include_router(bidding_router)
app.include_router(collateral_router)
app.include_router(dashboard_router)
app.include_router(notification_router)
app.include_router(websocket_router)


async def _push_notifications(db, notifications):
    """
    Shared helper: refresh each freshly-committed Notification row and push
    it live to its user over the personal notification websocket. Runs on
    the same event loop as the websocket connections themselves (since the
    scheduler is now AsyncIOScheduler), so this is safe to await directly —
    no asyncio.run() needed, unlike the old BackgroundScheduler setup.
    """
    for notification in notifications:
        db.refresh(notification)
        await manager.send_to_user(notification.user_id, {
            "id": notification.id,
            "notification_type": notification.notification_type,
            "message": notification.message,
            "related_auction_id": notification.related_auction_id,
            "created_at": notification.created_at.isoformat(),
        })


async def close_ended_auctions():
    db = SessionLocal()
    try:
        ended_auctions = (
            db.query(Auction)
            .filter(Auction.end_time < datetime.now(), Auction.is_resolved == False)
            .all()
        )

        notifications_to_push = []
        for auction in ended_auctions:
            notifications_to_push.extend(resolve_auction(auction, db))

        db.commit()
        await _push_notifications(db, notifications_to_push)

        if ended_auctions:
            print(f"[scheduler] Resolved {len(ended_auctions)} auction(s): {[a.id for a in ended_auctions]}")
            # Admin dashboard shows auction/payment status — resolving an
            # auction changes both, so tell any connected admins to refetch
            # instead of leaving them staring at stale data until a manual
            # page refresh.
            await manager.broadcast_to_admins({
                "type": "dashboard_refresh",
                "reason": "auctions_resolved",
                "auction_ids": [a.id for a in ended_auctions],
            })

            # Same gap as cascade/payment-completion: the countdown job
            # (broadcast_countdowns) already fires "status_changed" the
            # moment the clock passes end_time — but that happens purely
            # from compute_status()'s time check, independent of whether
            # resolve_auction() has actually run yet. So the winner's page
            # can refetch too early (before is_resolved/payment_due_at are
            # set), and since the status string stays "ended" either way,
            # the countdown job never fires a second time to prompt another
            # refetch. Broadcast one explicitly here, after resolution has
            # actually committed, so the Pay Now section reliably appears
            # without a manual refresh.
            for auction in ended_auctions:
                await manager.broadcast_to_room(auction.id, {
                    "type": "status_changed",
                    "auction_id": auction.id,
                    "new_status": "ended",
                })
    finally:
        db.close()


async def process_payment_deadlines():
    db = SessionLocal()
    try:
        notifications_to_push = []
        notifications_to_push.extend(send_payment_reminders(db))
        notifications_to_push.extend(cascade_overdue_payments(db))
        notifications_to_push.extend(fail_expired_cascades(db))

        db.commit()
        await _push_notifications(db, notifications_to_push)

        # Anyone with this auction's detail page open (e.g. the second
        # bidder who just became eligible to pay, or the seller) needs to
        # refetch to see the change — is_cascaded, payment_completed, etc.
        # don't change compute_status()'s scheduled/live/ended string, so
        # the countdown job's own status_changed check never catches this.
        # Reusing "status_changed" here (rather than inventing a new event
        # type) works because both frontend consumers of onStatusChange
        # (AuctionDetailPage, SellerAuctionPage) ignore new_status and just
        # refetch — see useAuctionRoomSocket.js.
        affected_auction_ids = {
            n.related_auction_id for n in notifications_to_push if n.related_auction_id is not None
        }
        for auction_id in affected_auction_ids:
            await manager.broadcast_to_room(auction_id, {
                "type": "status_changed",
                "auction_id": auction_id,
                "new_status": "ended",
            })

        if notifications_to_push:
            await manager.broadcast_to_admins({
                "type": "dashboard_refresh",
                "reason": "payment_deadlines_processed",
            })
    finally:
        db.close()


async def process_ending_soon_notifications():
    db = SessionLocal()
    try:
        notifications_to_push = send_ending_soon_notifications(db)

        db.commit()
        await _push_notifications(db, notifications_to_push)
    finally:
        db.close()


async def process_countdown_broadcast():
    db = SessionLocal()
    try:
        await broadcast_countdowns(db)
    finally:
        db.close()


scheduler = AsyncIOScheduler()
scheduler.add_job(close_ended_auctions, "interval", seconds=30)
scheduler.add_job(process_payment_deadlines, "interval", seconds=30)
scheduler.add_job(process_ending_soon_notifications, "interval", seconds=30)
scheduler.add_job(process_countdown_broadcast, "interval", seconds=1)


@app.on_event("startup")
def start_scheduler():
    scheduler.start()
    print("[scheduler] Started — checking for ended auctions every 30 seconds")


@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()

@app.get("/me") #just for testing
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "role": current_user.role
    }

@app.get("/")
def read_root():
    return {"message": "Auctra backend is running"}

from auth import require_role

@app.get("/admin-only")
def admin_only_route(current_user: User = Depends(require_role(["admin"]))):
    return {"message": f"Welcome admin {current_user.email}"}