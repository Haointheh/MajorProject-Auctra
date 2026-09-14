from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.user_connections: Dict[int, WebSocket] = {}
        self.auction_rooms: Dict[int, List[WebSocket]] = {}
        self.last_known_status: Dict[int, str] = {}
        self.admin_connections: List[WebSocket] = []

    # ---- Type 1: personal notification connections ----

    async def connect_user(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.user_connections[user_id] = websocket

    def disconnect_user(self, user_id: int):
        self.user_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: dict):
        websocket = self.user_connections.get(user_id)
        if websocket is not None:
            await websocket.send_json(message)

    # ---- Type 2: auction room connections ----

    async def connect_to_room(self, auction_id: int, websocket: WebSocket):
        await websocket.accept()
        self.auction_rooms.setdefault(auction_id, []).append(websocket)

    def disconnect_from_room(self, auction_id: int, websocket: WebSocket):
        room = self.auction_rooms.get(auction_id)
        if room and websocket in room:
            room.remove(websocket)
            if not room:
                del self.auction_rooms[auction_id]

    async def broadcast_to_room(self, auction_id: int, message: dict):
        for websocket in self.auction_rooms.get(auction_id, []):
            await websocket.send_json(message)

    # ---- Type 3: admin dashboard broadcast connections ----
    # Not tied to any single auction — any connected admin gets every
    # broadcast, so the admin overview/auction-status views can update live
    # instead of needing a manual refresh after an auction resolves, a
    # payment deadline passes, or a payment is completed.

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_connections.append(websocket)

    def disconnect_admin(self, websocket: WebSocket):
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)

    async def broadcast_to_admins(self, message: dict):
        # A dead/broken connection here shouldn't stop the rest of the
        # admins from getting the update, so isolate failures per-socket
        # rather than letting one bad connection break the loop.
        for websocket in list(self.admin_connections):
            try:
                await websocket.send_json(message)
            except Exception:
                self.disconnect_admin(websocket)


manager = ConnectionManager()