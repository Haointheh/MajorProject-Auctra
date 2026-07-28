// src/api/notifications.js
// Backend writes Notification rows on bid events (first_bid, outbid,
// ending_soon) — see routes/notification_routes.py. No push/WebSocket yet,
// so the frontend polls GET /notifications/me.
import client from "./client";

export const apiGetNotifications = (unreadOnly = false) =>
  client.get("/notifications/me", { params: { unread_only: unreadOnly } });

export const apiMarkNotificationRead = (notificationId) =>
  client.patch(`/notifications/${notificationId}/read`);

export const apiMarkAllNotificationsRead = () =>
  client.patch("/notifications/read-all");
