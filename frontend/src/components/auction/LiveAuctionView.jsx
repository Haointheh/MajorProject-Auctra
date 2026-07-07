import React from "react";
import { formatPrice } from "../../data/mockAuctions";

export default function LiveAuctionView({ auction, bids = [], role = "buyer" }) {
  const topBid = bids[0]?.amount ?? auction.current_bid;

  return (
    <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {role === "admin" ? "Admin oversight" : "Live auction"}
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-900">{auction.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{auction.description}</p>
        </div>
        <div className="rounded-none border border-slate-200 bg-slate-50 px-4 py-3 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current bid</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{formatPrice(topBid)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Seller</p>
          <p className="mt-2 font-semibold text-slate-800">{auction.seller?.name || "Unknown seller"}</p>
        </div>
        <div className="border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Condition</p>
          <p className="mt-2 font-semibold text-slate-800 capitalize">{auction.condition}</p>
        </div>
        <div className="border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Bid count</p>
          <p className="mt-2 font-semibold text-slate-800">{bids.length}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Recent activity</p>
        <div className="mt-3 space-y-2">
          {bids.length === 0 ? (
            <div className="border border-dashed border-slate-200 p-4 text-sm text-slate-500">No bids yet.</div>
          ) : (
            bids.map((bid) => (
              <div key={bid.id} className="flex items-center justify-between border border-slate-100 bg-white px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-800">{bid.bidder_name}</p>
                  <p className="text-xs text-slate-400">{new Date(bid.placed_at).toLocaleString()}</p>
                </div>
                <p className="font-black text-slate-900">{formatPrice(bid.amount)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
