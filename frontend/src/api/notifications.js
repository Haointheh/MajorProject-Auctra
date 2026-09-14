// Backend writes Notification rows on bid events (first_bid, outbid,
// ending_soon) — see routes/notification_routes.py. Live delivery is via
// WebSocket now (see hooks/useNotificationSocket.js) — apiGetNotifications
// below is only used for the initial history fetch on mount.
import client from "./client";

export const apiGetNotifications = (unreadOnly = false) =>
  client.get("/notifications/me", { params: { unread_only: unreadOnly } });

export const apiMarkNotificationRead = (notificationId) =>
  client.patch(`/notifications/${notificationId}/read`);

export const apiMarkAllNotificationsRead = () =>
  client.patch("/notifications/read-all");
