// GET /auctions?search=... (title/description, case-insensitive — see
// routes/auction_routes.py). Click a result to go straight to its auction
// page; nothing is shown until at least 2 characters are typed.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { apiSearchAuctions, getImageUrl } from "../api/auctions";
import { formatPrice } from "../data/mockAuctions";

const MIN_CHARS = 1;
const DEBOUNCE_MS = 300;
const MAX_RESULTS = 6;

export default function SearchBar({ onNavigate, className = "max-w-md" }) {
  const navigate = useNavigate();
  const ref = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      apiSearchAuctions(term)
        .then((res) => setResults((res.data || []).slice(0, MAX_RESULTS)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (auction) => {
    setOpen(false);
    setQuery("");
    navigate(`/auctions/${auction.category}/${auction.id}`);
    onNavigate?.();
  };

  const term = query.trim();
  const showDropdown = open && term.length >= MIN_CHARS;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search auctions..."
          className="w-full bg-slate-50 border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              No auctions found for "{term}".
            </p>
          ) : (
            results.map((auction) => (
              <button
                key={auction.id}
                onClick={() => handleSelect(auction)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <img
                  src={getImageUrl(auction.images?.[0]?.image_path)}
                  alt={auction.title}
                  className="w-12 h-12 object-cover bg-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{auction.title}</p>
                  <p className="text-xs text-slate-400 capitalize">{auction.category}</p>
                </div>
                <p className="text-sm font-bold text-slate-700 shrink-0">
                  {formatPrice(auction.current_highest_bid ?? auction.base_price)}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
