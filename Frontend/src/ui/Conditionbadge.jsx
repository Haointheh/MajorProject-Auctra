// src/ui/ConditionBadge.jsx
// Reused in: AuctionDetailPage, LiveAuctionView, SellerListings, SellerAuctionPage
// Props:
//   condition  "excellent" | "good" | "fair" | "poor"

const STYLES = {
  excellent: "text-emerald-600 bg-emerald-50",
  good:      "text-blue-600 bg-blue-50",
  fair:      "text-amber-600 bg-amber-50",
  poor:      "text-rose-600 bg-rose-50",
};

export default function ConditionBadge({ condition }) {
  const style = STYLES[condition] ?? "text-slate-500 bg-slate-100";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 capitalize ${style}`}>
      {condition}
    </span>
  );
}