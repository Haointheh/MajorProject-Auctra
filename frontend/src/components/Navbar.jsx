import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../ui/Button";
import AuthModal from "../auth/AuthModal";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import logo from "../assets/auctra_logo-cropped.svg";
import { useAuthStore } from "../store/useAuthStore";
import { useSignupStore } from "../store/useSignupStore";
import { LuCalendarSearch } from "react-icons/lu";
import { RiAuctionLine } from "react-icons/ri";
import { CATEGORIES } from "../data/categories";
// const CATEGORIES = [
//   { label: "Art", slug: "art" },
//   { label: "Fashion", slug: "fashion" },
//   { label: "Jewellery", slug: "jewellery" },
//   { label: "Antiques", slug: "antiques" },
//   { label: "Handicrafts", slug: "handicrafts" },
// ];

export default function Navbar() {
  const { isAuthenticated } = useAuthStore();
  const { resetForm } = useSignupStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [showAuth, setShowAuth] = useState(false);
  const [initialMode, setInitialMode] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);

  const openLogin  = () => { setInitialMode("login"); setShowAuth(true); };
  const openSignup = () => { resetForm(); setInitialMode("signup"); setShowAuth(true); };

  const activeCategory = location.pathname.startsWith("/auctions/")
    ? location.pathname.split("/")[2]
    : null;
  const isBrowseAll = location.pathname === "/browse";

  const goTo = (slug) => {
    navigate(`/auctions/${slug}`);
    setMenuOpen(false);
  };

  return (
    <nav className="border-b border-slate-300 bg-white relative">

      {/* ── TOP BAR ── */}
      <div className="flex justify-between items-center gap-4 px-4 lg:px-8 py-2 border-b border-neutral1">

        <button className="lg:hidden" onClick={() => setMenuOpen((p) => !p)}>
          <HamburgerIcon />
        </button>

        <div className="flex justify-center lg:justify-start shrink-0">
          <button onClick={() => navigate("/")}>
            <img src={logo} alt="Auctra" className="h-16 sm:h-18 lg:h-24 object-contain" />
          </button>
        </div>

        {/* Search — desktop, live dropdown-of-matches-as-you-type */}
        <div className="hidden lg:flex flex-1 justify-center px-4">
          <SearchBar className="max-w-2xl" />
        </div>

        {/* Auth — desktop */}
        <div className="hidden lg:flex justify-end items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="blank" onClick={openLogin}>Log In</Button>
              <Button variant="secondary" onClick={openSignup}>Join</Button>
            </>
          )}
        </div>
      </div>

      {/* ── DESKTOP SUBNAV ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-2">
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => goTo(cat.slug)}
              className={`px-4 py-2 text-sm transition-colors ${
                activeCategory === cat.slug
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={() => navigate("/browse")}
            className={`px-4 py-2 text-sm transition-colors ${
              isBrowseAll
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Browse All
          </button>
        </div>

        <div className="flex items-center justify-center gap-1">
           {/* <button
            onClick={() => navigate("/upcoming-auctions")}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <LuCalendarSearch />Upcoming Auctions 
          </button>
          <button
            onClick={() => navigate("/live-auctions")}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <RiAuctionLine />View Current Auctions 
          </button> */}
          <button
            onClick={() => navigate("/upcoming-auctions")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
          >
            <LuCalendarSearch size={18} />
            Upcoming Auctions
          </button>

          <button
            onClick={() => navigate("/live-auctions")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
          >
            <RiAuctionLine size={18} />
            View Current Auctions
          </button>
         
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4">
          <SearchBar onNavigate={() => setMenuOpen(false)} className="max-w-none" />

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Categories
            </p>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => goTo(cat.slug)}
                  className={`text-left px-3 py-2 text-sm ${
                    activeCategory === cat.slug
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                onClick={() => { navigate("/browse"); setMenuOpen(false); }}
                className={`text-left px-3 py-2 text-sm ${
                  isBrowseAll
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Browse All
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {/* <button
              onClick={() => { navigate("/live-auctions"); setMenuOpen(false); }}
              className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <RiAuctionLine />View Current Auctions 
            </button>
            <button
              onClick={() => { navigate("/upcoming-auctions"); setMenuOpen(false); }}
              className="text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <LuCalendarSearch />Upcoming Auctions 
            </button> */}
            <button
              onClick={() => navigate("/upcoming-auctions")}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
            >
              <LuCalendarSearch size={18} />
              Upcoming Auctions
            </button>

            <button
              onClick={() => navigate("/live-auctions")}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
            >
              <RiAuctionLine size={18} />
              View Current Auctions
            </button>
          </div>

          <hr />

          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <UserMenu align="left" />
                <NotificationBell align="left" />
              </>
            ) : (
              <>
                <Button variant="blank" onClick={openLogin}>Log In</Button>
                <Button variant="secondary" onClick={openSignup}>Join</Button>
              </>
            )}
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal initialMode={initialMode} onClose={() => setShowAuth(false)} />
      )}
    </nav>
  );
}

function HamburgerIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}