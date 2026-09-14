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


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import PublicRoutes from "./routes/PublicRoutes";
// import SellerRoutes from "./routes/SellerRoutes";
// import AdminRoutes from "./routes/AdminRoutes";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/*" element={<PublicRoutes />} />
//         <Route path="/seller/*" element={<SellerRoutes />} />
//         <Route path="/admin/*" element={<AdminRoutes />} />
//       </Routes>
//     </BrowserRoute

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import PublicRoutes from "./routes/PublicRoutes";
// import SellerRoutes from "./routes/SellerRoutes";
// import AdminRoutes from "./routes/AdminRoutes";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/*" element={<PublicRoutes />} />
//         <Route path="/seller/*" element={<SellerRoutes />} />
//         <Route path="/admin/*" element={<AdminRoutes />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
import SellerRoutes from "./routes/SellerRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToHash from "./components/ScrollToHash";
import ToastContainer from "./components/ToastContainer";
import useNotificationSocket from "./hooks/useNotificationSocket";

export default function App() {
  // One connection for the whole app, alive across every route — not
  // per-page — so notifications keep arriving no matter where you are.
  useNotificationSocket();

  return (
    <BrowserRouter>
    <ScrollToTop />
    <ScrollToHash />
    <ToastContainer />
      <Routes>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/seller/*" element={<SellerRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}