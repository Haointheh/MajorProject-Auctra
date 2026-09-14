// Reusable pill-style filter row. Same visual pattern CategoryPage.jsx
// already used for its All/Live/Upcoming status filter — generalized here
// to take arbitrary {value, label} options, so it works for status,
// category, or anything else with a single active selection.
//
// Usage:
//   <FilterPills
//     options={[{ value: "all", label: "All Categories" }, ...]}
//     active={activeCategory}
//     onChange={setActiveCategory}
//   />

export default function FilterPills({ options, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-sm font-semibold border transition-colors ${
            active === opt.value
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
