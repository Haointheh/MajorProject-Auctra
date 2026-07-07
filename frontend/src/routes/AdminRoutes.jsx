// import { Routes, Route, Navigate, Outlet } from "react-router-dom";
// import AdminLayout from "../pages/admin/AdminLayout";
// import AdminOverview from "../pages/admin/AdminOverview";
// import AdminKYC from "../pages/admin/AdminKYC";
// import AdminAuctionPage from "../pages/admin/AdminAuctionPage";
// // import { useAuthStore } from "../store/useAuthStore";

// function AdminGuard() {
//   // Uncomment when auth store is ready:
//   // const { isAuthenticated, user } = useAuthStore();
//   // if (!isAuthenticated) return <Navigate to="/" replace />;
//   // if (!user?.is_admin && user?.role !== "admin") return <Navigate to="/" replace />;
//   return <Outlet />;
// }

// export default function AdminRoutes() {
//   return (
//     <Routes>
//       <Route element={<AdminGuard />}>
//         <Route element={<AdminLayout />}>
//           <Route path="/" element={<AdminOverview />} />
//           <Route path="kyc" element={<AdminKYC />} />
//           <Route path="*" element={<Navigate to="/admin" replace />} />
//         </Route>
//       </Route>
//     </Routes>
//   );
// }

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminKYC from "../pages/admin/AdminKYC";
import AdminAuctionPage from "../pages/admin/AdminAuctionPage";
import { useAuthStore } from "../store/useAuthStore";

function AdminGuard() {
  // Uncomment when real login sets isAuthenticated + user.role/is_admin:
  // const { isAuthenticated, user } = useAuthStore();
  // if (!isAuthenticated) return <Navigate to="/" replace />;
  // if (!user?.is_admin && user?.role !== "admin") return <Navigate to="/" replace />;
  
  // const {user } =useAuthStore();
  // if (!user) {
  //     return <Navigate to="/login" replace />;
  // }

  // if (user.role !== "admin") {
  //     return <Navigate to="/" replace />;
  // }

  // return <Outlet />;
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!user?.is_admin && user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          {/* <Route index element={<AdminOverview />} /> */}
          <Route path="/" element={<AdminOverview />} />
          <Route path="kyc" element={<AdminKYC />} />
          <Route path="auctions/:id" element={<AdminAuctionPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}