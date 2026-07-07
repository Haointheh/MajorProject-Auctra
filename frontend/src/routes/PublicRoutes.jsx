import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Homepage from "../pages/Homepage";
import CategoryPage from "../pages/CategoryPage";
import AuctionDetailPage from "../pages/AuctionDetailPage";
import ProfilePage from "../pages/ProfilePage";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Homepage />} />
        <Route path="auctions/:category" element={<CategoryPage />} />
        <Route path="auctions/:category/:id" element={<AuctionDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}