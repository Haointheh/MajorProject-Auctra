// Connects to backend's /ws/admin/dashboard?token=... — admin-only, one
// connection per page that needs it (unlike useNotificationSocket, this
// isn't opened app-wide in App.jsx, since only admin pages need it).
//
// Every message on this socket has the same shape:
//   { type: "dashboard_refresh", reason: "...", ... }
// The reason/extra fields are there for debugging/logging, but callers
// don't need to branch on them — any message means "something changed on
// the backend, go refetch" (see main.py + auction_routes.py's
// broadcast_to_admins call sites: auction resolution, payment deadline
// processing, and complete-purchase).

import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { BASE_URL } from "../api/client";

const WS_BASE_URL = BASE_URL.replace(/^http/, "ws");

export default function useAdminDashboardSocket(onUpdate) {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Ref so the effect doesn't need onUpdate in its dependency array —
  // typically a new inline function every render, which would otherwise reconnect the socket constantly 
  // (same pattern as useAuctionRoomSocket's onBid/onStatusChange).
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/admin/dashboard?token=${token}`);

    ws.onopen = () => {
      console.log("[admin dashboard] connected");
    };

    ws.onerror = (event) => {
      console.error("[admin dashboard] connection error", event);
    };

    ws.onclose = (event) => {
      // Code 1008 here means the backend rejected the token OR the
      // connected user isn't an admin (see websocket_routes.py) — expected
      // if this hook ever gets used from a non-admin page by mistake.
      console.log(`[admin dashboard] closed (code ${event.code}${event.reason ? `: ${event.reason}` : ""})`);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      onUpdateRef.current?.(data);
    };

    return () => ws.close();
  }, [isAuthenticated, token]);
}