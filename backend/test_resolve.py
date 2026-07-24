from database import SessionLocal
from model import Auction
from backend.services.auction_resolution import resolve_auction

db = SessionLocal()

auction_id = 5  # change this to test different auctions

auction = db.query(Auction).filter(Auction.id == auction_id).first()

if not auction:
    print(f"No auction found with id={auction_id}")
else:
    print(f"Before: auction {auction.id} | is_resolved={auction.is_resolved}")
    resolve_auction(auction, db)
    db.commit()
    print(f"After:  auction {auction.id} | is_resolved={auction.is_resolved}")

db.close()

#python test_resolve.py