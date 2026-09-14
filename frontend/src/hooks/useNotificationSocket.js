// Connects to backend's /ws/notifications?token=... — one connection for
// the whole app, opened once from App.jsx (not per-page), so it stays
// alive across route changes and feeds NotificationBell + the toast popups
// from the same source instead of each screen opening its own socket.

import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { BASE_URL } from "../api/client";

const WS_BASE_URL = BASE_URL.replace(/^http/, "ws");

export default function useNotificationSocket() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const pushToast = useNotificationStore((s) => s.pushToast);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/notifications?token=${token}`);

    ws.onopen = () => {
      console.log("[notifications] connected");
    };

    ws.onerror = (event) => {
      console.error("[notifications] connection error", event);
    };

    ws.onclose = (event) => {
      // Code 1008 specifically means the backend rejected the token (see
      // websocket_routes.py — invalid/expired JWT, or user not found).
      console.log(`[notifications] closed (code ${event.code}${event.reason ? `: ${event.reason}` : ""})`);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      // Account-status pushes (see dashboard_routes.py's block_user/
      // unblock_user) use "type" — real notifications use "notification_type"
      // instead, so this check can't collide with an ordinary notification.
      if (data.type === "account_blocked") {
        // No dedicated /login route to redirect to — LoginForm is a modal,
        // not a page — so a hard reload to "/" plus an alert (blocking,
        // guaranteed to be seen before the reload wipes React state) is
        // the simplest reliable way to force them out immediately, rather
        // than leaving them clicking around until something eventually
        // 403s on its own.
        useAuthStore.getState().logout();
        window.alert("Your account has been blocked by an admin. You've been logged out.");
        window.location.href = "/";
        return;
      }

      if (data.type === "account_unblocked") {
        pushToast({
          message: "Your account has been unblocked. You can bid and deposit collateral again.",
          related_auction_id: null,
        });
        return;
      }

      addNotification(data);
      pushToast(data);
    };

    return () => ws.close();
    // token changes on login/logout — reconnects with the new session,
    // or tears down entirely once isAuthenticated goes false.
  }, [isAuthenticated, token, addNotification, pushToast]);
}