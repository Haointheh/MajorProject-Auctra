// import React from "react";
// import Button from "./Button";
// import { formatPrice } from "../data/mockAuctions";

// export default function AuctionCardBody({ auction, onSelect }) {
//   return (
//     <div className="p-4 flex flex-col grow">
//       <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
//         {auction.title}
//       </h3>
//       <p className="text-[11px] text-slate-400 mt-1">by {auction.seller.name}</p>

//       <hr className="border-slate-100 my-3" />

//       <div className="flex items-end justify-between mt-auto">
//         <div>
//           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
//             {auction.bid_count > 0 ? "Current Bid" : "Starting Bid"}
//           </p>
//           <p className="text-base font-black text-slate-900 leading-none mt-0.5">
//             {formatPrice(auction.current_bid)}
//           </p>
//           {auction.bid_count > 0 && (
//             <p className="text-[10px] text-slate-400 mt-0.5">
//               {auction.bid_count} bid{auction.bid_count !== 1 ? "s" : ""}
//             </p>
//           )}
//         </div>

//         <Button variant="secondary" size="xs" onClick={() => onSelect(auction)}>
//           View Auction
//         </Button>
//       </div>
//     </div>
//   );
// }

//backendddd
import React from "react";
import Button from "./Button";
import { formatPrice } from "../data/mockAuctions";

export default function AuctionCardBody({ auction, onSelect }) {
  // The real API doesn't return an exact bid_count on the list endpoint, only
  // current_highest_bid. hasBids works for both real data (has_bids flag set
  // in CategoryPage) and the old mock data (bid_count > 0).
  const hasBids = auction.has_bids ?? auction.bid_count > 0;

  return (
    <div className="p-4 flex flex-col grow">
      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
        {auction.title}
      </h3>
      <p className="text-[11px] text-slate-400 mt-1">by {auction.seller.name}</p>

      <hr className="border-slate-100 my-3" />

      <div className="flex items-end justify-between mt-auto">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {hasBids ? "Current Bid" : "Starting Bid"}
          </p>
          <p className="text-base font-black text-slate-900 leading-none mt-0.5">
            {formatPrice(auction.current_bid)}
          </p>
          {auction.bid_count > 0 && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              {auction.bid_count} bid{auction.bid_count !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <Button variant="secondary" size="xs" onClick={() => onSelect(auction)}>
          View Auction
        </Button>
      </div>
    </div>
  );
}
