export default function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-panel backdrop-blur">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
}
