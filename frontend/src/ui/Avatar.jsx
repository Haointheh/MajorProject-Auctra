// src/ui/Avatar.jsx
// Reused in: UserMenu (navbar), BidFeed (bid rows), ProfilePage header
// Props:
//   name    string   generates initials automatically
//   size    "xs"|"sm"|"md"|"lg"
//   className  override for extra styling

const SIZES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-sm",
  lg: "w-14 h-14 text-xl",
};

export default function Avatar({ name = "?", size = "md", className = "" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={`${SIZES[size]} bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {initials || "?"}
    </div>
  );
}