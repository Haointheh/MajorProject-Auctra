import { useParams } from "react-router-dom";

export default function CategoryPage() {
  const { slug } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-bold capitalize mb-4">
        {slug} Auctions
      </h1>

      <p className="text-slate-600">
        Browse all {slug} auctions.
      </p>

      {/* Auction Grid Goes Here */}
    </div>
  );
}