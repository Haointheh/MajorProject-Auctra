# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy.exc import IntegrityError

# from database import get_db
# from model import User
# from schemas import UserSignup, UserResponse , SignupResponse
# from auth import hash_password

# from schemas import UserLogin, Token
# from auth import verify_password, create_access_token

# router = APIRouter()

# @router.post("/signup", response_model=SignupResponse)
# def signup(user_data: UserSignup, db: Session = Depends(get_db)):
#     new_user = User(
#         name=user_data.name,
#         email=user_data.email,
#         password_hash=hash_password(user_data.password),
#         role=user_data.role,
#     )

#     db.add(new_user)

#     try:
#         db.commit()
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(status_code=400, detail="Email already registered")

#     db.refresh(new_user)

#     token_data = {"sub": new_user.email, "purpose": "kyc_pending"}
#     access_token = create_access_token(token_data)

#     return SignupResponse(
#         user=new_user,
#         access_token=access_token,
#         token_type="bearer"
#     )

# @router.post("/login", response_model=Token)
# def login(credentials: UserLogin, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.email == credentials.email).first()

#     if not user or not verify_password(credentials.password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     if user.kyc_status != "approved":
#         raise HTTPException(
#             status_code=403,
#             detail=f"Login not allowed. KYC status: {user.kyc_status}"
#         )

#     access_token = create_access_token(
#         data={"sub": user.email, "role": user.role}
#     )

#     return Token(access_token=access_token, token_type="bearer")


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from model import User
from schemas import UserSignup, UserResponse , SignupResponse
from auth import hash_password

from schemas import UserLogin, Token, LoginResponse
from auth import verify_password, create_access_token

router = APIRouter()


@router.post("/signup", response_model=SignupResponse)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
    )

    db.add(new_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

    db.refresh(new_user)

    token_data = {"sub": new_user.email, "purpose": "kyc_pending"}
    access_token = create_access_token(token_data)

    return SignupResponse(
        user=new_user,
        access_token=access_token,
        token_type="bearer"
    )



@router.post("/login", response_model=LoginResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.kyc_status != "approved":
        raise HTTPException(
            status_code=403,
            detail=f"Login not allowed. KYC status: {user.kyc_status}"
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )

    return LoginResponse(user=user, access_token=access_token, token_type="bearer")