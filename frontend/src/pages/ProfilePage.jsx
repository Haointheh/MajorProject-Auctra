import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { apiGetBidderDashboard, apiGetSellerDashboard } from "../api/auctions";
import getRole from "../utils/getRole";
import Avatar from "../ui/Avatar";
import StatCard from "../ui/StatCard";
import PageHeader from "../ui/PageHeader";

const ROLE_LABEL = { buyer: "Buyer", seller: "Seller", admin: "Administrator" };
const ROLE_EYEBROW = { buyer: "My Account", seller: "Seller Hub", admin: "Admin Panel" };

const KYC_STYLE = {
  approved: "text-emerald-700 bg-emerald-50",
  pending:  "text-amber-700 bg-amber-50",
  rejected: "text-rose-700 bg-rose-50",
};

function formatPrice(amount) {
  if (amount == null) return "—";
  return `Rs. ${Number(amount).toLocaleString()}`;
}

const OUTCOME_STYLE = {
  won:            "text-emerald-700 bg-emerald-50",
  lost:           "text-slate-500 bg-slate-100",
  pending:        "text-amber-700 bg-amber-50",
  cascade_winner: "text-blue-700 bg-blue-50",
  forfeited:      "text-rose-700 bg-rose-50",
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

export default function ProfilePage({ embedded = false }) {
  const { user } = useAuthStore();
  const role = getRole(user);

  const [myBids, setMyBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(role === "buyer");
  const [bidsError, setBidsError] = useState(null);

  useEffect(() => {
    if (role !== "buyer") return;
    let cancelled = false;
    setBidsLoading(true);
    apiGetBidderDashboard()
      .then((res) => {
        if (!cancelled) setMyBids(res.data?.my_bids || []);
      })
      .catch(() => {
        if (!cancelled) setBidsError("Couldn't load your bid history right now.");
      })
      .finally(() => {
        if (!cancelled) setBidsLoading(false);
      });
    return () => { cancelled = true; };
  }, [role]);

  const [sellerStats, setSellerStats] = useState(null);
  const [sellerStatsLoading, setSellerStatsLoading] = useState(role === "seller");

  useEffect(() => {
    if (role !== "seller") return;
    let cancelled = false;
    setSellerStatsLoading(true);
    apiGetSellerDashboard()
      .then((res) => {
        if (cancelled) return;
        const current = res.data?.current || [];
        const future = res.data?.future || [];
        const past = res.data?.past || [];
        const allAuctions = [...current, ...future, ...past];
        setSellerStats({
          activeListings: current.length + future.length,
          totalBids: allAuctions.reduce((sum, a) => sum + (a.bid_history?.length || 0), 0),
          auctionsEnded: past.length,
        });
      })
      .catch(() => {
        if (!cancelled) setSellerStats(null);
      })
      .finally(() => {
        if (!cancelled) setSellerStatsLoading(false);
      });
    return () => { cancelled = true; };
  }, [role]);

  // Same content, either way — only the surrounding chrome differs below.
  const sections = (
    <>
      {/* Account details */}
      <section className="bg-white border border-slate-100 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
          Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Full Name">{user?.name ?? "—"}</Field>
          <Field label="Email">{user?.email ?? "—"}</Field>
          <Field label="Role">{ROLE_LABEL[role]}</Field>
          <Field label="KYC Status">
            <span className={`text-xs font-bold px-2 py-0.5 capitalize ${KYC_STYLE[user?.kyc_status] ?? "text-slate-500 bg-slate-100"}`}>
              {user?.kyc_status ?? "unknown"}
            </span>
          </Field>
        </div>
      </section>

      {/* Role-specific section */}
      {role === "seller" && (
        <section className="bg-white border border-slate-100 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
            Seller Activity
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Active Listings"
              value={sellerStatsLoading ? "—" : sellerStats?.activeListings ?? "—"}
            />
            <StatCard
              label="Total Bids Received"
              value={sellerStatsLoading ? "—" : sellerStats?.totalBids ?? "—"}
            />
            <StatCard
              label="Auctions Ended"
              value={sellerStatsLoading ? "—" : sellerStats?.auctionsEnded ?? "—"}
            />
          </div>
        </section>
      )}

      {role === "buyer" && (
        <section className="bg-white border border-slate-100 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Bid History
          </h2>
          {bidsLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : bidsError ? (
            <p className="text-sm text-rose-500">{bidsError}</p>
          ) : myBids.length === 0 ? (
            <p className="text-sm text-slate-400">
              No bids placed yet. Browse auctions to get started.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myBids.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{b.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{b.category} · {b.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{formatPrice(b.my_highest_bid)}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${OUTCOME_STYLE[b.my_role_in_outcome] ?? "text-slate-500 bg-slate-100"}`}>
                      {b.my_role_in_outcome ?? "pending"}
                      {b.payment_status ? ` · ${b.payment_status}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {role === "admin" && (
        <section className="bg-white border border-slate-100 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <p className="text-sm text-slate-400">
            Manage KYC reviews and platform activity from the Admin Panel.
          </p>
        </section>
      )}
    </>
  );

  // Embedded (seller/admin, inside DashboardLayout) — fits the dashboard's
  // own PageHeader convention instead of a standalone full-page banner.
  if (embedded) {
    return (
      <div>
        <PageHeader
          eyebrow={ROLE_EYEBROW[role]}
          title="My Profile"
          subtitle="Your account details and activity."
        />
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
          {sections}
        </div>
      </div>
    );
  }

  // Standalone (buyer, under PublicRoutes) — original full-page look, unchanged.
  return (
    <main className="min-h-screen bg-neutral1">

      {/* Header — Avatar shared component */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10 flex items-center gap-5">
          <Avatar name={user?.name ?? "?"} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user?.name ?? "Guest"}</h1>
            <p className="text-slate-400 text-sm">{ROLE_LABEL[role]}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        {sections}
      </div>
    </main>
  );
}