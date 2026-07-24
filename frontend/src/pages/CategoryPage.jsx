// // src/pages/CategoryPage.jsx
// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getAuctionsByCategory, CATEGORY_META } from "../data/mockAuctions";
// import useCountdown from "../hooks/useCountdown";
// import AuctionCardBody from "../ui/AuctionCardBody";
// import StatusBadge from "../ui/StatusBadge";       // ← replaces inline StatusBadge
// import PageHeader from "../ui/PageHeader";          // ← replaces inline header block
// import EmptyState from "../ui/EmptyState";          // ← replaces inline empty block

// // ── Auction card ──────────────────────────────────────────────────────────────
// function AuctionCard({ auction, onSelect }) {
//   const countdown = useCountdown(
//     auction.status === "live" ? auction.end_time : auction.start_time
//   );

//   return (
//     <div className="bg-white border border-slate-100 shadow-sm flex flex-col">
//       <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200">
//         <img
//           src={auction.images[0]?.image_path}
//           alt={auction.title}
//           className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
//         />

//         <div className="absolute top-2 left-2">
//           <StatusBadge status={auction.status} />
//         </div>

//         {auction.is_ai_verified && (
//           <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-slate-700">
//             <span className="w-1.5 h-1.5 bg-emerald-500" />
//             AI Verified
//           </div>
//         )}

//         <div className="absolute bottom-2 right-2 bg-slate-950/75 text-white text-[10px] font-mono font-semibold px-2 py-0.5">
//           {auction.status === "live"
//             ? `Ends in ${countdown}`
//             : auction.status === "scheduled"
//             ? `Starts in ${countdown}`
//             : "Auction closed"}
//         </div>
//       </div>

//       <AuctionCardBody auction={auction} onSelect={onSelect} />
//     </div>
//   );
// }

// // ── Filter bar ────────────────────────────────────────────────────────────────
// const FILTERS = ["All", "Live", "Upcoming"];

// function FilterBar({ active, onChange }) {
//   return (
//     <div className="flex gap-2">
//       {FILTERS.map((f) => (
//         <button
//           key={f}
//           onClick={() => onChange(f)}
//           className={`px-4 py-1.5 text-sm font-semibold border transition-colors ${
//             active === f
//               ? "bg-slate-900 text-white border-slate-900"
//               : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
//           }`}
//         >
//           {f}
//         </button>
//       ))}
//     </div>
//   );
// }

// // ── CategoryPage ──────────────────────────────────────────────────────────────
// export default function CategoryPage() {
//   const { category } = useParams();
//   const navigate = useNavigate();
//   const [filter, setFilter] = useState("All");

//   const meta = CATEGORY_META[category?.toLowerCase()];
//   const allAuctions = getAuctionsByCategory(category || "");
//   // Replace with real API when backend ready:
//   // const [allAuctions, setAllAuctions] = useState([]);
//   // useEffect(() => { client.get(`/auctions?category=${category}`).then(r => setAllAuctions(r.data)); }, [category]);

//   const auctions = allAuctions.filter((a) => {
//     if (filter === "Live") return a.status === "live";
//     if (filter === "Upcoming") return a.status === "scheduled";
//     return true;
//   });

//   if (!meta) {
//     return (
//       <main className="min-h-screen bg-neutral1 flex items-center justify-center">
//         <EmptyState
//           title="Category not found"
//           subtitle="This category doesn't exist."
//           action={
//             <button onClick={() => navigate("/")} className="text-sm text-primary underline">
//               Back to home
//             </button>
//           }
//         />
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-neutral1">

//       {/* PageHeader replaces the old inline header block */}
//       <PageHeader
//         eyebrow="Category"
//         title={meta.label}
//         subtitle={meta.description}
//       />

//       {/* Toolbar */}
//       <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
//         <FilterBar active={filter} onChange={setFilter} />
//         <p className="text-sm text-slate-400">
//           {auctions.length} {auctions.length === 1 ? "auction" : "auctions"}
//         </p>
//       </div>

