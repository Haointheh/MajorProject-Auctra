// import React from 'react'

// const AdminAuctionPage = () => {
//   return (
//     <div>AdminAuctionPage</div>
//   )
// }

// export default AdminAuctionPage

// src/pages/admin/AdminAuctionPage.jsx
// Admin's view of any auction — full bidder names, fraud risk column.
// Reuses LiveAuctionView (role="admin") same as seller/buyer pages.

import { useParams, useNavigate } from "react-router-dom";
import { getAuctionById } from "../../data/mockAuctions";
import { MOCK_BIDS } from "../../data/mockBids";
import LiveAuctionView from "../../components/auction/LiveAuctionView";
import Breadcrumb from "../../ui/Breadcrumb";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";

export default function AdminAuctionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auction = getAuctionById(id);
  const bids = MOCK_BIDS[id] ?? [];

  if (!auction) {
    return (
      <EmptyState
        title="Auction not found"
        action={
          <Button variant="secondary" size="sm" onClick={() => navigate("/admin")}>
            Back to Admin Panel
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Admin Panel", onClick: () => navigate("/admin") },
          { label: auction.title },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <LiveAuctionView auction={auction} bids={bids} role="admin" />
      </div>
    </div>
  );
}