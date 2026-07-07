// src/ui/StatCard.jsx
// Reused in: SellerOverview, AdminOverview, ProfilePage seller section
// Props:
//   label    string
//   value    string | number
//   sub      string   optional smaller line below value
//   accent   "default"|"green"|"red"|"amber"

const ACCENT = {
  default: "text-slate-900",
  green:   "text-emerald-600",
  red:     "text-rose-600",
  amber:   "text-amber-600",
};

export default function StatCard({ label, value, sub, accent = "default" }) {
  return (
    <div className="bg-white border border-slate-100 p-5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className={`text-3xl font-black leading-none ${ACCENT[accent]}`}>
        {value ?? "—"}
      </p>
      {sub && (
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      )}
    </div>
  );
}