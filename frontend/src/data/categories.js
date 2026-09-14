// Single source of truth for the platform's auction categories. Previously
// this same 5-slug list was hand-typed separately in Navbar.jsx,
// BrowseCategoriesPage.jsx, and data/mockAuctions.js (as CATEGORY_META),
// each with a slightly different shape — easy to drift out of sync when a
// category gets added, renamed, or its copy changes. Every consumer should
// import from here instead of defining its own list.
//
// CATEGORIES: ordered array — use this anywhere you're rendering a list
//   (nav links, filter pills, browse-page cards).
// CATEGORY_MAP: slug -> category object — use this anywhere you're looking
//   up a single category by its route param (e.g. CategoryPage.jsx).

import art from "../assets/art.jpg";
import fashion from "../assets/fashion.jpg";
import jewellery from "../assets/jewellery.jpg";
import antiques from "../assets/antiques.jpg";
import handicraft from "../assets/handicraft.jpg";

export const CATEGORIES = [
  {
    slug: "art",
    label: "Art",
    description: "Original paintings, prints, sculptures and mixed-media works from emerging and established artists.",
    imageUrl: art,
    tag: "Hot"
  },
  {
    slug: "fashion",
    label: "Fashion",
    description: "Rare designer pieces, vintage couture and limited-edition accessories from around the world.",
    imageUrl: fashion,
    tag: null
  },
  {
    slug: "jewellery",
    label: "Jewellery",
    description: "Certified fine jewellery, estate pieces, and gemstone collections with verified provenance.",
    imageUrl: jewellery,
    tag: "new"
  },
  {
    slug: "antiques",
    label: "Antiques",
    description: "Authenticated antiques spanning furniture, ceramics, silverware and historical artefacts.",
    imageUrl: antiques, tag:null
  },
  {
    slug: "handicrafts",
    label: "Handicrafts",
    description: "Handmade crafts, artisanal goods, and traditional works celebrating cultural heritage.",
    imageUrl: handicraft,
    tag: null
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
