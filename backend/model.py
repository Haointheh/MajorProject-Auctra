from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import UniqueConstraint


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # user, seller, or admin
    kyc_status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    kyc_document = relationship("KYCDocument", back_populates="user", uselist=False)

class KYCDocument(Base):
    __tablename__ = "kyc_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    address = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    document_number = Column(String, nullable=False)
    role = Column(String, nullable=False)
    front_image_path = Column(String, nullable=False)
    back_image_path = Column(String, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="kyc_document")

    __table_args__ = (
        UniqueConstraint("document_number", "role", name="uq_document_number_role"),
    )

class CategoryEnum(enum.Enum):
    art = "art"
    fashion = "fashion"
    jewellery = "jewellery"
    antiques = "antiques"
    handicrafts = "handicrafts"


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SqlEnum(CategoryEnum, name="category_enum"), nullable=False)
    condition = Column(String, nullable=False)
    base_price = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String, default="scheduled", nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    payment_completed = Column(Boolean, nullable=False, default=False)
    payment_completed_at = Column(DateTime, nullable=True)
    payment_method = Column(String, nullable=True)
    payment_due_at = Column(DateTime, nullable=True)
    is_cascaded = Column(Boolean, nullable=False, default=False)
    transaction_reference = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship("User", backref="auctions")
    images = relationship("AuctionImage", back_populates="auction", cascade="all, delete-orphan")


class AuctionImage(Base):
    __tablename__ = "auction_images"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=False)
    image_path = Column(String, nullable=False)

    auction = relationship("Auction", back_populates="images")

class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=False)
    bidder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    auction = relationship("Auction", backref="bids")
    bidder = relationship("User", backref="bids")

class CollateralStatusEnum(str, enum.Enum):
    locked = "locked"
    held_for_payment = "held_for_payment"
    released = "released"
    forfeited = "forfeited"
    applied_to_purchase = "applied_to_purchase"


class Collateral(Base):
    __tablename__ = "collaterals"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=False)
    bidder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(SqlEnum(CollateralStatusEnum, name="collateral_status_enum"), default=CollateralStatusEnum.locked, nullable=False)
    payment_due_at = Column(DateTime, nullable=True)
    reminder_sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    auction = relationship("Auction", backref="collaterals")
    bidder = relationship("User", backref="collaterals")

    __table_args__ = (
        UniqueConstraint("auction_id", "bidder_id", name="uq_auction_bidder_collateral"),
    )

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(String, nullable=False)
    related_auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=True)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)