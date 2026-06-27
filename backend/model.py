from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from sqlalchemy import Enum as SqlEnum


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
    front_image_path = Column(String, nullable=False)
    back_image_path = Column(String, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="kyc_document")

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
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship("User", backref="auctions")
    images = relationship("AuctionImage", back_populates="auction", cascade="all, delete-orphan")


class AuctionImage(Base):
    __tablename__ = "auction_images"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=False)
    image_path = Column(String, nullable=False)

    auction = relationship("Auction", back_populates="images")