import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { apiGetSellerDashboard, getImageUrl } from "../../api/auctions";
import StatCard from "../../ui/StatCard";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import EmptyState from "../../ui/EmptyState";
import { formatPrice } from "../../data/mockAuctions";

const PAYMENT_DUE_STATUSES = ["awaiting payment", "payment overdue — cascaded to next bidder"];

export default function SellerOverview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [myAuctions, setMyAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // One call  — GET /seller/dashboard returns everything this page
  // needs (images, payment_status, real bid_history)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiGetSellerDashboard()
      .then((res) => {
        if (cancelled) return;
        const all = [
          ...(res.data?.current || []),
          ...(res.data?.future || []),
          ...(res.data?.past || []),
        ];
        const mine = all.map((a) => ({
          ...a,
          current_bid: a.highest_bid_amount ?? a.base_price,
          bid_count: a.bid_history?.length ?? 0,
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
  const paymentDueAuctions = myAuctions.filter((a) => PAYMENT_DUE_STATUSES.includes(a.payment_status));
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Live Auctions" value={liveCount} accent="green" />
          <StatCard label="Scheduled" value={scheduledCount} />
          <StatCard label="Total Bids Received" value={totalBids} />
          <StatCard label="Highest Current Bid" value={highestBid ? formatPrice(highestBid) : "—"} />
          <StatCard
            label="Payment Due"
            value={paymentDueAuctions.length}
            accent={paymentDueAuctions.length > 0 ? "red" : "default"}
          />
        </div>

        {paymentDueAuctions.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-4 space-y-3">
            <p className="text-sm text-rose-800">
              <span className="font-bold">
                {paymentDueAuctions.length} auction{paymentDueAuctions.length !== 1 ? "s" : ""}
              </span>{" "}
              {paymentDueAuctions.length !== 1 ? "have" : "has"} payment awaiting or overdue from the buyer.
            </p>
            <div className="divide-y divide-rose-100 bg-white">
              {paymentDueAuctions.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/seller/dashboard/auctions/${a.id}`)}
                  className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-rose-50/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
                    <p className="text-xs text-slate-400">
                      Current bid: {formatPrice(a.current_bid)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 text-rose-700 bg-rose-50 shrink-0 capitalize">
                    {a.payment_status}
                  </span>
                </button>
              ))}
            </div>
            {paymentDueAuctions.length > 5 && (
              <p className="text-xs text-rose-500">+{paymentDueAuctions.length - 5} more</p>
            )}
          </div>
        )}

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