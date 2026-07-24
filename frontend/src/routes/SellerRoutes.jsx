import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import SellerLayout from "../pages/seller/SellerLayout";
import SellerOverview from "../pages/seller/SellerOverview";
import SellerListings from "../pages/seller/SellerListings";
import CreateAuction from "../pages/seller/Createauction";
import EditAuction from "../pages/seller/EditAuction";
import SellerAuctionPage from "../pages/seller/SellerAuctionPage";
import { useAuthStore } from "../store/useAuthStore";

function SellerGuard() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!user?.is_seller && user?.role !== "seller") return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function SellerRoutes() {
  return (
    <Routes>
      <Route element={<SellerGuard />}>
        <Route element={<SellerLayout />}>
          <Route path="dashboard" element={<SellerOverview />} />
          <Route path="dashboard/auctions" element={<SellerListings />} />
          <Route path="dashboard/create" element={<CreateAuction />} />
          <Route path="dashboard/auctions/:id/edit" element={<EditAuction />} />
          <Route path="dashboard/auctions/:id" element={<SellerAuctionPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}