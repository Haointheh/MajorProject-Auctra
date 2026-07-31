// // src/components/layouts/DashboardLayout.jsx
// // Shared layout shell for seller and admin dashboards.
// // Seller and Admin layouts pass their own navItems — no layout code needed there.
// // Reused by: SellerLayout, AdminLayout

// import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import logo from "../../assets/auctra_logo-cropped.svg";
// import UserMenu from "../UserMenu";

// export default function DashboardLayout({ navItems = [], roleLabel = "" }) {
//   const navigate  = useNavigate();
//   const location  = useLocation();

//   return (
//     <div className="min-h-screen bg-neutral1 flex flex-col">

//       {/* ── Top bar ── */}
//       <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
//         <button onClick={() => navigate("/")} className="shrink-0">
//           <img src={logo} alt="Auctra" className="h-10 object-contain" />
//         </button>
//         <div className="flex items-center gap-4">
//           {roleLabel && (
//             <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1">
//               {roleLabel}
//             </span>
//           )}
//           <UserMenu />
//         </div>
//       </header>

//       <div className="flex flex-1 overflow-hidden">

//         {/* ── Sidebar ── */}
//         <aside className="w-56 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col">
//           <nav className="flex-1 py-6 px-3 space-y-0.5">
//             {navItems.map((item) => {
//               const isActive =
//                 location.pathname === item.path ||
//                 (item.path !== "/" && location.pathname.startsWith(item.path) &&
//                   // prevent /seller/dashboard matching /seller/dashboard/auctions
//                   (location.pathname === item.path || location.pathname[item.path.length] === "/"));

//               return (
//                 <button
//                   key={item.path}
//                   onClick={() => navigate(item.path)}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left ${
//                     isActive
//                       ? "bg-slate-900 text-white"
//                       : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                   }`}
//                 >
//                   <span className="text-base shrink-0">{item.icon}</span>
//                   {item.label}
//                 </button>
//               );
//             })}
//           </nav>

//           {/* Back to site */}
//           <div className="p-4 border-t border-slate-100">
//             <button
//               onClick={() => navigate("/")}
//               className="w-full text-left text-xs text-slate-400 hover:text-slate-700 transition-colors"
//             >
//               ← Back to Auctra
//             </button>
//           </div>
//         </aside>

//         {/* ── Content area ── */}
//         <main className="flex-1 overflow-y-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// src/components/layouts/DashboardLayout.jsx
// Shared layout shell for seller and admin dashboards.
// Seller and Admin layouts pass their own navItems — no layout code needed there.
// Reused by: SellerLayout, AdminLayout

import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/auctra_logo-cropped.svg";
import UserMenu from "../UserMenu";

// Picks the single most specific (longest-path) match instead of letting
// every ancestor route light up too — e.g. "Overview" at /seller/dashboard
// is a *prefix* of /seller/dashboard/create, so naive prefix-matching would
// mark both active at once.
function getActivePath(pathname, navItems) {
  const bestMatch = navItems
    .filter(
      (item) =>
        pathname === item.path ||
        pathname.startsWith(item.path.endsWith("/") ? item.path : `${item.path}/`)
    )
    .sort((a, b) => b.path.length - a.path.length)[0];

  return bestMatch?.path;
}

// Shared nav-button list — used for both the desktop sidebar and the
// mobile slide-out drawer so active-state logic only lives in one place.
function NavList({ navItems, activePath, onNavigate }) {
  return (
    <nav className="flex-1 py-6 px-3 space-y-0.5">
      {navItems.map((item) => {
        const isActive = item.path === activePath;

        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
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
  );
}

export default function DashboardLayout({ navItems = [], roleLabel = "", showBackToSite = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activePath = getActivePath(location.pathname, navItems);

  // Close the drawer whenever the route changes (e.g. back/forward nav,
  // or a link clicked from inside the page content) so it never lingers
  // open over the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open so the page behind it
  // doesn't scroll along with it.
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const goTo = (path) => {
    setMobileNavOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-neutral1 flex flex-col">

      {/* ── Top bar ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          {/* Hamburger — mobile only, opens the slide-out nav drawer */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden -ml-2 p-2 text-slate-600 hover:text-slate-900"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
          >
            <HamburgerIcon />
          </button>
          <button onClick={() => navigate("/")} className="shrink-0">
            <img src={logo} alt="Auctra" className="h-10 object-contain" />
          </button>
        </div>
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

        {/* ── Sidebar (desktop) ── */}
        <aside className="w-56 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col">
          <NavList navItems={navItems} activePath={activePath} onNavigate={goTo} />

          {/* Back to site — admin only; sellers stay confined to the seller hub */}
          {showBackToSite && (
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => navigate("/")}
                className="w-full text-left text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                ← Back to Auctra
              </button>
            </div>
          )}
        </aside>

        {/* ── Mobile nav drawer ── */}
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <div className="relative w-64 max-w-[80vw] h-full bg-white border-r border-slate-200 flex flex-col shadow-xl">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
                {roleLabel && (
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1">
                    {roleLabel}
                  </span>
                )}
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 text-slate-600 hover:text-slate-900"
                  aria-label="Close menu"
                >
                  <CloseIcon />
                </button>
              </div>

              <NavList navItems={navItems} activePath={activePath} onNavigate={goTo} />

              {showBackToSite && (
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => goTo("/")}
                    className="w-full text-left text-xs text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    ← Back to Auctra
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Content area ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}