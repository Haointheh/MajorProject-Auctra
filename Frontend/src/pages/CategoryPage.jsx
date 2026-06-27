import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuctionsByCategory, CATEGORY_META, formatPrice } from "../data/mockAuctions";
import useCountdown from "../hooks/useCountdown";
import Button from "../ui/Button";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "live") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        LIVE
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5">
        UPCOMING
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5">
      ENDED
    </span>
  );
}

// ── Individual auction card ───────────────────────────────────────────────────
function AuctionCard({ auction, onSelect }) {
  const countdown = useCountdown(
    auction.status === "live" ? auction.end_time : auction.start_time
  );

  return (
    <div className="bg-white border border-slate-100 shadow-sm flex flex-col">
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200">
        <img
          src={auction.images[0]?.image_path}
          alt={auction.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay badges */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={auction.status} />
        </div>

        {auction.is_ai_verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-slate-700">
            <span className="w-1.5 h-1.5 bg-emerald-500" />
            AI Verified
          </div>
        )}

        {/* Countdown */}
        <div className="absolute bottom-2 right-2 bg-slate-950/75 text-white text-[10px] font-mono font-semibold px-2 py-0.5">
          {auction.status === "live"
            ? `Ends in ${countdown}`
            : auction.status === "scheduled"
            ? `Starts in ${countdown}`
            : "Auction closed"}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col grow">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
          {auction.title}
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">by {auction.seller.name}</p>

        <hr className="border-slate-100 my-3" />

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {auction.bid_count > 0 ? "Current Bid" : "Starting Bid"}
            </p>
            <p className="text-base font-black text-slate-900 leading-none mt-0.5">
              {formatPrice(auction.current_bid)}
            </p>
            {auction.bid_count > 0 && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                {auction.bid_count} bid{auction.bid_count !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <Button variant="secondary" size="xs" onClick={() => onSelect(auction)}>
            View Auction
          </Button>
        </div>
      </div>
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

  const meta = CATEGORY_META[category?.toLowerCase()];
  const allAuctions = getAuctionsByCategory(category || "");
// replace the above line with the following code to fetch auctions from the backend
//   const [allAuctions, setAllAuctions] = useState([]);
// useEffect(() => {
//   client.get(`/auctions?category=${category}`).then(r => setAllAuctions(r.data));
// }, [category]);


  // Filter
  const auctions = allAuctions.filter((a) => {
    if (filter === "Live") return a.status === "live";
    if (filter === "Upcoming") return a.status === "scheduled";
    return true;
  });

  // Unknown category
  if (!meta) {
    return (
      <main className="min-h-screen bg-neutral1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">Category not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-primary underline"
          >
            Back to home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral1">

      {/* ── Page header ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Category
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{meta.label}</h1>
          <p className="text-slate-500 mt-2 max-w-xl">{meta.description}</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <FilterBar active={filter} onChange={setFilter} />
        <p className="text-sm text-slate-400">
          {auctions.length} {auctions.length === 1 ? "auction" : "auctions"}
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        {auctions.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <p className="text-lg font-semibold">No auctions here yet.</p>
            <p className="text-sm mt-1">Check back soon or browse another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
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