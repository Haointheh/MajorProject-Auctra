// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Button from "../ui/Button";
// import AuthModal from "../auth/AuthModal";
// import UserMenu from "./UserMenu";
// import logo from "../assets/auctra_logo-cropped.svg";
// import { useAuthStore } from "../store/useAuthStore";
// import { useSignupStore } from "../store/useSignupStore";

// const CATEGORIES = [
//   { label: "Art", slug: "art" },
//   { label: "Fashion", slug: "fashion" },
//   { label: "Jewellery", slug: "jewellery" },
//   { label: "Antiques", slug: "antiques" },
//   { label: "Handicrafts", slug: "handicrafts" },
// ];

// export default function Navbar() {
//   const { isAuthenticated } = useAuthStore();
//   const { resetForm } = useSignupStore();

//   const navigate = useNavigate();
//   const location = useLocation();

//   const [showAuth, setShowAuth] = useState(false);
//   const [initialMode, setInitialMode] = useState("login");
//   const [menuOpen, setMenuOpen] = useState(false);

//   const openLogin  = () => { setInitialMode("login"); setShowAuth(true); };
//   const openSignup = () => { resetForm(); setInitialMode("signup"); setShowAuth(true); };

//   const activeCategory = location.pathname.startsWith("/auctions/")
//     ? location.pathname.split("/")[2]
//     : null;

//   const goTo = (slug) => {
//     navigate(`/auctions/${slug}`);
//     setMenuOpen(false);
//   };

//   return (
//     <nav className="border-b border-slate-300 bg-white relative">

//       {/* ── TOP BAR ── */}
//       <div className="flex justify-between items-center px-4 lg:px-8 py-2 border-b border-neutral1">

//         <button className="lg:hidden" onClick={() => setMenuOpen((p) => !p)}>
//           <HamburgerIcon />
//         </button>

//         <div className="flex justify-center lg:justify-start">
//           <button onClick={() => navigate("/")}>
//             <img src={logo} alt="Auctra" className="h-16 sm:h-18 lg:h-24 object-contain" />
//           </button>
//         </div>

//         {/* Auth — desktop */}
//         <div className="hidden lg:flex justify-end items-center gap-4">
//           {isAuthenticated ? (
//             <UserMenu />
//           ) : (
//             <>
//               <Button variant="blank" onClick={openLogin}>Log In</Button>
//               <Button variant="secondary" onClick={openSignup}>Join</Button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* ── DESKTOP SUBNAV ── */}
//       <div className="hidden lg:flex items-center justify-between px-8 py-2">
//         <div className="flex gap-1">
//           {CATEGORIES.map((cat) => (
//             <button
//               key={cat.slug}
//               onClick={() => goTo(cat.slug)}
//               className={`px-4 py-2 text-sm transition-colors ${
//                 activeCategory === cat.slug
//                   ? "bg-slate-900 text-white font-semibold"
//                   : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
//               }`}
//             >
//               {cat.label}
//             </button>
//           ))}
//         </div>

//         <button
//           onClick={() => navigate("/auctions/art")}
//           className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
//         >
//           View Current Auctions →
//         </button>
//       </div>

//       {/* ── MOBILE MENU ── */}
//       {menuOpen && (
//         <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4">
//           <div>
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
//               Categories
//             </p>
//             <div className="flex flex-col gap-1">
//               {CATEGORIES.map((cat) => (
//                 <button
//                   key={cat.slug}
//                   onClick={() => goTo(cat.slug)}
//                   className={`text-left px-3 py-2 text-sm ${
//                     activeCategory === cat.slug
//                       ? "bg-slate-900 text-white font-semibold"
//                       : "text-slate-700 hover:bg-slate-100"
//                   }`}
//                 >
//                   {cat.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <hr />

//           <div className="flex gap-3 items-center">
//             {isAuthenticated ? (
//               <UserMenu />
//             ) : (
//               <>
//                 <Button variant="blank" onClick={openLogin}>Log In</Button>
//                 <Button variant="secondary" onClick={openSignup}>Join</Button>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {showAuth && (
//         <AuthModal initialMode={initialMode} onClose={() => setShowAuth(false)} />
//       )}
//     </nav>
//   );
// }

// function HamburgerIcon() {
//   return (
//     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//     </svg>
//   );
// }

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../ui/Button";
import AuthModal from "../auth/AuthModal";
import UserMenu from "./UserMenu";
import logo from "../assets/auctra_logo-cropped.svg";
import { useAuthStore } from "../store/useAuthStore";
import { useSignupStore } from "../store/useSignupStore";

const CATEGORIES = [
  { label: "Art", slug: "art" },
  { label: "Fashion", slug: "fashion" },
  { label: "Jewellery", slug: "jewellery" },
  { label: "Antiques", slug: "antiques" },
  { label: "Handicrafts", slug: "handicrafts" },
];

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

  const goTo = (slug) => {
    navigate(`/auctions/${slug}`);
    setMenuOpen(false);
  };

  return (
    <nav className="border-b border-slate-300 bg-white relative">

      {/* ── TOP BAR ── */}
      <div className="flex justify-between items-center px-4 lg:px-8 py-2 border-b border-neutral1">

        <button className="lg:hidden" onClick={() => setMenuOpen((p) => !p)}>
          <HamburgerIcon />
        </button>

        <div className="flex justify-center lg:justify-start">
          <button onClick={() => navigate("/")}>
            <img src={logo} alt="Auctra" className="h-16 sm:h-18 lg:h-24 object-contain" />
          </button>
        </div>

        {/* Auth — desktop */}
        <div className="hidden lg:flex justify-end items-center gap-4">
          {isAuthenticated ? (
            <UserMenu />
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
        </div>

        <button
          onClick={() => navigate("/auctions/art")}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          View Current Auctions →
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4">
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
            </div>
          </div>

          <hr />

          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <UserMenu align="left" />
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