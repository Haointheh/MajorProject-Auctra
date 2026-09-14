// Connect to backend /ws/auctions/{auction_id} room — no auth required
// (websocket_routes.py: "No auth check here — anyone can watch"), guest users all
//
// Two message shapes come over this same connection:
//   - Bid broadcast (bidding_routes.py):     { bidder_first_name, amount, auction_id }
//   - Status/countdown (countdown_job.py):   { type: "status_changed" | "countdown", ... }
// Bid broadcasts have no "type" key, so that's how we tell them apart.

import { useEffect, useRef } from "react";
import { BASE_URL } from "../api/client";

const WS_BASE_URL = BASE_URL.replace(/^http/, "ws");

export default function useAuctionRoomSocket(auctionId, { onBid, onStatusChange } = {}) {
  // Refs so the effect below doesn't need onBid/onStatusChange in its
  // dependency array — those are typically new inline functions every
  // render, which would otherwise reconnect the socket constantly.
  const onBidRef = useRef(onBid);
  const onStatusChangeRef = useRef(onStatusChange);
  onBidRef.current = onBid;
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (!auctionId) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/auctions/${auctionId}`);

    ws.onopen = () => {
      console.log(`[auction room] connected — auction ${auctionId}`);
    };

    ws.onerror = (event) => {
      // Fires if the route doesn't exist, the server rejects the upgrade,
      // or the connection is refused outright — the browser doesn't give
      // much detail here, but at minimum this makes the failure visible
      // instead of silently doing nothing (previously the only symptom
      // was "live updates don't show up until you refresh").
      console.error(`[auction room] connection error — auction ${auctionId}`, event);
    };

    ws.onclose = (event) => {
      console.log(`[auction room] closed — auction ${auctionId} (code ${event.code}${event.reason ? `: ${event.reason}` : ""})`);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === "status_changed") {
        onStatusChangeRef.current?.(data.new_status);
      } else if (data.type === "countdown") {
        // The page already computes its own live countdown from end_time
        // (see useCountdown) — nothing to do with the server's tick here.
      } else if (typeof data.amount === "number") {
        // ── TEST INSTRUMENTATION — remove this whole if block once done ──
        // Backend stamps broadcast_at as a naive UTC isoformat() string
        // (no "Z"/offset) — same ambiguity flagged earlier for bid
        // timestamps. Appending "Z" here forces correct UTC parsing for
        // this measurement specifically, same workaround as before.
        if (data.broadcast_at) {
          const latencyMs = Date.now() - new Date(data.broadcast_at + "Z").getTime();
          console.log(`[auction room] bid update received — ${latencyMs}ms after broadcast`);
        }
        // .... END TEST INSTRUMENTATION ...........................
        onBidRef.current?.(data);
      }
    };

    return () => ws.close();
  }, [auctionId]);
}