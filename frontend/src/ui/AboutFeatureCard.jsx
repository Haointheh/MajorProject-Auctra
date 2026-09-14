import React from "react";

export default function AboutFeatureCard({ title, description }) {
  return (
    <div className="border border-secondaryl bg-white p-6 relative z-10">
      <h3 className="font-bold text-primary mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600 leading-6">
        {description}
      </p>
    </div>
  );
}