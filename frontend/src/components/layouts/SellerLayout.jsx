// import DashboardLayout from "../../components/layouts/DashboardLayout";

// const SELLER_NAV = [
//   { label: "Overview",       path: "/seller/dashboard",          icon: "▦" },
//   { label: "My Listings",    path: "/seller/dashboard/auctions", icon: "☰" },
//   { label: "Create Auction", path: "/seller/dashboard/create",   icon: "＋" },
// ];

// export default function SellerLayout() {
//   return (
//     <DashboardLayout
//       navItems={SELLER_NAV}
//       roleLabel="Seller Hub"
//       homePath="/seller/dashboard/auctions"
//       showBackToSite={false}
//     />
//   );
// }

import DashboardLayout from "./DashboardLayout";
import { HiOutlineUser } from "react-icons/hi2";



const SELLER_NAV = [
  { label: "Overview",       path: "/seller/dashboard",          icon: "▦" },
  { label: "My Listings",    path: "/seller/dashboard/auctions", icon: "☰" },
  { label: "Create Auction", path: "/seller/dashboard/create",   icon: "＋" },
  // { label: "My Profile",     path: "/seller/dashboard/profile",  icon: "◉" },
  { label: "My Profile", path: "/seller/dashboard/profile", icon: <HiOutlineUser /> },
];

export default function SellerLayout() {
  return <DashboardLayout navItems={SELLER_NAV} roleLabel="Seller Hub" showBackToSite={false} />;
}
