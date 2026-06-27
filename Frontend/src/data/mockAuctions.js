// mockAuctions.js is your temporary data layer. Every auction has the same shape as your FastAPI AuctionResponse schema, so swapping it for real API calls later is straightforward — just replace the getAuctionsByCategory and getAuctionById functions with axios.get() calls.

// src/data/mockAuctions.js
// ─────────────────────────────────────────────────────────────────────────────
// Temporary mock data. Replace with real API calls when backend is ready.
// Shape mirrors the AuctionResponse schema from FastAPI.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_META = {
  art: {
    label: "Art",
    description: "Original paintings, prints, sculptures and mixed-media works from emerging and established artists.",
  },
  fashion: {
    label: "Fashion",
    description: "Rare designer pieces, vintage couture and limited-edition accessories from around the world.",
  },
  jewellery: {
    label: "Jewellery",
    description: "Certified fine jewellery, estate pieces, and gemstone collections with verified provenance.",
  },
  antiques: {
    label: "Antiques",
    description: "Authenticated antiques spanning furniture, ceramics, silverware and historical artefacts.",
  },
  handicrafts: {
    label: "Handicrafts",
    description: "Handmade crafts, artisanal goods, and traditional works celebrating cultural heritage.",
  },
};

// Status helpers
// "live"      → auction is running right now
// "scheduled" → auction hasn't started yet
// "ended"     → auction is over

