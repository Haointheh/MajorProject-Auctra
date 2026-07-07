// src/components/UserMenu.jsx
// Reused in: Navbar (public), DashboardLayout top bar (seller + admin)
// Reads user and role from useAuthStore.
// ROLE_MENU controls which links each role sees in the dropdown.
// Add new links here as new pages are built — no other file changes needed.

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "../ui/Avatar";

const ROLE_MENU = {
  buyer: [
    { label: "My Profile",  path: "/profile" },
    { label: "My Bids",     path: "/profile/bids" },
  ],
  seller: [
    { label: "My Profile",     path: "/profile" },
    { label: "Seller Hub",     path: "/seller/dashboard" },
    { label: "My Listings",    path: "/seller/dashboard/auctions" },
    { label: "Create Auction", path: "/seller/dashboard/create" },
  ],
  admin: [
    { label: "My Profile",  path: "/profile" },
    { label: "Admin Panel", path: "/admin" },
    { label: "KYC Reviews", path: "/admin/kyc" },
    { label: "All Users",   path: "/admin/users" },
  ],
};

// ── Role helper — works for both boolean flags and single-role string ─────────
function getRole(user) {
  if (!user) return "buyer";
  if (user.is_admin  || user.role === "admin")  return "admin";
  if (user.is_seller || user.role === "seller") return "seller";
  return "buyer";
}

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const role      = getRole(user);
  const menuItems = ROLE_MENU[role] ?? ROLE_MENU.buyer;

  const ROLE_LABEL = { buyer: "Buyer", seller: "Seller", admin: "Administrator" };
  const ROLE_COLOR = {
    buyer:  "text-blue-600 bg-blue-50",
    seller: "text-amber-600 bg-amber-50",
    admin:  "text-rose-600 bg-rose-50",
  };

  return (
    <div className="relative" ref={ref}>

      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 group"
        aria-label="Account menu"
      >
        <Avatar name={user?.name ?? "?"} size="md" className="group-hover:bg-primary transition-colors" />
        <span className="hidden lg:block text-sm font-medium text-slate-700 group-hover:text-slate-900">
          {user?.name?.split(" ")[0]}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 shadow-lg z-50">

          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <span className={`mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${ROLE_COLOR[role]}`}>
              {ROLE_LABEL[role]}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => { logout(); setOpen(false); navigate("/"); }}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}