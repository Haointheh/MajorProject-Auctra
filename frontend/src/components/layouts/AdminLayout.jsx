// import React from 'react'

// const AdminLayout = () => {
//   return (
//     <div>AdminLayout</div>
//   )
// }

// export default AdminLayout

import DashboardLayout from "./DashboardLayout";
import { HiOutlineUser } from "react-icons/hi2";



const ADMIN_NAV = [
  { label: "Overview",    path: "/admin",         icon: "▦" },
  { label: "KYC Reviews", path: "/admin/kyc",     icon: "✓" },
  { label: "All Users",   path: "/admin/users",   icon: "⊙" },
  // { label: "My Profile",  path: "/admin/profile", icon: "◉" },
  { label: "My Profile", path: "/admin/profile", icon: <HiOutlineUser /> },
];

export default function AdminLayout() {
  return <DashboardLayout navItems={ADMIN_NAV} roleLabel="Admin Panel" />;
}