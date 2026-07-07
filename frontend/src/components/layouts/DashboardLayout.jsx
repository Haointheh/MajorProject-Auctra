// src/components/layouts/DashboardLayout.jsx
// Shared layout shell for seller and admin dashboards.
// Seller and Admin layouts pass their own navItems — no layout code needed there.
// Reused by: SellerLayout, AdminLayout

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/auctra_logo-cropped.svg";
import UserMenu from "../UserMenu";

export default function DashboardLayout({ navItems = [], roleLabel = "" }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <div className="min-h-screen bg-neutral1 flex flex-col">

      {/* ── Top bar ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <button onClick={() => navigate("/")} className="shrink-0">
          <img src={logo} alt="Auctra" className="h-10 object-contain" />
        </button>
        <div className="flex items-center gap-4">
          {roleLabel && (
            <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1">
              {roleLabel}
            </span>
          )}
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-56 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col">
          <nav className="flex-1 py-6 px-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path) &&
                  // prevent /seller/dashboard matching /seller/dashboard/auctions
                  (location.pathname === item.path || location.pathname[item.path.length] === "/"));

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Back to site */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => navigate("/")}
              className="w-full text-left text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              ← Back to Auctra
            </button>
          </div>
        </aside>

        {/* ── Content area ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}