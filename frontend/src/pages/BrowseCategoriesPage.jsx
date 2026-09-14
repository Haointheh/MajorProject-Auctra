// Navbar's "Browse All" (desktop + mobile subnav), and the
// homepage hero's "Browse Auctions" button. Clicking a card goes straight
// to the existing category page (/auctions/:slug) already wired up in
// data/categories.js / CategoryPage.
//
// Category data (slug, label, description, image) comes from
// data/categories.js — the single source of truth shared with Navbar.jsx,
// CategoryPage.jsx, and LiveAuctionsPage.jsx, instead of a local copy.

import { useNavigate } from "react-router-dom";
import PageHeader from "../ui/PageHeader";
import CardType2 from "../ui/CardType2";
import { CATEGORIES } from "../data/categories";

export default function BrowseCategoriesPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-neutral1">
      <PageHeader
        eyebrow="Auctra"
        title="Browse All Categories"
        subtitle="Pick a category to see everything currently up for auction."
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <CardType2
              key={cat.slug}
              title={cat.label}
              tag={cat.tag}
              description={cat.description}
              imageUrl={cat.imageUrl}
              onClick={() => navigate(`/auctions/${cat.slug}`)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}