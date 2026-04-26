export default function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-panel backdrop-blur">
      <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
}
