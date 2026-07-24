# from fastapi import FastAPI, Depends
# from database import Base, engine
# from auth_routes import router as auth_router
# from kyc_routes import router as kyc_router
# from auction_routes import router as auction_router
# from auth import get_current_user
# from model import User
# import model

# app = FastAPI()

# Base.metadata.create_all(bind=engine)

# app.include_router(auth_router)

# app.include_router(kyc_router)

# app.include_router(auction_router)

# @app.get("/me") #just for testing
# def read_current_user(current_user: User = Depends(get_current_user)):
#     return {
#         "email": current_user.email,
#         "role": current_user.role
#     }

# @app.get("/")
# def read_root():
#     return {"message": "Auctra backend is running"}

# from auth import require_role

# @app.get("/admin-only")
# def admin_only_route(current_user: User = Depends(require_role(["admin"]))):
#     return {"message": f"Welcome admin {current_user.email}"}

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
from services.auction_resolution import resolve_auction
from services.payment_deadline_job import send_payment_reminders, cascade_overdue_payments, fail_expired_cascades
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import os           #added
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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


def close_ended_auctions():
    db = SessionLocal()
    try:
        ended_auctions = (
            db.query(Auction)
            .filter(Auction.end_time < datetime.now(), Auction.is_resolved == False)
            .all()
        )
        for auction in ended_auctions:
            resolve_auction(auction, db)
        db.commit()
        if ended_auctions:
            print(f"[scheduler] Resolved {len(ended_auctions)} auction(s): {[a.id for a in ended_auctions]}")
    finally:
        db.close()


def process_payment_deadlines():
    db = SessionLocal()
    try:
        send_payment_reminders(db)
        cascade_overdue_payments(db)
        fail_expired_cascades(db)
        db.commit()
    finally:
        db.close()


scheduler = BackgroundScheduler()
scheduler.add_job(close_ended_auctions, "interval", seconds=30)
scheduler.add_job(process_payment_deadlines, "interval", seconds=30)


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