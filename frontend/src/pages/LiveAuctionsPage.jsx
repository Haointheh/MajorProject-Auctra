// src/pages/LiveAuctionsPage.jsx
// "View Current Auctions" destination (Navbar) — every live auction across
// every category in one place, not scoped to a single category like
// CategoryPage.jsx. Sorted soonest-ending-first so the auctions closest to
// closing (the ones most worth a buyer's attention right now) show up top.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../data/mockAuctions";
import { apiListAuctions, getImageUrl } from "../api/auctions";
import { CATEGORY_MAP } from "../data/categories";
import useCountdown from "../hooks/useCountdown";
import AuctionCardBody from "../ui/AuctionCardBody";
import StatusBadge from "../ui/StatusBadge";
import PageHeader from "../ui/PageHeader";
import EmptyState from "../ui/EmptyState";

// ── Auction card ──────────────────────────────────────────────────────────────
// Same visual shape as CategoryPage's card, plus a category chip since this
// page spans every category at once.
function AuctionCard({ auction, onSelect }) {
  const countdown = useCountdown(auction.end_time);

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

        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-slate-700 capitalize">
          {CATEGORY_MAP[auction.category]?.label ?? auction.category}
        </div>

        <div className="absolute bottom-2 right-2 bg-slate-950/75 text-white text-[10px] font-mono font-semibold px-2 py-0.5">
          Ends in {countdown}
        </div>
      </div>

      <AuctionCardBody auction={auction} onSelect={onSelect} />
    </div>
  );
}

export default function LiveAuctionsPage() {
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiListAuctions()
      .then((res) => {
        if (cancelled) return;
        const live = (res.data || [])
          .filter((a) => a.status === "live")
          .map((a) => ({
            ...a,
            current_bid: a.current_highest_bid ?? a.base_price,
            has_bids: a.current_highest_bid != null,
          }))
          // Soonest-ending first — the auctions closest to closing surface first.
          .sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
        setAuctions(live);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load live auctions right now. Please try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral1">

      <PageHeader
        eyebrow="Auctra"
        title="Current Auctions"
        subtitle="Every live auction across all categories, ending soonest first."
      />

      <div className="mx-auto max-w-6xl px-6 py-5">
        {!loading && !error && (
          <p className="text-sm text-slate-400">
            {auctions.length} live {auctions.length === 1 ? "auction" : "auctions"}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        {loading ? (
          <EmptyState title="Loading live auctions…" />
        ) : error ? (
          <EmptyState title={error} />
        ) : auctions.length === 0 ? (
          <EmptyState
            title="No live auctions right now."
            subtitle="Check back soon, or browse upcoming listings by category."
            action={
              <button onClick={() => navigate("/browse")} className="text-sm text-primary underline">
                Browse categories
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
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