// src/ui/PageHeader.jsx
// Reused in: CategoryPage, SellerOverview, SellerListings, AdminOverview, AdminKYC
// Keeps all page headers visually consistent.
// Props:
//   eyebrow   string   small label above title (e.g. "Category")
//   title     string
//   subtitle  string   optional description line
//   action    node     optional right-side button/element

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          {eyebrow && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 mt-1 max-w-xl text-sm">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}