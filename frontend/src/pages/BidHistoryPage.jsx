// Dedicated "My Bids" page — reached from UserMenu (ROLE_MENU.buyer -> /profile/bids).
// Buyer-only. Pulls the same data as ProfilePage's inline preview
// (GET /bidder/dashboard) but as a full page with filtering.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { apiGetBidderDashboard } from "../api/auctions";
import { formatPrice } from "../data/mockAuctions";
import getRole from "../utils/getRole";
import Breadcrumb from "../ui/Breadcrumb";
import EmptyState from "../ui/EmptyState";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";

const OUTCOME_LABEL = {
  won: "Won",
  lost: "Lost",
  pending: "Pending",
  cascade_winner: "Won (Cascade)",
  forfeited: "Forfeited",
};

const OUTCOME_STYLE = {
  won: "text-emerald-700 bg-emerald-50",
  lost: "text-slate-500 bg-slate-100",
  pending: "text-amber-700 bg-amber-50",
  cascade_winner: "text-blue-700 bg-blue-50",
  forfeited: "text-rose-700 bg-rose-50",
};

const AUCTION_STATUS_STYLE = {
  live: "text-emerald-700 bg-emerald-50",
  scheduled: "text-slate-500 bg-slate-100",
  ended: "text-slate-500 bg-slate-100",
  cancelled: "text-rose-700 bg-rose-50",
};

const PAYMENT_STYLE = {
  paid: "text-emerald-700 bg-emerald-50",
  "awaiting payment": "text-amber-700 bg-amber-50",
  overdue: "text-rose-700 bg-rose-50",
};

const FILTERS = ["All", "Live", "Won", "Lost", "Payment Due"];

function matchesFilter(bid, filter) {
  if (filter === "All") return true;
  if (filter === "Live") return bid.status === "live";
  if (filter === "Won") return bid.my_role_in_outcome === "won" || bid.my_role_in_outcome === "cascade_winner";
  if (filter === "Lost") return bid.my_role_in_outcome === "lost" || bid.my_role_in_outcome === "forfeited";
  if (filter === "Payment Due") return bid.payment_status === "awaiting payment" || bid.payment_status === "overdue";
  return true;
}

export default function BidHistoryPage() {
  const { user } = useAuthStore();
  const role = getRole(user);
  const navigate = useNavigate();

  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (role !== "buyer") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiGetBidderDashboard()
      .then((res) => {
        if (!cancelled) setMyBids(res.data?.my_bids || []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your bid history right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (role !== "buyer") {
    return (
      <main className="min-h-screen bg-neutral1">
        <Breadcrumb
          items={[
            { label: "Profile", onClick: () => navigate("/profile") },
            { label: "My Bids" },
          ]}
        />
        <EmptyState
          title="My Bids is only available for buyer accounts."
          subtitle="Switch to a buyer account to see your bidding history."
        />
      </main>
    );
  }

  const filteredBids = myBids.filter((b) => matchesFilter(b, filter));

  const wonCount = myBids.filter(
    (b) => b.my_role_in_outcome === "won" || b.my_role_in_outcome === "cascade_winner"
  ).length;
  const liveCount = myBids.filter((b) => b.status === "live").length;
  const paymentDueCount = myBids.filter(
    (b) => b.payment_status === "awaiting payment" || b.payment_status === "overdue"
  ).length;

  return (
    <main className="min-h-screen bg-neutral1">
      <Breadcrumb
        items={[
          { label: "Profile", onClick: () => navigate("/profile") },
          { label: "My Bids" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bids</h1>
          <p className="text-sm text-slate-400 mt-1">
            Every auction you've placed a bid on, and how it turned out.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Auctions" value={myBids.length} />
          <StatCard label="Currently Live" value={liveCount} accent="green" />
          <StatCard label="Won" value={wonCount} accent="green" />
          <StatCard
            label="Payment Due"
            value={paymentDueCount}
            accent={paymentDueCount > 0 ? "red" : "default"}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <section className="bg-white border border-slate-100">
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400">Loading your bids…</div>
          ) : error ? (
            <div className="py-20 text-center text-sm text-rose-500">{error}</div>
          ) : filteredBids.length === 0 ? (
            <EmptyState
              title={myBids.length === 0 ? "No bids placed yet." : "No bids match this filter."}
              subtitle={
                myBids.length === 0
                  ? "Browse live auctions to place your first bid."
                  : "Try a different filter above."
              }
              action={
                myBids.length === 0 && (
                  <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
                    Browse Auctions
                  </Button>
                )
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredBids.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/auctions/${b.category}/${b.id}`)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{b.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400 capitalize">{b.category}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 capitalize ${
                          AUCTION_STATUS_STYLE[b.status] ?? "text-slate-500 bg-slate-100"
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.is_current_highest_bidder && b.status === "live" && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 text-blue-700 bg-blue-50">
                          Highest Bidder
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-900">
                      {formatPrice(b.my_highest_bid)}
                    </p>
                    <div className="flex items-center gap-1.5 justify-end mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                          OUTCOME_STYLE[b.my_role_in_outcome] ?? "text-slate-500 bg-slate-100"
                        }`}
                      >
                        {OUTCOME_LABEL[b.my_role_in_outcome] ?? "Pending"}
                      </span>
                      {b.payment_status && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                            PAYMENT_STYLE[b.payment_status] ?? "text-slate-500 bg-slate-100"
                          }`}
                        >
                          {b.payment_status}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
