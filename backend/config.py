from dotenv import load_dotenv
import os

load_dotenv()
MIN_BID_INCREMENT = 100
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES"))
COLLATERAL_PERCENTAGE = 0.10 