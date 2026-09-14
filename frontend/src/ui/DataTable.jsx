// Reusable table shell — extracted from BidFeed.jsx's original design so
// AdminUsers.jsx (and anything else) can reuse the same look without
// duplicating the sticky-header/empty-state/bordered-card markup.
//
// Deliberately does NOT own row content or column-to-data mapping — each
// caller keeps full control over what a row looks like (BidFeed's
// role-based columns, avatar, rank badges, fraud flag, "You" highlight all
// stay exactly as they were, just returned from `renderRow` instead of an
// inline .map()). This component only owns the shared visual shell:
//   - bordered card + optional header bar inside the same card
//   - sticky uppercase column header row (built from `columns`)
//   - empty state swap
//   - optional max-height scroll (BidFeed's live feed) + scroll-anchor ref
//   - optional footer (BidFeed's "N more not shown")
//
// Usage:
//   <DataTable
//     header={<div>...custom header bar...</div>}   // optional
//     columns={[{ key: "rank", label: "Rank" }, { key: "amount", label: "Amount", align: "right" }]}
//     data={bids}
//     renderRow={(bid, i) => <tr key={bid.id}>...</tr>}
//     emptyTitle="No bids placed."
//     emptySubtitle="Be the first to place a bid."
//     maxHeight="max-h-96"       // optional — omit for an unbounded table like AdminUsers
//     scrollRef={bottomRef}      // optional — auto-scroll anchor, placed after tbody
//     footer={<div>...</div>}    // optional
//   />

import EmptyState from "./EmptyState";

export default function DataTable({
  header,
  columns,
  data = [],
  renderRow,
  emptyTitle,
  emptySubtitle,
  maxHeight,
  scrollRef,
  footer,
}) {
  return (
    <div className="bg-white border border-slate-100 overflow-hidden">
      {header}

      {data.length === 0 ? (
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
      ) : (
        <div className={`overflow-x-auto ${maxHeight ? `${maxHeight} overflow-y-auto` : ""}`}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${col.className ?? "text-slate-400"} ${col.widthClassName ?? ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{data.map(renderRow)}</tbody>
          </table>
          {scrollRef && <div ref={scrollRef} />}
        </div>
      )}

      {footer}
    </div>
  );
}