// Live via WebSocket now (see hooks/useNotificationSocket.js, connected
// once app-wide from App.jsx) — this fetches the notification history
// once on mount (GET /notifications/me), then relies on the shared store
// for anything new pushed in real time. Covers: first_bid (seller), outbid
// (bidder), ending_soon (bidders + seller). See routes/notification_routes.py.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdNotificationsNone } from "react-icons/md";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { apiGetAuction } from "../api/auctions";
import {
  apiGetNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from "../api/notifications";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationBell({ align = "right" }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const ref = useRef(null);

  const [open, setOpen] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllReadInStore = useNotificationStore((s) => s.markAllRead);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!isAuthenticated) return;
    apiGetNotifications()
      .then((res) => setNotifications(res.data || []))
      .catch(() => {
        // Silent — history fetch failing shouldn't break the bell; new
        // notifications will still arrive live via the socket regardless.
      });
  }, [isAuthenticated, setNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const handleNotificationClick = (n) => {
    if (!n.is_read) {
      apiMarkNotificationRead(n.id).catch(() => {});
      markRead(n.id);
    }
    setOpen(false);
    if (n.related_auction_id) {
      // Route is /auctions/:category/:id — the notification only carries
      // the id, so fetch the auction to get its category before navigating.
      apiGetAuction(n.related_auction_id)
        .then((res) => {
          navigate(`/auctions/${res.data.category}/${n.related_auction_id}`);
        })
        .catch(() => {});
    }
  };

  const handleMarkAllRead = () => {
    apiMarkAllNotificationsRead()
      .then(() => {
        markAllReadInStore();
      })
      .catch(() => {});
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors"
        aria-label="Notifications"
      >
        <MdNotificationsNone size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 shadow-lg z-50 ${
            align === "left" ? "left-0 right-auto" : "right-0 left-auto"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    !n.is_read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm ${!n.is_read ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}