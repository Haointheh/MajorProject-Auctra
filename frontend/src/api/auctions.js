// src/api/auctions.js
// Real calls to the FastAPI backend
// (see backend/routes/auction_routes.py, bidding_routes.py,
//  collateral_routes.py, dashboard_routes.py).
import client, { BASE_URL } from "./client";

// ── Auctions ─────────────────────────────────────────────────────────────────
// No category filter param on the backend yet — fetch everything and filter
// client-side by `auction.category` (see CategoryPage.jsx).
export const apiListAuctions = () => client.get("/auctions");

export const apiGetAuction = (auctionId) => client.get(`/auctions/${auctionId}`);

// Seller-only. Backend expects multipart/form-data: title, description,
// category, condition, base_price, start_time, duration_days, images (1-5).
// `form` is a plain object with those scalar fields; `images` is an array of
// File objects. Requires an approved-seller token (see auth.require_approved_seller).
export const apiCreateAuction = (form, images) => {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => data.append(key, value));
  images.forEach((image) => data.append("images", image));
  return client.post("/auctions", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Seller-only, and only while the auction is still "scheduled" — the backend
// rejects (400) edits to a live/ended auction. Only title, description,
// condition, start_time, and duration_days can be changed (matches
// AuctionUpdate on the backend — no base_price/category/image edits).
export const apiUpdateAuction = (auctionId, payload) =>
  client.patch(`/auctions/${auctionId}`, payload);

// Seller-only, and only while the auction is still "scheduled" — the backend
// rejects (400) attempts to delete a live/ended auction.
export const apiDeleteAuction = (auctionId) => client.delete(`/auctions/${auctionId}`);

// ── Images ───────────────────────────────────────────────────────────────────
// Auction/KYC image paths come back from the backend as relative paths
// (e.g. "uploads/auctions/3_1.jpg") served via the /uploads static mount —
// they need the backend origin prefixed to be usable as an <img src>.
export const getImageUrl = (path) => (path ? `${BASE_URL}/${path}` : "");

// ── Bidding ──────────────────────────────────────────────────────────────────
export const apiGetBids = (auctionId) => client.get(`/auctions/${auctionId}/bids`);

export const apiPlaceBid = (auctionId, amount) =>
  client.post(`/auctions/${auctionId}/bids`, { amount });

// ── Collateral ───────────────────────────────────────────────────────────────
// Backend requires locked collateral before a bid is accepted
// (403 "You must deposit collateral before bidding on this auction").
export const apiDepositCollateral = (auctionId) =>
  client.post(`/auctions/${auctionId}/collateral`);

// Checks whether the current user already has collateral locked for this
// auction (e.g. from a previous visit/session). 404 means none deposited yet
// — callers should treat that as "no collateral", not an error.
export const apiGetMyCollateral = (auctionId) =>
  client.get(`/auctions/${auctionId}/collateral/me`);

// ── Dashboards ───────────────────────────────────────────────────────────────
export const apiGetBidderDashboard = () => client.get("/bidder/dashboard");
