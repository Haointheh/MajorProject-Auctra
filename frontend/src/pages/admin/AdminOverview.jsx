// import React from 'react'

// const AdminOverview = () => {
//   return (
//     <div>AdminOveview</div>
//   )
// }

// export default AdminOverview

// src/pages/admin/AdminOverview.jsx
// Admin landing page. Mock stats now — replace with GET /admin/stats later.

import { useNavigate } from "react-router-dom";
import PageHeader from "../../ui/PageHeader";
import StatCard from "../../ui/StatCard";
import Button from "../../ui/Button";

// Mock — replace with real aggregation endpoint
const MOCK_STATS = {
  totalUsers: 248,
  pendingKyc: 7,
  liveAuctions: 12,
  flaggedBids: 3,
};

export default function AdminOverview() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        eyebrow="Admin Panel"
        title="Platform Overview"
        subtitle="Monitor activity, review KYC submissions, and manage users."
      />

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={MOCK_STATS.totalUsers} />
          <StatCard
            label="Pending KYC"
            value={MOCK_STATS.pendingKyc}
            accent={MOCK_STATS.pendingKyc > 0 ? "amber" : "default"}
          />
          <StatCard label="Live Auctions" value={MOCK_STATS.liveAuctions} accent="green" />
          <StatCard
            label="Flagged Bids"
            value={MOCK_STATS.flaggedBids}
            accent={MOCK_STATS.flaggedBids > 0 ? "red" : "default"}
          />
        </div>

        {MOCK_STATS.pendingKyc > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-amber-800">
              <span className="font-bold">{MOCK_STATS.pendingKyc} KYC submissions</span> are waiting for review.
            </p>
            <Button variant="secondary" size="sm" onClick={() => navigate("/admin/kyc")}>
              Review Now
            </Button>
          </div>
        )}

        {MOCK_STATS.flaggedBids > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-rose-800">
              <span className="font-bold">{MOCK_STATS.flaggedBids} bids</span> flagged for potential shill bidding or fraud risk.
            </p>
            <span className="text-xs text-rose-500">Fraud review queue coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}