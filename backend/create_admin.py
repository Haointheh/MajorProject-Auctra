from database import SessionLocal
from model import User
from auth import hash_password

db = SessionLocal()

admin_user = User(
    name="Admin",
    email="admin@auctra.com",
    password_hash=hash_password("adminpass123"),
    role="admin",
    kyc_status="approved",
)

db.add(admin_user)
db.commit()
db.refresh(admin_user)

print(f"Admin created with id: {admin_user.id}")

db.close()