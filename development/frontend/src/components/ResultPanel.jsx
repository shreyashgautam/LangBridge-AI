import Badge from "./Badge";
import MetricCard from "./MetricCard";

export default function ResultPanel({ result }) {
  if (!result) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
        Submit text to see cleaned output, cluster prediction, and nearest reference matches.
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-white">Analysis Result</h2>
        <Badge label={result.cluster} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Confidence"
          value={`${Math.round(result.confidence * 100)}%`}
          helper="Distance-derived confidence from the KMeans centroid."
        />
        <MetricCard
          label="Embedding Size"
          value={result.embedding.length}
          helper="Normalized vector length returned by the backend."
        />
        <MetricCard
          label="Backend Mode"
          value={result.backend_mode}
          helper="Uses your `.pt` model when available, otherwise a deterministic fallback."
        />
      </div>

      <div className="rounded-2xl bg-slate-950/60 p-4">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Cleaned Text</p>
        <p className="mt-3 text-base text-slate-100">{result.cleaned_text}</p>
        {result.code_mixing ? (
          <p className="mt-3 text-sm leading-6 text-sky-200">
            Code-mixing index {result.code_mixing.code_mixing_index} with{" "}
            {Math.round(result.code_mixing.english_ratio * 100)}% English and{" "}
            {Math.round(result.code_mixing.bengali_ratio * 100)}% Bengali tokens.
          </p>
        ) : null}
        {result.reason ? (
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Reason: {result.reason}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl bg-slate-950/60 p-4">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Similar Examples</p>
        <div className="mt-4 space-y-3">
          {result.similar_examples.map((item) => (
            <div
              key={`${item.text}-${item.cluster}`}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm text-white">{item.text}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.cluster}</p>
              </div>
              <p className="text-sm font-medium text-sky-200">
                Similarity {(item.score * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <details className="rounded-2xl bg-slate-950/60 p-4">
        <summary className="cursor-pointer text-sm uppercase tracking-[0.24em] text-slate-400">
          Embedding Preview
        </summary>
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-300">
          [{result.embedding.slice(0, 24).map((value) => value.toFixed(4)).join(", ")}
          {result.embedding.length > 24 ? ", ..." : ""}]
        </pre>
      </details>
    </div>
  );
}
