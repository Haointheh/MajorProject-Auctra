// import { Routes, Route, Navigate, Outlet } from "react-router-dom";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import Homepage from "../pages/Homepage";
// import CategoryPage from "../pages/CategoryPage";
// import AuctionDetailPage from "../pages/AuctionDetailPage";
// import ProfilePage from "../pages/ProfilePage";
// import BidHistoryPage from "../pages/BidHistoryPage";
// import BrowseCategoriesPage from "../pages/BrowseCategoriesPage";

// function PublicLayout() {
//   return (
//     <>
//       <Navbar />
//       <Outlet />
//       <Footer />
//     </>
//   );
// }

// export default function PublicRoutes() {
//   return (
//     <Routes>
//       <Route element={<PublicLayout />}>
//         <Route index element={<Homepage />} />
//         <Route path="auctions/:category" element={<CategoryPage />} />
//         <Route path="auctions/:category/:id" element={<AuctionDetailPage />} />
//         <Route path="browse" element={<BrowseCategoriesPage />} />
//         <Route path="profile" element={<ProfilePage />} />
//         <Route path="profile/bids" element={<BidHistoryPage />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Route>
//     </Routes>
//   );
// }

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Homepage from "../pages/Homepage";
import CategoryPage from "../pages/CategoryPage";
import AuctionDetailPage from "../pages/AuctionDetailPage";
import LiveAuctionsPage from "../pages/LiveAuctionsPage";
import TermsAndConditionsPage from "../pages/TermsAndConditionsPage";
import ProfilePage from "../pages/ProfilePage";
import BidHistoryPage from "../pages/BidHistoryPage";
import BrowseCategoriesPage from "../pages/BrowseCategoriesPage";
import UpcomingAuctionsPage from "../pages/UpcomingAuctionsPage";
import { useAuthStore } from "../store/useAuthStore";
import getRole from "../utils/getRole";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

// Sellers are confined to the seller dashboard entirely — no homepage, no
// browsing, no category pages, no auction detail pages, nothing on the
// public buyer-facing site. Every route under PublicLayout is behind this
// guard, so any path a seller hits here bounces straight back to their own
// listings. Guest/buyer/admin all pass through untouched.
function BuyerBrowsingGuard() {
  const { user, isAuthenticated } = useAuthStore();
  const role = isAuthenticated ? getRole(user) : "guest";

  if (role === "seller") {
    return <Navigate to="/seller/dashboard/auctions" replace />;
  }

  return <Outlet />;
}

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<BuyerBrowsingGuard />}>
          <Route index element={<Homepage />} />
          <Route path="auctions/:category" element={<CategoryPage />} />
          <Route path="auctions/:category/:id" element={<AuctionDetailPage />} />
          <Route path="browse" element={<BrowseCategoriesPage />} />
          <Route path="live-auctions" element={<LiveAuctionsPage />} />
          <Route path="upcoming-auctions" element={<UpcomingAuctionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/bids" element={<BidHistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Not gated by BuyerBrowsingGuard — legal terms should stay
            readable by every role, sellers included. */}
        <Route path="terms" element={<TermsAndConditionsPage />} />
      </Route>
    </Routes>
  );
}

