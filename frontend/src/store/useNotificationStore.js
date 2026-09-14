// Shared across the app so a single global WebSocket connection
// (useNotificationSocket, opened once in App.jsx) can feed both
// NotificationBell's list and the popup toasts, instead of each needing
// its own connection.

import { create } from "zustand";

let toastIdCounter = 0;

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  toasts: [],

  // Full replace — used for the initial GET /notifications/me fetch.
  setNotifications: (notifications) => set({ notifications }),

  // A fresh push from the socket is always unread by definition — the
  // backend's websocket payload doesn't include is_read at all (see
  // bidding_routes.py's manager.send_to_user call), unlike the REST
  // response, so it's set explicitly here.
  addNotification: (notification) =>
    set((state) => ({
      notifications: [{ ...notification, is_read: false }, ...state.notifications],
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    })),

  // Popup toasts — separate from the persisted notification list so
  // dismissing a toast (or letting it auto-expire) doesn't affect what
  // shows up in the bell's dropdown.
  pushToast: (notification) => {
    const toastId = `toast-${++toastIdCounter}`;
    set((state) => ({ toasts: [...state.toasts, { ...notification, toastId }] }));
    setTimeout(() => get().dismissToast(toastId), 6000);
  },

  dismissToast: (toastId) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.toastId !== toastId) })),
}));
