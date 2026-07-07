from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL) # actual connection to postgreSQL database

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #is how you'll talk to the database in each request

Base = declarative_base() #is what all your table models (User, Auction, Bid, etc.) will inherit from


def get_db(): #is a helper FastAPI will use to give each request a fresh database session and clean it up afterward
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()