// src/pages/seller/SellerAuctionPage.jsx
// Seller's view of one of their own auctions.
// Uses the same Breadcrumb and EmptyState UI components as AuctionDetailPage.
// BidFeed and LiveAuctionView will plug in here later without changing this file.

import { useParams, useNavigate } from "react-router-dom";
import { getAuctionById, formatPrice } from "../../data/mockAuctions";
import { MOCK_BIDS } from "../../data/mockBids";
import Breadcrumb from "../../ui/Breadcrumb";
import EmptyState from "../../ui/EmptyState";
import ConditionBadge from "../../ui/ConditionBadge";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";
import useCountdown from "../../hooks/useCountdown";

// ── Countdown banner (seller sees same banner as public page) ─────────────────
function AuctionStatus({ auction }) {
  const countdown = useCountdown(
    auction.status === "live" ? auction.end_time : auction.start_time
  );

  if (auction.status === "live") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Live Now</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900 font-mono">{countdown}</p>
          <p className="text-xs text-slate-400">remaining</p>
        </div>
      </div>
    );
  }

  if (auction.status === "scheduled") {
    return (
      <div className="bg-slate-50 border border-slate-200 p-4 flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upcoming</span>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900 font-mono">{countdown}</p>
          <p className="text-xs text-slate-400">until start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50 border border-rose-200 p-4 flex items-center justify-between">
      <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Auction Ended</span>
      <span className="text-sm font-bold text-slate-900">{formatPrice(auction.current_bid)}</span>
    </div>
  );
}

// ── Seller controls ───────────────────────────────────────────────────────────
function SellerControls({ auction, onDelete }) {
  if (auction.status === "scheduled") {
    return (
      <div className="border border-slate-100 bg-white p-4 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</p>
        <Button
          variant="primaryBorder"
          size="sm"
          className="w-full"
          onClick={() => onDelete(auction.id)}
        >
          Delete Auction
        </Button>
        <p className="text-[10px] text-slate-400 text-center">
          Scheduled auctions can be deleted before they go live.
        </p>
      </div>
    );
  }
  if (auction.status === "live") {
    return (
      <div className="border border-slate-100 bg-white p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Actions</p>
        <p className="text-xs text-slate-500">
          Auction is live. Listings cannot be modified while bidding is in progress.
        </p>
      </div>
    );
  }
  return null;
}

// ── Bid history table (placeholder — BidFeed plugs in here later) ─────────────
function BidTable({ bids }) {
  if (!bids || bids.length === 0) {
    return (
      <EmptyState title="No bids yet." subtitle="Bids will appear here once the auction goes live." />
    );
  }

  return (
    <div className="bg-white border border-slate-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
          Bid History — {bids.length} bid{bids.length !== 1 ? "s" : ""}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bidder</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, i) => (
            <tr key={bid.id} className={`border-b border-slate-50 ${i === 0 ? "bg-amber-50/40" : "hover:bg-slate-50"}`}>
              <td className="px-4 py-3 font-medium text-slate-800">{bid.bidder_name}</td>
              <td className="px-4 py-3 text-right font-black text-slate-900">{formatPrice(bid.amount)}</td>
              <td className="px-4 py-3 text-right text-xs text-slate-400">
                {new Date(bid.placed_at).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SellerAuctionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auction = getAuctionById(id);
  const bids = (MOCK_BIDS && MOCK_BIDS[id]) ? MOCK_BIDS[id] : [];

  if (!auction) {
    return (
      <div className="p-8">
        <EmptyState
          title="Auction not found"
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate("/seller/dashboard/auctions")}>
              Back to Listings
            </Button>
          }
        />
      </div>
    );
  }

  const handleDelete = (auctionId) => {
    if (!window.confirm(`Delete "${auction.title}"? This cannot be undone.`)) return;
    // TODO: await client.delete(`/auctions/${auctionId}`)
    console.log("Delete:", auctionId);
    navigate("/seller/dashboard/auctions");
  };

  return (
    <div>
      {/* Breadcrumb uses the shared ui/Breadcrumb component */}
      <Breadcrumb
        items={[
          { label: "My Listings", onClick: () => navigate("/seller/dashboard/auctions") },
          { label: auction.title },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Left: image + meta */}
        <div className="space-y-4">
          <div className="aspect-square w-full bg-slate-200 overflow-hidden">
            <img src={auction.images[0]?.image_path} alt={auction.title} className="w-full h-full object-cover" />
          </div>

          {/* Meta grid */}
          <div className="bg-white border border-slate-100 p-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
            <div>
              <span className="font-bold text-slate-700 block">Category</span>
              <span className="capitalize">{auction.category}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Condition</span>
              {/* ConditionBadge shared component */}
              <ConditionBadge condition={auction.condition} />
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Start</span>
              <span>{new Date(auction.start_time).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">End</span>
              <span>{new Date(auction.end_time).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: details + controls */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{auction.title}</h1>
            {/* StatusBadge shared component */}
            <StatusBadge status={auction.status} size="md" />
          </div>

          <AuctionStatus auction={auction} />

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-100 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Starting Bid</p>
              <p className="text-lg font-black text-slate-700 mt-1">{formatPrice(auction.base_price)}</p>
            </div>
            <div className="border border-slate-100 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {bids.length > 0 ? "Current Bid" : "No Bids Yet"}
              </p>
              <p className="text-lg font-black text-slate-900 mt-1">{formatPrice(auction.current_bid)}</p>
              {bids.length > 0 && (
                <p className="text-[10px] text-slate-400">{bids.length} bid{bids.length !== 1 ? "s" : ""}</p>
              )}
            </div>
          </div>

          <SellerControls auction={auction} onDelete={handleDelete} />

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed">{auction.description}</p>
          </div>
        </div>
      </div>

      {/* Bid history — full width below grid */}
      <div className="mx-auto max-w-6xl px-6 pb-12">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Bid History</p>
        <BidTable bids={bids} />
      </div>
    </div>
  );
}