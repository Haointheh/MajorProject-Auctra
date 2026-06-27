// src/pages/AuctionDetailPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuctionById, formatPrice } from "../data/mockAuctions";
import useCountdown from "../hooks/useCountdown";
import Button from "../ui/Button";
import AuthModal from "../auth/AuthModal";
import { useAuthStore } from "../store/useAuthStore";

// ── Condition label ───────────────────────────────────────────────────────────
const CONDITION_LABELS = {
  excellent: { label: "Excellent", color: "text-emerald-600 bg-emerald-50" },
  good: { label: "Good", color: "text-blue-600 bg-blue-50" },
  fair: { label: "Fair", color: "text-amber-600 bg-amber-50" },
  poor: { label: "Poor", color: "text-rose-600 bg-rose-50" },
};

function ConditionBadge({ condition }) {
  const c = CONDITION_LABELS[condition] || { label: condition, color: "text-slate-500 bg-slate-100" };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 ${c.color}`}>{c.label}</span>
  );
}

// ── Status section ────────────────────────────────────────────────────────────
function AuctionStatus({ auction }) {
  const countdown = useCountdown(
    auction.status === "live" ? auction.end_time : auction.start_time
  );

  if (auction.status === "live") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Live Auction
          </span>
        </div>
        <p className="text-2xl font-black text-slate-900 font-mono">{countdown}</p>
        <p className="text-xs text-slate-500 mt-1">remaining</p>
      </div>
    );
  }

  if (auction.status === "scheduled") {
    return (
      <div className="bg-slate-50 border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Upcoming Auction
          </span>
        </div>
        <p className="text-2xl font-black text-slate-900 font-mono">{countdown}</p>
        <p className="text-xs text-slate-500 mt-1">until bidding opens</p>
      </div>
    );
  }

  return (
    <div className="bg-rose-50 border border-rose-200 p-4">
      <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">
        Auction Ended
      </p>
      <p className="text-sm text-slate-500 mt-1">
        Final price: <span className="font-bold text-slate-900">{formatPrice(auction.current_bid)}</span>
      </p>
    </div>
  );
}

// ── Bid section ───────────────────────────────────────────────────────────────
function BidSection({ auction, isAuthenticated, onLoginRequired }) {
  const [bidAmount, setBidAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const minimumBid = auction.current_bid + 500;

  const handleBid = () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    const amount = parseInt(bidAmount, 10);
    if (!amount || amount < minimumBid) {
      alert(`Minimum bid is ${formatPrice(minimumBid)}`);
      return;
    }
    // TODO: POST /auctions/{id}/bid
    console.log("Placing bid:", amount);
    setSubmitted(true);
  };

  if (auction.status === "ended") return null;

  if (auction.status === "scheduled") {
    return (
      <div className="border border-slate-200 p-4 text-sm text-slate-500">
        Bidding opens when the auction starts. You can watch this listing and come back then.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 font-semibold text-sm">
        Bid placed successfully! You'll be notified if you're outbid.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 p-4 space-y-3">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Your Bid (minimum {formatPrice(minimumBid)})
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={String(minimumBid)}
            className="flex-1 border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBid}
          >
            {isAuthenticated ? "Place Bid" : "Log in to Bid"}
          </Button>
        </div>
      </div>
      {!isAuthenticated && (
        <p className="text-xs text-slate-400">
          You need an account to participate.{" "}
          <button onClick={onLoginRequired} className="text-primary underline font-medium">
            Log in or sign up
          </button>
        </p>
      )}
    </div>
  );
}

// ── AuctionDetailPage ─────────────────────────────────────────────────────────
export default function AuctionDetailPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const auction = getAuctionById(id);

  if (!auction) {
    return (
      <main className="min-h-screen bg-neutral1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">Auction not found</p>
          <button
            onClick={() => navigate(`/auctions/${category}`)}
            className="mt-4 text-sm text-primary underline"
          >
            Back to {category}
          </button>
        </div>
      </main>
    );
  }

  const handleLoginRequired = () => {
    setAuthMode("login");
    setShowAuth(true);
  };

  return (
    <main className="min-h-screen bg-neutral1">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-2 text-xs text-slate-400">
          <button onClick={() => navigate("/")} className="hover:text-slate-700">Home</button>
          <span>/</span>
          <button
            onClick={() => navigate(`/auctions/${category}`)}
            className="hover:text-slate-700 capitalize"
          >
            {category}
          </button>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-48">{auction.title}</span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── Left: Image ── */}
        <div>
          <div className="w-full aspect-square bg-slate-200 overflow-hidden">
            <img
              src={auction.images[0]?.image_path}
              alt={auction.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* AI Verified */}
          {auction.is_ai_verified && (
            <div className="mt-3 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="w-2 h-2 bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">
                AI Verified — Authenticity confirmed by Auctra's fraud detection system
              </span>
            </div>
          )}
        </div>

        {/* ── Right: Details ── */}
        <div className="flex flex-col gap-5">

          {/* Title */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900 leading-snug">
                {auction.title}
              </h1>
              <ConditionBadge condition={auction.condition} />
            </div>
            <p className="text-sm text-slate-400 mt-1">by {auction.seller.name}</p>
          </div>

          {/* Status countdown */}
          <AuctionStatus auction={auction} />

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-100 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Starting Bid
              </p>
              <p className="text-lg font-black text-slate-700 mt-1">
                {formatPrice(auction.base_price)}
              </p>
            </div>
            <div className="border border-slate-100 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {auction.bid_count > 0 ? "Current Bid" : "No Bids Yet"}
              </p>
              <p className="text-lg font-black text-slate-900 mt-1">
                {formatPrice(auction.current_bid)}
              </p>
              {auction.bid_count > 0 && (
                <p className="text-[10px] text-slate-400">
                  {auction.bid_count} bid{auction.bid_count !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Bid section */}
          <BidSection
            auction={auction}
            isAuthenticated={isAuthenticated}
            onLoginRequired={handleLoginRequired}
          />

          {/* Description */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Description
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{auction.description}</p>
          </div>

          {/* Meta */}
          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
            <div>
              <span className="font-bold text-slate-700 block">Category</span>
              <span className="capitalize">{auction.category}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Condition</span>
              <span className="capitalize">{auction.condition}</span>
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
      </div>

      {showAuth && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuth(false)}
        />
      )}
    </main>
  );
}