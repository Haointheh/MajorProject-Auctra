// Renders popup notifications pushed over the websocket (see
// useNotificationSocket + useNotificationStore). Mounted once in App.jsx,
// inside <BrowserRouter> so useNavigate works, so it's visible regardless
// of which page/layout is currently active.

import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/useNotificationStore";
import { apiGetAuction } from "../api/auctions";

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  const handleClick = (toast) => {
    dismissToast(toast.toastId);
    if (toast.related_auction_id) {
      // Route is /auctions/:category/:id — the notification only carries id
      apiGetAuction(toast.related_auction_id)
        .then((res) => {
          navigate(`/auctions/${res.data.category}/${toast.related_auction_id}`);
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed top-20 right-4 z-100 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.toastId}
          onClick={() => handleClick(toast)}
          className="bg-white border border-slate-200 shadow-lg p-4 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-slate-800 font-medium">{toast.message}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.toastId);
              }}
              className="text-slate-400 hover:text-slate-700 shrink-0 text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