//       {/* Grid */}
//       <div className="mx-auto max-w-6xl px-6 pb-16">
//         {auctions.length === 0 ? (
//           // EmptyState replaces the old inline empty block
//           <EmptyState
//             title="No auctions here yet."
//             subtitle="Check back soon or browse another category."
//           />
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {auctions.map((auction) => (
//               <AuctionCard
//                 key={auction.id}
//                 auction={auction}
//                 onSelect={(a) => navigate(`/auctions/${category}/${a.id}`)}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }



import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { CATEGORY_META, formatPrice } from "../data/mockAuctions";
import { apiListAuctions, getImageUrl } from "../api/auctions";
import { useAuthStore } from "../store/useAuthStore";
import getRole from "../utils/getRole";
import useCountdown from "../hooks/useCountdown";
import AuctionCardBody from "../ui/AuctionCardBody";
import StatusBadge from "../ui/StatusBadge";
import PageHeader from "../ui/PageHeader";
import EmptyState from "../ui/EmptyState";

// ── Auction card ──────────────────────────────────────────────────────────────
function AuctionCard({ auction, onSelect }) {
  const countdown = useCountdown(
    auction.status === "live" ? auction.end_time : auction.start_time
  );

  return (
    <div className="bg-white border border-slate-100 shadow-sm flex flex-col">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200">
        <img
          src={getImageUrl(auction.images[0]?.image_path)}
          alt={auction.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-2 left-2">
          <StatusBadge status={auction.status} />
        </div>

        {auction.is_ai_verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-slate-700">
            <span className="w-1.5 h-1.5 bg-emerald-500" />
            AI Verified
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-slate-950/75 text-white text-[10px] font-mono font-semibold px-2 py-0.5">
          {auction.status === "live"
            ? `Ends in ${countdown}`
            : auction.status === "scheduled"
            ? `Starts in ${countdown}`
            : "Auction closed"}
        </div>
      </div>

      <AuctionCardBody auction={auction} onSelect={onSelect} />
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
const FILTERS = ["All", "Live", "Upcoming"];

function FilterBar({ active, onChange }) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-1.5 text-sm font-semibold border transition-colors ${
            active === f
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// ── CategoryPage ──────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const { user, isAuthenticated } = useAuthStore();
  // Sellers don't browse public category pages — they manage their own
  // listings from the seller dashboard instead. Guest/buyer/admin all see
  // this page normally.
  const role = isAuthenticated ? getRole(user) : "guest";

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meta = CATEGORY_META[category?.toLowerCase()];

  useEffect(() => {
    if (role === "seller") return; // no point fetching, we redirect below
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiListAuctions()
      .then((res) => {
        if (cancelled) return;
        const inCategory = (res.data || [])
          .filter((a) => a.category === category?.toLowerCase())
          .map((a) => ({
            ...a,
            // Normalize real-API fields to what the card components expect.
            current_bid: a.current_highest_bid ?? a.base_price,
            has_bids: a.current_highest_bid != null,
          }));
        setAuctions(inCategory);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load auctions right now. Please try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, role]);

  if (role === "seller") {
    return <Navigate to="/seller/dashboard/auctions" replace />;
  }

  if (!meta) {
    return (
      <main className="min-h-screen bg-neutral1 flex items-center justify-center">
        <EmptyState
          title="Category not found"
          subtitle="This category doesn't exist."
          action={
            <button onClick={() => navigate("/")} className="text-sm text-primary underline">
              Back to home
            </button>
          }
        />
      </main>
    );
  }

  const filteredAuctions = auctions.filter((a) => {
    if (filter === "Live") return a.status === "live";
    if (filter === "Upcoming") return a.status === "scheduled";
    return true;
  });

  return (
    <main className="min-h-screen bg-neutral1">

      <PageHeader
        eyebrow="Category"
        title={meta.label}
        subtitle={meta.description}
      />

      {/* Toolbar */}
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <FilterBar active={filter} onChange={setFilter} />
        {!loading && !error && (
          <p className="text-sm text-slate-400">
            {filteredAuctions.length} {filteredAuctions.length === 1 ? "auction" : "auctions"}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        {loading ? (
          <EmptyState title="Loading auctions…" />
        ) : error ? (
          <EmptyState title={error} />
        ) : filteredAuctions.length === 0 ? (
          <EmptyState
            title="No auctions here yet."
            subtitle="Check back soon or browse another category."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onSelect={(a) => navigate(`/auctions/${category}/${a.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
