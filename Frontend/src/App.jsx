// import React from 'react'
// import Navbar from './components/Navbar'
// import Homepage from './pages/Homepage'
// import Footer from './components/Footer'

// const App = () => {
//   return (
//     <div>
//       <Navbar />
//       <Homepage />
//       <Footer />
//     </div>
//   )
// }

// export default App

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Homepage from "./pages/Homepage";
import CategoryPage from "./pages/CategoryPage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
// import { useAuthStore } from "./store/useAuthStore";

// ── Protected route wrapper (uncomment useAuthStore when stores are ready) ──
function ProtectedRoute({ children, allowedRoles }) {
  // const { isAuthenticated, user } = useAuthStore();
  // if (!isAuthenticated) return <Navigate to="/" />;
  // if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Homepage />} />

        {/* ── Category browsing (guest + logged-in) ── */}
        <Route path="/auctions/:category" element={<CategoryPage />} />

        {/* ── Individual auction item ── */}
        <Route path="/auctions/:category/:id" element={<AuctionDetailPage />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}