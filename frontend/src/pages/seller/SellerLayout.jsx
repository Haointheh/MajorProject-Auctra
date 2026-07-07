// import React from 'react'

// const SellerLayout = () => {
//   return (
//     <div>SellerLayout</div>
//   )
// }

// export default SellerLayout


// src/pages/seller/SellerLayout.jsx
// Thin wrapper — all layout logic lives in DashboardLayout.
// To add a new seller page: add one entry to SELLER_NAV and add the route
// in SellerRoutes.jsx. Nothing else needs to change.

import DashboardLayout from "../../components/layouts/DashboardLayout";

const SELLER_NAV = [
  { label: "Overview",       path: "/seller/dashboard",          icon: "▦" },
  { label: "My Listings",    path: "/seller/dashboard/auctions", icon: "☰" },
  { label: "Create Auction", path: "/seller/dashboard/create",   icon: "＋" },
];

export default function SellerLayout() {
  return <DashboardLayout navItems={SELLER_NAV} roleLabel="Seller Hub" />;
}