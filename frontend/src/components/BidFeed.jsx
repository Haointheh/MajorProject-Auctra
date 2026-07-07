// src/components/auction/BidFeed.jsx
// Single bid table used by all roles. Role prop controls what each sees.
// Reused in: AuctionDetailPage, SellerAuctionPage, AdminAuctionPage
//
// ROLE_CONFIG controls three things per role:
//   showFullName   — seller/admin see real names; guest/buyer see masked
//   showFraudFlag  — admin only, adds Risk column with fraud score
//   showYouBadge   — buyer only, highlights their own bids in blue
//
// When backend WebSocket is ready, add the useEffect block at the bottom.
// The auto-scroll ref already handles new bids appearing.

import { useEffect, useRef } from "react";
import { formatPrice } from "../../data/mockAuctions";
import Avatar from "../../ui/Avatar";
import EmptyState from "../../ui/EmptyState";

const ROLE_CONFIG = {
  guest:  { showFullName: false, showFraudFlag: false, showYouBadge: false },
  buyer:  { showFullName: false, showFraudFlag: false, showYouBadge: true  },
  seller: { showFullName: true,  showFraudFlag: false, showYouBadge: false },
  admin:  { showFullName: true,  showFraudFlag: true,  showYouBadge: false },
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5">#1</span>;
  if (rank === 2) return <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5">#2</span>;
  if (rank === 3) return <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5">#3</span>;
  return <span className="text-[10px] text-slate-300 px-1.5 py-0.5">#{rank}</span>;
}

function FraudBadge({ score }) {
  if (!score || score < 40) return null;
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 ml-1 ${score >= 70 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
      {score >= 70 ? "⚠ HIGH" : "⚠ FLAG"}
    </span>
  );
}

export default function BidFeed({
  auctionId,
  bids = [],
  isLive = false,
  role = "guest",
  currentUserId = null,
  maxRows,
}) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.guest;
  const bottomRef = useRef(null);
  const display = maxRows ? bids.slice(0, maxRows) : bids;
  const hidden  = maxRows ? Math.max(0, bids.length - maxRows) : 0;

  useEffect(() => {
    if (isLive) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bids.length, isLive]);

  // ── WebSocket (wire in when backend ready) ────────────────────────────────
  // useEffect(() => {
  //   if (!isLive) return;
  //   const ws = new WebSocket(`ws://localhost:8000/auctions/${auctionId}/ws`);
  //   ws.onmessage = (e) => onNewBid(JSON.parse(e.data));
  //   return () => ws.close();
  // }, [auctionId, isLive]);

  return (
    <div className="bg-white border border-slate-100 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            {isLive ? "Live Bid Activity" : "Bid History"}
          </span>
          {(role === "seller" || role === "admin") && (
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 uppercase tracking-wider">
              {role} view
            </span>
          )}
        </div>
        {bids.length > 0 && (
          <span className="text-xs text-slate-400">{bids.length} bid{bids.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Empty */}
      {bids.length === 0 ? (
        <EmptyState
          title={isLive ? "No bids yet — auction is live." : "No bids placed."}
          subtitle={role === "buyer" ? "Be the first to place a bid." : undefined}
        />
      ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12">Rank</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bidder</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                {config.showFraudFlag && (
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold text-rose-400 uppercase tracking-widest">Risk</th>
                )}
              </tr>
            </thead>
            <tbody>
              {display.map((bid, i) => {
                const isLeader = i === 0;
                const isOwn    = config.showYouBadge && bid.bidder_id === currentUserId;
                const name     = config.showFullName ? bid.bidder_name : (bid.masked_name ?? bid.bidder_name);
                return (
                  <tr key={bid.id} className={`border-b border-slate-50 transition-colors ${isOwn ? "bg-blue-50/60" : isLeader ? "bg-amber-50/40" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3"><RankBadge rank={i + 1} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar name={bid.bidder_name} size="xs" />
                        <span className={`font-medium ${isLeader ? "text-slate-900" : "text-slate-600"}`}>{name}</span>
                        {isOwn && <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5">You</span>}
                        {config.showFraudFlag && <FraudBadge score={bid.fraud_score} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-black tabular-nums ${isLeader ? "text-slate-900 text-base" : "text-slate-700"}`}>
                        {formatPrice(bid.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs tabular-nums whitespace-nowrap">
                      {timeAgo(bid.placed_at)}
                    </td>
                    {config.showFraudFlag && (
                      <td className="px-4 py-3 text-right text-xs tabular-nums">
                        {bid.fraud_score != null
                          ? <span className={`font-bold ${bid.fraud_score >= 70 ? "text-rose-600" : bid.fraud_score >= 40 ? "text-amber-600" : "text-emerald-600"}`}>{bid.fraud_score}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div ref={bottomRef} />
        </div>
      )}

      {hidden > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400 text-center">
          {hidden} more bid{hidden !== 1 ? "s" : ""} not shown
        </div>
      )}
    </div>
  );
}