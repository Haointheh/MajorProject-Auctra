// All "scheduled" (not yet live) auctions across every category, sorted by
// start time (soonest-starting first), with a category filter — same shape
// as LiveAuctionsPage.jsx, built on the same shared data/categories.js and
// ui/FilterPills.jsx rather than duplicating category data or filter UI.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiListAuctions, getImageUrl } from "../api/auctions";
import { CATEGORIES, CATEGORY_MAP } from "../data/categories";
import useCountdown from "../hooks/useCountdown";
import AuctionCardBody from "../ui/AuctionCardBody";
import StatusBadge from "../ui/StatusBadge";
import FilterPills from "../ui/FilterPills";
import PageHeader from "../ui/PageHeader";
import EmptyState from "../ui/EmptyState";

const CATEGORY_FILTERS = [
  { value: "all", label: "All Categories" },
  ...CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
];

// ── Auction card ──────────────────────────────────────────────────────────────
function AuctionCard({ auction, onSelect }) {
  const countdown = useCountdown(auction.start_time);

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

        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-slate-700 capitalize">
          {CATEGORY_MAP[auction.category]?.label ?? auction.category}
        </div>

        <div className="absolute bottom-2 right-2 bg-slate-950/75 text-white text-[10px] font-mono font-semibold px-2 py-0.5">
          Starts in {countdown}
        </div>
      </div>

      <AuctionCardBody auction={auction} onSelect={onSelect} />
    </div>
  );
}

export default function UpcomingAuctionsPage() {
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiListAuctions()
      .then((res) => {
        if (cancelled) return;
        const upcoming = (res.data || [])
          .filter((a) => a.status === "scheduled")
          .map((a) => ({
            ...a,
            current_bid: a.current_highest_bid ?? a.base_price,
            has_bids: a.current_highest_bid != null,
          }))
          // Soonest-starting first.
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        setAuctions(upcoming);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load upcoming auctions right now. Please try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAuctions = useMemo(
    () =>
      categoryFilter === "all"
        ? auctions
        : auctions.filter((a) => a.category === categoryFilter),
    [auctions, categoryFilter]
  );

  return (
    <main className="min-h-screen bg-neutral1">

      <PageHeader
        eyebrow="Auctra"
        title="Upcoming Auctions"
        subtitle="Scheduled auctions across all categories, starting soonest first."
      />

      {/* Toolbar */}
      {/* <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <FilterPills options={CATEGORY_FILTERS} active={categoryFilter} onChange={setCategoryFilter} />
        {!loading && !error && (
          <p className="text-sm text-slate-400">
            {filteredAuctions.length} upcoming {filteredAuctions.length === 1 ? "auction" : "auctions"}
          </p>
        )}
      </div> */}

      <div className="mx-auto max-w-6xl px-6 pb-16">
        {loading ? (
          <EmptyState title="Loading upcoming auctions…" />
        ) : error ? (
          <EmptyState title={error} />
        ) : filteredAuctions.length === 0 ? (
          <EmptyState
            title="No upcoming auctions currently."
            subtitle="Check back again soon~."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onSelect={(a) => navigate(`/auctions/${a.category}/${a.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
