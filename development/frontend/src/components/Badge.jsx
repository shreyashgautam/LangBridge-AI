const badgeStyles = {
  "Pure Bengali": "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  "Code Mixed": "bg-sky-500/15 text-sky-200 ring-sky-400/30",
  "Formal Bengali": "bg-amber-500/15 text-amber-200 ring-amber-400/30",
};

export default function Badge({ label }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${
        badgeStyles[label] || "bg-slate-700/60 text-slate-100 ring-white/10"
      }`}
    >
      {label}
    </span>
  );
}
