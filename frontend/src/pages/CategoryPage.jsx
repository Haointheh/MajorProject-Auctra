import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatPrice } from "../data/mockAuctions";
import { CATEGORY_MAP } from "../data/categories";
import { apiListAuctions, getImageUrl } from "../api/auctions";
import useCountdown from "../hooks/useCountdown";
import AuctionCardBody from "../ui/AuctionCardBody";
import StatusBadge from "../ui/StatusBadge";
import PageHeader from "../ui/PageHeader";
import EmptyState from "../ui/EmptyState";

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

  // Sellers can browse category pages like any other viewer now — they just
  // can't bid (see BidSection in AuctionDetailPage.jsx, which prompts them
  // to create a separate bidder account instead).

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meta = CATEGORY_MAP[category?.toLowerCase()];

  useEffect(() => {
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
          }))
          // Live/upcoming auctions float to the top, ended/cancelled sink
          // to the bottom; within each of those groups, newest-created
          // first.
          .sort((a, b) => {
            const priority = { live: 0, scheduled: 0, ended: 1, cancelled: 1 };
            const diff = (priority[a.status] ?? 1) - (priority[b.status] ?? 1);
            if (diff !== 0) return diff;
            return new Date(b.created_at) - new Date(a.created_at);
          });
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
  }, [category]);

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