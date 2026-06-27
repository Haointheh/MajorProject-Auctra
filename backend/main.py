from fastapi import FastAPI, Depends
from database import Base, engine
from auth_routes import router as auth_router
from kyc_routes import router as kyc_router
from auction_routes import router as auction_router
from auth import get_current_user
from model import User
import model

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

app.include_router(kyc_router)

app.include_router(auction_router)

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