export const MOCK_AUCTIONS = [
  // ── ART ──────────────────────────────────────────────────────────────────
  {
    id: "a1",
    category: "art",
    title: "Monsoon Abstraction No. 7",
    seller: { name: "Priya Thapa Studio" },
    description:
      "A large-format acrylic on canvas exploring the interplay of monsoon light and shadow over the Kathmandu Valley. Signed and dated on reverse. Certificate of authenticity included.",
    condition: "excellent",
    base_price: 45000,
    current_bid: 62000,
    bid_count: 14,
    status: "live",
    end_time: new Date(Date.now() + 1000 * 60 * 47 + 1000 * 23).toISOString(), // ~47 min
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800" }],
    is_ai_verified: true,
  },
  {
    id: "a2",
    category: "art",
    title: "Portrait in Indigo",
    seller: { name: "Gallery Mandala" },
    description:
      "Oil on linen portrait rendered in a restricted indigo palette. Part of a series exploring identity and displacement. Framed in raw oak.",
    condition: "excellent",
    base_price: 28000,
    current_bid: 28000,
    bid_count: 0,
    status: "scheduled",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800" }],
    is_ai_verified: false,
  },
  {
    id: "a3",
    category: "art",
    title: "Terracotta Figures — Set of Three",
    seller: { name: "Bhaktapur Craft House" },
    description:
      "Hand-formed terracotta figurines representing the three aspects of Kumari. Each piece is unique, fired in a traditional wood kiln.",
    condition: "good",
    base_price: 12000,
    current_bid: 19500,
    bid_count: 9,
    status: "live",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 3 + 1000 * 60 * 12).toISOString(),
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" }],
    is_ai_verified: true,
  },

  // ── FASHION ──────────────────────────────────────────────────────────────
  {
    id: "f1",
    category: "fashion",
    title: "Vintage Hermès Silk Scarf — Jungle Love",
    seller: { name: "Archive Atelier" },
    description:
      "A pristine 1970s Hermès 90cm silk carré, pattern 'Jungle Love'. No fading, original box and tissue. Authenticated by two independent appraisers.",
    condition: "excellent",
    base_price: 35000,
    current_bid: 52000,
    bid_count: 21,
    status: "live",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 1 + 1000 * 60 * 33).toISOString(),
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1558171813-d7de0e36d8e8?w=800" }],
    is_ai_verified: true,
  },
  {
    id: "f2",
    category: "fashion",
    title: "Dhaka Weave Jacket — Limited Edition",
    seller: { name: "Handloom Nepal" },
    description:
      "A structured blazer cut from hand-loomed Dhaka fabric in a contemporary silhouette. Size M. Collaboration between a Kathmandu designer and master weavers from Tehrathum.",
    condition: "excellent",
    base_price: 8500,
    current_bid: 8500,
    bid_count: 0,
    status: "scheduled",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=800" }],
    is_ai_verified: false,
  },

  // ── JEWELLERY ─────────────────────────────────────────────────────────────
  {
    id: "j1",
    category: "jewellery",
    title: "22K Gold Filigree Choker",
    seller: { name: "Newari Goldworks" },
    description:
      "Traditional Newari filigree choker in 22-karat gold with inlaid red coral. Hallmarked and assayed. Comes with documentation of origin and craftsmanship lineage.",
    condition: "excellent",
    base_price: 120000,
    current_bid: 148000,
    bid_count: 7,
    status: "live",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800" }],
    is_ai_verified: true,
  },
  {
    id: "j2",
    category: "jewellery",
    title: "Art Deco Sapphire Ring",
    seller: { name: "Estate Finds KTM" },
    description:
      "Platinum-set Art Deco ring featuring a 2.1ct Ceylon sapphire flanked by old-cut diamonds. Circa 1928. Independently graded and certified.",
    condition: "good",
    base_price: 95000,
    current_bid: 95000,
    bid_count: 0,
    status: "scheduled",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800" }],
    is_ai_verified: false,
  },

  // ── ANTIQUES ─────────────────────────────────────────────────────────────
  {
    id: "an1",
    category: "antiques",
    title: "Rana-Era Writing Bureau",
    seller: { name: "Durbar Antiques" },
    description:
      "Teak and rosewood writing bureau from the Rana period (c.1910). Original brass fittings, lockable drawers, interior pigeonholes. Minor surface wear consistent with age.",
    condition: "fair",
    base_price: 55000,
    current_bid: 71000,
    bid_count: 5,
    status: "live",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(),
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800" }],
    is_ai_verified: true,
  },
  {
    id: "an2",
    category: "antiques",
    title: "Bronze Shakyamuni — 18th Century",
    seller: { name: "Himalayan Heritage" },
    description:
      "Cast bronze figure of Shakyamuni Buddha in dhyana mudra. Provenance traced to a monastery in Mustang. Export documentation and UNESCO compliance certificate provided.",
    condition: "good",
    base_price: 200000,
    current_bid: 200000,
    bid_count: 0,
    status: "scheduled",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=800" }],
    is_ai_verified: true,
  },

  // ── HANDICRAFTS ──────────────────────────────────────────────────────────
  {
    id: "h1",
    category: "handicrafts",
    title: "Hand-knotted Tibetan Tiger Rug",
    seller: { name: "Boudha Carpet Co." },
    description:
      "100% Tibetan highland wool, hand-knotted in a 100-knot density. Traditional tiger motif on natural dye ground. 3×5 ft. Signed by the master weaver.",
    condition: "excellent",
    base_price: 42000,
    current_bid: 58000,
    bid_count: 11,
    status: "live",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 6 + 1000 * 60 * 40).toISOString(),
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800" }],
    is_ai_verified: true,
  },
  {
    id: "h2",
    category: "handicrafts",
    title: "Papier-Mâché Mask Collection",
    seller: { name: "Indra Chowk Crafts" },
    description:
      "Set of five hand-painted papier-mâché masks representing deities from the Indra Jatra festival. Natural pigments on hand-formed base. Each mask numbered and signed.",
    condition: "excellent",
    base_price: 6000,
    current_bid: 9200,
    bid_count: 6,
    status: "live",
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString(),
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    images: [{ image_path: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800" }],
    is_ai_verified: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getAuctionsByCategory(category) {
  return MOCK_AUCTIONS.filter((a) => a.category === category.toLowerCase());
}

export function getAuctionById(id) {
  return MOCK_AUCTIONS.find((a) => a.id === id) || null;
}

export function formatPrice(amount) {
  return `NPR ${amount.toLocaleString("en-IN")}`;
}