// src/ui/Breadcrumb.jsx
// Reused in: AuctionDetailPage, SellerAuctionPage, AdminAuctionPage
// Props:
//   items  array of { label, onClick } — last item is current page (no click)

export default function Breadcrumb({ items = [] }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-300">/</span>}
              {isLast || !item.onClick ? (
                <span className={isLast ? "text-slate-600 truncate max-w-48" : ""}>
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="hover:text-slate-700 transition-colors capitalize"
                >
                  {item.label}
                </button>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}