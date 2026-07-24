import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatPrice } from "../data/mockAuctions";
import { apiGetAuction, apiGetBids, apiPlaceBid, apiDepositCollateral, apiGetMyCollateral, getImageUrl } from "../api/auctions";
import useCountdown from "../hooks/useCountdown";
import Button from "../ui/Button";
import AuthModal from "../auth/AuthModal";
import ConditionBadge from "../ui/ConditionBadge";
import Breadcrumb from "../ui/Breadcrumb";
import EmptyState from "../ui/EmptyState";
import BidFeed from "../components/BidFeed";
import { useAuthStore } from "../store/useAuthStore";
import getRole from "../utils/getRole";

// ── Status + countdown ────────────────────────────────────────────────────────
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
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Upcoming Auction
        </span>
        <p className="text-2xl font-black text-slate-900 font-mono mt-1">{countdown}</p>
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
        Final price:{" "}
        <span className="font-bold text-slate-900">{formatPrice(auction.current_bid)}</span>
      </p>
    </div>
  );
}

// ── Bid + collateral section ────────────────────────────────────────────────
// Role gating:
//   guest  -> "log in to bid" prompt
//   buyer  -> collateral deposit, then the bid form
//   seller -> nothing rendered (backend still lets a seller bid on someone
//             else's auction — this UI restriction doesn't replace a real
//             backend check, see conversation notes)
//   admin  -> nothing rendered (backend already blocks admin bids with 403)
function BidSection({ auction, role, isAuthenticated, onLoginRequired, onBidPlaced }) {
  const [collateral, setCollateral] = useState(null);
  const [checkingCollateral, setCheckingCollateral] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState(null);

  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  // On mount, check whether this user already deposited collateral for this
  // auction in an earlier visit/session — otherwise the deposit prompt would
  // show up every time even after it's already been paid.
  useEffect(() => {
    let cancelled = false;

    if (!(isAuthenticated && role === "buyer" && auction.status === "live")) {
      setCheckingCollateral(false);
      return;
    }

    setCheckingCollateral(true);
    apiGetMyCollateral(auction.id)
      .then((res) => {
        if (!cancelled) setCollateral(res.data);
      })
      .catch(() => {
        // 404 just means no collateral deposited yet — not an error.
      })
      .finally(() => {
        if (!cancelled) setCheckingCollateral(false);
      });

    return () => {
      cancelled = true;
    };
  }, [auction.id, auction.status, isAuthenticated, role]);

  // Suggested minimum for the placeholder only — the backend is the source
  // of truth for the real minimum (config.MIN_BID_INCREMENT) and will reject
  // anything too low with a clear error message.
  const suggestedMinimum = (auction.current_bid ?? auction.base_price) + 100;

  if (auction.status === "ended" || auction.status === "cancelled") return null;
  if (role === "seller" || role === "admin") return null;

  if (auction.status === "scheduled") {
    return (
      <div className="border border-slate-200 p-4 text-sm text-slate-500">
        Bidding opens when the auction starts. You can watch this listing and come back then.
      </div>
    );
  }

  if (role === "guest") {
    return (
      <div className="border border-slate-200 p-4 space-y-2">
        <p className="text-sm text-slate-500">
          You need an account to participate in this auction.
        </p>
        <Button variant="secondary" size="sm" onClick={onLoginRequired}>
          Log in to Bid
        </Button>
      </div>
    );
  }

  if (checkingCollateral) {
    return (
      <div className="border border-slate-200 p-4 text-sm text-slate-400">
        Checking your collateral status…
      </div>
    );
  }

  const handleDepositCollateral = async () => {
    setDepositing(true);
    setDepositError(null);
    try {
      const res = await apiDepositCollateral(auction.id);
      setCollateral(res.data);
    } catch (err) {
      const detail = err?.response?.data?.detail || "";
      if (err?.response?.status === 400 && detail.toLowerCase().includes("already deposited")) {
        // Already locked from an earlier visit — safe to move on to bidding.
        setCollateral({ amount: null });
      } else {
        setDepositError(detail || "Couldn't deposit collateral. Please try again.");
      }
    } finally {
      setDepositing(false);
    }
  };

  if (!collateral) {
    return (
      <div className="border border-slate-200 p-4 space-y-3">
        <div className="bg-slate-50 border border-slate-200 p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Required Collateral
          </span>
          <span className="text-lg font-black text-slate-900">
            {auction.estimated_collateral != null
              ? formatPrice(auction.estimated_collateral)
              : "—"}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          A refundable collateral deposit is required before you can bid on this auction.
          {auction.estimated_collateral != null &&
            " This amount is locked to your account and refunded if you don't win."}
        </p>
        {depositError && <p className="text-sm text-rose-600">{depositError}</p>}
        <Button variant="secondary" size="sm" onClick={handleDepositCollateral} disabled={depositing}>
          {depositing ? "Depositing…" : "Deposit Collateral to Enable Bidding"}
        </Button>
      </div>
    );
  }

  if (bidSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 font-semibold text-sm">
        Bid placed successfully! You'll be notified if you're outbid.
      </div>
    );
  }

  const handleBid = async () => {
    const amount = parseInt(bidAmount, 10);
    if (!amount) {
      setBidError("Enter a bid amount.");
      return;
    }
    setPlacingBid(true);
    setBidError(null);
    try {
      await apiPlaceBid(auction.id, amount);
      setBidSuccess(true);
      onBidPlaced?.();
    } catch (err) {
      setBidError(err?.response?.data?.detail || "Couldn't place bid. Please try again.");
    } finally {
      setPlacingBid(false);
    }
  };

  return (
    <div className="border border-slate-200 p-4 space-y-3">
      {collateral.amount != null && (
        <p className="text-xs font-semibold text-emerald-700">
          Collateral of {formatPrice(collateral.amount)} locked for this auction.
        </p>
      )}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        Your Bid (minimum {formatPrice(suggestedMinimum)})
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder={String(suggestedMinimum)}
          className="flex-1 border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
        />
        <Button variant="secondary" size="sm" onClick={handleBid} disabled={placingBid}>
          {placingBid ? "Placing…" : "Place Bid"}
        </Button>
      </div>
      {bidError && <p className="text-xs text-rose-600">{bidError}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AuctionDetailPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const role = isAuthenticated ? getRole(user) : "guest";

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadAuction = useCallback(() => {
    return apiGetAuction(id)
      .then((res) => {
        setAuction({
          ...res.data,
          current_bid: res.data.current_highest_bid ?? res.data.base_price,
          bid_count: undefined, // not returned by this endpoint — see BidFeed for the real count
        });
        setNotFound(false);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const loadBids = useCallback(() => {
    return apiGetBids(id)
      .then((res) => setBids(res.data || []))
      .catch(() => {}); // bid feed is supplementary — a failed refresh shouldn't break the page
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadAuction(), loadBids()]).finally(() => setLoading(false));
  }, [loadAuction, loadBids]);

  // Light polling while live, until a websocket feed replaces this (see BidFeed.jsx).
  useEffect(() => {
    if (auction?.status !== "live") return;
    const interval = setInterval(() => {
      loadAuction();
      loadBids();
    }, 5000);
    return () => clearInterval(interval);
  }, [auction?.status, loadAuction, loadBids]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral1 flex items-center justify-center">
        <EmptyState title="Loading auction…" />
      </main>
    );
  }

  if (notFound || !auction) {
    return (
      <main className="min-h-screen bg-neutral1 flex items-center justify-center">
        <EmptyState
          title="Auction not found"
          action={
            <button
              onClick={() => navigate(`/auctions/${category}`)}
              className="text-sm text-primary underline"
            >
              Back to {category}
            </button>
          }
        />
      </main>
    );
  }

  // Sellers may only view detail pages for their own auctions.
  if (role === "seller" && auction.seller?.id !== user?.id) {
    return (
      <main className="min-h-screen bg-neutral1 flex items-center justify-center">
        <EmptyState
          title="You can only view your own listings here."
          subtitle="Manage this from your seller dashboard instead."
          action={
            <button
              onClick={() => navigate("/seller/dashboard/auctions")}
              className="text-sm text-primary underline"
            >
              Go to My Listings
            </button>
          }
        />
      </main>
    );
  }

  const feedBids = bids.map((b) => ({
    id: b.id,
    bidder_id: b.bidder.id,
    bidder_name: b.bidder.name,
    amount: b.amount,
    placed_at: b.created_at,
  }));

  return (
    <main className="min-h-screen bg-neutral1">

      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: category, onClick: () => navigate(`/auctions/${category}`) },
          { label: auction.title },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Left: image */}
        <div>
          <div className="w-full aspect-square bg-slate-200 overflow-hidden">
            <img
              src={getImageUrl(auction.images[0]?.image_path)}
              alt={auction.title}
              className="w-full h-full object-cover"
            />
          </div>
          {auction.is_ai_verified && (
            <div className="mt-3 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="w-2 h-2 bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">
                AI Verified — Authenticity confirmed by Auctra's fraud detection system
              </span>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="flex flex-col gap-5">

          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900 leading-snug">
                {auction.title}
              </h1>
              <ConditionBadge condition={auction.condition} />
            </div>
            <p className="text-sm text-slate-400 mt-1">by {auction.seller?.name}</p>
          </div>

          <AuctionStatus auction={auction} />

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
                {bids.length > 0 ? "Current Bid" : "No Bids Yet"}
              </p>
              <p className="text-lg font-black text-slate-900 mt-1">
                {formatPrice(auction.current_bid)}
              </p>
              {bids.length > 0 && (
                <p className="text-[10px] text-slate-400">
                  {bids.length} bid{bids.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <BidSection
            auction={auction}
            role={role}
            isAuthenticated={isAuthenticated}
            onLoginRequired={() => { setAuthMode("login"); setShowAuth(true); }}
            onBidPlaced={() => { loadAuction(); loadBids(); }}
          />

          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Description
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{auction.description}</p>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
            <div>
              <span className="font-bold text-slate-700 block">Category</span>
              <span className="capitalize">{auction.category}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Condition</span>
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

          <BidFeed
            auctionId={auction.id}
            bids={feedBids}
            isLive={auction.status === "live"}
            role={role}
            currentUserId={user?.id}
          />
        </div>
      </div>

      {showAuth && (
        <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />
      )}
    </main>
  );
}
