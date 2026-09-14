from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database import get_db
from model import User
from config import JWT_SECRET_KEY, JWT_ALGORITHM
from services.connection_manager import manager

router = APIRouter()


@router.websocket("/ws/notifications")
async def notifications_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    # Step 1: decode the token BEFORE accepting the connection.
    # If it's invalid, we reject the connection outright.
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email is None:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    # Step 2: look up the user, same as get_current_user does
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        await websocket.close(code=1008)
        return

    # Step 3: accept the connection and register it in the manager
    await manager.connect_user(user.id, websocket)

    # Step 4: keep the connection open, listening for a disconnect
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_user(user.id)

@router.websocket("/ws/auctions/{auction_id}")
async def auction_room_websocket(websocket: WebSocket, auction_id: int):
    # No auth check here — anyone can watch, per our earlier decision.
    await manager.connect_to_room(auction_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_from_room(auction_id, websocket)


@router.websocket("/ws/admin/dashboard")
async def admin_dashboard_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    # Same token check as /ws/notifications, plus a role check — only
    # admins get to sit in this broadcast. Every message sent here is a
    # lightweight "something changed, go refetch" signal (see
    # broadcast_to_admins call sites: auction resolution, payment deadline
    # jobs, ending-soon job, and complete-purchase) rather than a stored
    # Notification, since it's a dashboard refresh trigger, not a personal
    # notification the admin needs to read/dismiss.
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email is None:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    user = db.query(User).filter(User.email == email).first()
    if user is None or user.role != "admin":
        await websocket.close(code=1008)
        return

    await manager.connect_admin(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)