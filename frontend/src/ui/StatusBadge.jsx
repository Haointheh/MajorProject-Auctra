// src/ui/StatusBadge.jsx
// Reused in: AuctionCard (CategoryPage), AuctionDetailPage, SellerListings, AdminOverview
// Props:
//   status  "live" | "scheduled" | "ended"
//   size    "sm" (default) | "md"

export default function StatusBadge({ status, size = "sm" }) {
  const base = size === "md"
    ? "text-xs font-bold px-3 py-1"
    : "text-[10px] font-bold px-2 py-0.5";

  if (status === "live") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${base} text-emerald-700 bg-emerald-50`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        LIVE
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className={`${base} text-slate-500 bg-slate-100`}>
        UPCOMING
      </span>
    );
  }
  return (
    <span className={`${base} text-rose-500 bg-rose-50`}>
      ENDED
    </span>
  );
}