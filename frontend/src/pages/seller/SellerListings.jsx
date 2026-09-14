// Full table of the seller's auctions. Delete only works on scheduled auctions
// to match the backend rule (DELETE /auctions/{id} rejects live/ended).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../data/mockAuctions";
import { apiGetSellerDashboard, apiDeleteAuction, getImageUrl } from "../../api/auctions";
import { useAuthStore } from "../../store/useAuthStore";
import PageHeader from "../../ui/PageHeader";
import StatusBadge from "../../ui/StatusBadge";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";

const FILTERS = ["All", "Live", "Scheduled", "Ended"];

const PAYMENT_STYLE = {
  paid: "text-emerald-700 bg-emerald-50",
  "awaiting payment": "text-amber-700 bg-amber-50",
  "payment overdue — cascaded to next bidder": "text-rose-700 bg-rose-50",
  "sale failed": "text-rose-800 bg-rose-100",
};

export default function SellerListings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState("All");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // One call— GET /seller/dashboard returns everything this page
  // needs (images, payment_status, real bid_history)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

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
        setAuctions(mine);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your auctions right now. Please try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const filtered = auctions.filter((a) => {
    if (filter === "Live") return a.status === "live";
    if (filter === "Scheduled") return a.status === "scheduled";
    if (filter === "Ended") return a.status === "ended";
    return true;
  });

  const handleDelete = async (e, auction) => {
    e.stopPropagation();
    if (auction.status !== "scheduled") return; // guard mirrors backend rule
    if (!confirm(`Delete "${auction.title}"? This cannot be undone.`)) return;

    setDeletingId(auction.id);
    try {
      await apiDeleteAuction(auction.id);
      setAuctions((prev) => prev.filter((a) => a.id !== auction.id));
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to delete auction.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Seller Hub"
        title="My Listings"
        subtitle="Manage your auctions and track their status."
        action={
          <Button variant="secondary" size="sm" onClick={() => navigate("/seller/dashboard/create")}>
            + Create Auction
          </Button>
        }
      />

      <div className="mx-auto max-w-6xl px-6 py-6">

        {/* Filter bar */}
        <div className="flex gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold border transition-colors ${
                filter === f
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <EmptyState title="Loading your auctions…" />
        ) : error ? (
          <EmptyState title={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No auctions here yet."
            subtitle="Create your first listing to get started."
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate("/seller/dashboard/create")}>
                + Create Auction
              </Button>
            }
          />
        ) : (
          <div className="bg-white border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Bid</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bids</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ends</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/seller/dashboard/auctions/${a.id}`)}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(a.images[0]?.image_path)} alt={a.title} className="w-10 h-10 object-cover bg-slate-100 shrink-0" />
                        <span className="font-medium text-slate-900 truncate max-w-48">{a.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      {a.payment_status && (
                        <span
                          className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 capitalize ${
                            PAYMENT_STYLE[a.payment_status] ?? "text-slate-500 bg-slate-100"
                          }`}
                        >
                          {a.payment_status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatPrice(a.current_bid)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{a.bid_count}</td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      {new Date(a.end_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => handleDelete(e, a)}
                        disabled={a.status !== "scheduled" || deletingId === a.id}
                        className={`text-xs font-medium px-2 py-1 transition-colors ${
                          a.status === "scheduled"
                            ? "text-rose-500 hover:bg-rose-50"
                            : "text-slate-300 cursor-not-allowed"
                        }`}
                        title={a.status !== "scheduled" ? "Only scheduled auctions can be deleted" : "Delete"}
                      >
                        {deletingId === a.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}