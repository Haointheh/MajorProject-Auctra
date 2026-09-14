// Admin landing page. Wired to GET /admin/dashboard (all auctions + seller +
// bid history + payment status) and GET /kyc/pending — no separate
// pre-aggregated stats endpoint exists, so stats here are derived client-side
// from the full auction list.

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../ui/PageHeader";
import StatCard from "../../ui/StatCard";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { apiGetAdminDashboard, apiGetPendingKYc } from "../../api/admin";
import { formatPrice } from "../../data/mockAuctions";
import useAdminDashboardSocket from "../../hooks/useAdminDashboardSocket";

const PAYMENT_DUE_STATUSES = ["awaiting payment", "payment overdue — cascaded to next bidder"];

export default function AdminOverview() {
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wrapped in useCallback so the websocket effect below (which takes this
  // as its onUpdate callback) doesn't reconnect every render.
  const fetchOverview = useCallback(({ showSpinner } = {}) => {
    if (showSpinner) setLoading(true);
    setError(null);

    return Promise.all([apiGetAdminDashboard(), apiGetPendingKYc()])
      .then(([dashboardRes, kycRes]) => {
        setAuctions(dashboardRes.data?.all_auctions || []);
        setPendingKycCount((kycRes.data || []).length);
      })
      .catch(() => {
        setError("Couldn't load the admin overview right now.");
      })
      .finally(() => {
        if (showSpinner) setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOverview({ showSpinner: true });
  }, [fetchOverview]);

  // Live updates: an auction resolving, a payment deadline cascading/
  // forfeiting, or a payment being completed all change what's shown here.
  // Refetch quietly (no loading spinner — this is a background refresh,
  // not the initial page load) whenever the backend says something changed.
  useAdminDashboardSocket(() => {
    fetchOverview({ showSpinner: false });
  });

  const totalAuctions = auctions.length;
  const liveAuctions = auctions.filter((a) => a.status === "live").length;
  const paymentDueAuctions = auctions.filter((a) =>
    PAYMENT_DUE_STATUSES.includes(a.payment_status)
  );

  return (
    <div>
      <PageHeader
        eyebrow="Admin Panel"
        title="Platform Overview"
        subtitle="Monitor activity, review KYC submissions, and manage users."
      />

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading overview…</div>
        ) : error ? (
          <EmptyState title={error} />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Auctions" value={totalAuctions} />
              <StatCard label="Live Now" value={liveAuctions} accent="green" />
              <StatCard
                label="Pending KYC"
                value={pendingKycCount}
                accent={pendingKycCount > 0 ? "amber" : "default"}
              />
              <StatCard
                label="Payment Due"
                value={paymentDueAuctions.length}
                accent={paymentDueAuctions.length > 0 ? "red" : "default"}
              />
            </div>

            {pendingKycCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-amber-800">
                  <span className="font-bold">{pendingKycCount} KYC submissions</span> are waiting for review.
                </p>
                <Button variant="secondary" size="sm" onClick={() => navigate("/admin/kyc")}>
                  Review Now
                </Button>
              </div>
            )}

            {paymentDueAuctions.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-4 space-y-3">
                <p className="text-sm text-rose-800">
                  <span className="font-bold">{paymentDueAuctions.length} auction{paymentDueAuctions.length !== 1 ? "s" : ""}</span>{" "}
                  {paymentDueAuctions.length !== 1 ? "have" : "has"} payment awaiting or overdue.
                </p>
                <div className="divide-y divide-rose-100 bg-white">
                  {paymentDueAuctions.slice(0, 5).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => navigate(`/admin/auctions/${a.id}`)}
                      className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-rose-50/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
                        <p className="text-xs text-slate-400">
                          Seller: {a.seller_name} · Winning bid: {a.highest_bid_amount != null ? formatPrice(a.highest_bid_amount) : "—"}
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
          </>
        )}
      </div>
    </div>
  );
}