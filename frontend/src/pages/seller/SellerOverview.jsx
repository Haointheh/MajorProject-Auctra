// // src/pages/seller/SellerOverview.jsx
// // Landing page after seller logs in. Mock stats for now —
// // replace with GET /seller/stats when backend endpoint exists.

// import { useNavigate } from "react-router-dom";
// import { useAuthStore } from "../../store/useAuthStore";
// import { MOCK_AUCTIONS } from "../../data/mockAuctions";
// import StatCard from "../../ui/StatCard";
// import PageHeader from "../../ui/PageHeader";
// import Button from "../../ui/Button";
// import StatusBadge from "../../ui/StatusBadge";
// import { formatPrice } from "../../data/mockAuctions";

// // Mock: filter auctions belonging to "this" seller.
// // Replace with: client.get('/seller/auctions') once backend ready.
// const MOCK_SELLER_ID = 1;
// function getMySellerAuctions() {
//   // For demo purposes, just take a slice — real filter will be by seller_id
//   return MOCK_AUCTIONS.slice(0, 4);
// }

// export default function SellerOverview() {
//   const navigate = useNavigate();
//   const { user } = useAuthStore();
//   const myAuctions = getMySellerAuctions();

//   const liveCount      = myAuctions.filter((a) => a.status === "live").length;
//   const scheduledCount = myAuctions.filter((a) => a.status === "scheduled").length;
//   const totalBids      = myAuctions.reduce((sum, a) => sum + (a.bid_count || 0), 0);
//   const highestBid     = myAuctions.reduce((max, a) => Math.max(max, a.current_bid || 0), 0);

//   return (
//     <div>
//       <PageHeader
//         eyebrow="Seller Hub"
//         title={`Welcome back${user?.name ? ", " + user.name.split(" ")[0] : ""}`}
//         subtitle="Here's what's happening with your listings."
//         action={
//           <Button variant="secondary" size="sm" onClick={() => navigate("/seller/dashboard/create")}>
//             + Create Auction
//           </Button>
//         }
//       />

//       <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">

//         {/* Stats grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatCard label="Live Auctions" value={liveCount} accent="green" />
//           <StatCard label="Scheduled" value={scheduledCount} />
//           <StatCard label="Total Bids Received" value={totalBids} />
//           <StatCard label="Highest Current Bid" value={highestBid ? formatPrice(highestBid) : "—"} />
//         </div>

//         {/* Recent listings preview */}
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
//               Recent Listings
//             </h2>
//             <button
//               onClick={() => navigate("/seller/dashboard/auctions")}
//               className="text-xs text-primary font-medium hover:underline"
//             >
//               View all →
//             </button>
//           </div>

//           <div className="bg-white border border-slate-100 divide-y divide-slate-100">
//             {myAuctions.map((a) => (
//               <button
//                 key={a.id}
//                 onClick={() => navigate(`/seller/dashboard/auctions/${a.id}`)}
//                 className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
//               >
//                 <img
//                   src={a.images[0]?.image_path}
//                   alt={a.title}
//                   className="w-12 h-12 object-cover shrink-0 bg-slate-100"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
//                   <p className="text-xs text-slate-400">{formatPrice(a.current_bid)} · {a.bid_count} bids</p>
//                 </div>
//                 <StatusBadge status={a.status} />
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


//backend
// src/pages/seller/SellerOverview.jsx
// Landing page after seller logs in.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { apiListAuctions, getImageUrl } from "../../api/auctions";
import StatCard from "../../ui/StatCard";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import EmptyState from "../../ui/EmptyState";
import { formatPrice } from "../../data/mockAuctions";

export default function SellerOverview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [myAuctions, setMyAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // No GET /seller/auctions endpoint yet — fetch all and filter by seller id
  // (same approach as SellerListings.jsx and CategoryPage.jsx).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiListAuctions()
      .then((res) => {
        if (cancelled) return;
        const mine = (res.data || [])
          .filter((a) => a.seller?.id === user?.id)
          .map((a) => ({
            ...a,
            current_bid: a.current_highest_bid ?? a.base_price,
            bid_count: a.current_highest_bid != null ? 1 : 0,
          }));
        setMyAuctions(mine);
      })
      .catch(() => {
        if (!cancelled) setMyAuctions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const liveCount      = myAuctions.filter((a) => a.status === "live").length;
  const scheduledCount = myAuctions.filter((a) => a.status === "scheduled").length;
  const totalBids      = myAuctions.reduce((sum, a) => sum + (a.bid_count || 0), 0);
  const highestBid     = myAuctions.reduce((max, a) => Math.max(max, a.current_bid || 0), 0);
  const recentAuctions = myAuctions.slice(0, 4);

  return (
    <div>
      <PageHeader
        eyebrow="Seller Hub"
        title={`Welcome back${user?.name ? ", " + user.name.split(" ")[0] : ""}`}
        subtitle="Here's what's happening with your listings."
        action={
          <Button variant="secondary" size="sm" onClick={() => navigate("/seller/dashboard/create")}>
            + Create Auction
          </Button>
        }
      />

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Live Auctions" value={liveCount} accent="green" />
          <StatCard label="Scheduled" value={scheduledCount} />
          <StatCard label="Total Bids Received" value={totalBids} />
          <StatCard label="Highest Current Bid" value={highestBid ? formatPrice(highestBid) : "—"} />
        </div>

        {/* Recent listings preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Recent Listings
            </h2>
            <button
              onClick={() => navigate("/seller/dashboard/auctions")}
              className="text-xs text-primary font-medium hover:underline"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <EmptyState title="Loading your auctions…" />
          ) : recentAuctions.length === 0 ? (
            <EmptyState
              title="No auctions yet."
              subtitle="Create your first listing to get started."
              action={
                <Button variant="secondary" size="sm" onClick={() => navigate("/seller/dashboard/create")}>
                  + Create Auction
                </Button>
              }
            />
          ) : (
            <div className="bg-white border border-slate-100 divide-y divide-slate-100">
              {recentAuctions.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/seller/dashboard/auctions/${a.id}`)}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={getImageUrl(a.images[0]?.image_path)}
                    alt={a.title}
                    className="w-12 h-12 object-cover shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
                    <p className="text-xs text-slate-400">{formatPrice(a.current_bid)} · {a.bid_count} bids</p>
                  </div>
                  <StatusBadge status={a.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
