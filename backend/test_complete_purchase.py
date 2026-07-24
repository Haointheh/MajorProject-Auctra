from database import SessionLocal
from model import Auction
from backend.services.payment_completion import complete_purchase

db = SessionLocal()

try:
    auction = db.query(Auction).filter(Auction.id == 5).first()

    if not auction:
        print("Auction 5 not found.")
    else:
        print(f"Auction 5 found. is_resolved={auction.is_resolved}, payment_completed={auction.payment_completed}")

        result = complete_purchase(
            auction=auction,
            payment_method="esewa",
            transaction_reference="TXN-TEST-001",
            db=db,
        )

        db.commit()

        print("Purchase completed successfully:")
        print(result)

except ValueError as e:
    print(f"Validation error: {e}")
    db.rollback()

finally:
    db.close()