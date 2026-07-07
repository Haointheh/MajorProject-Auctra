// src/ui/EmptyState.jsx
// Reused in: SellerListings, CategoryPage, AdminKYC, BidFeed
// Props:
//   title    string
//   subtitle string
//   action   node   optional button

export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="py-20 text-center">
      <p className="text-base font-semibold text-slate-500">{title}</p>
      {subtitle && (
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}