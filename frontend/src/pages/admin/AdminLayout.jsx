// import React from 'react'

// const AdminLayout = () => {
//   return (
//     <div>AdminLayout</div>
//   )
// }

// export default AdminLayout

// src/pages/admin/AdminLayout.jsx
// Thin wrapper — same DashboardLayout shell as SellerLayout, different nav.

import DashboardLayout from "../../components/layouts/DashboardLayout";

const ADMIN_NAV = [
  { label: "Overview",    path: "/admin",       icon: "▦" },
  { label: "KYC Reviews", path: "/admin/kyc",   icon: "✓" },
  { label: "All Users",   path: "/admin/users", icon: "⊙" },
];

export default function AdminLayout() {
  return <DashboardLayout navItems={ADMIN_NAV} roleLabel="Admin Panel" />;
}