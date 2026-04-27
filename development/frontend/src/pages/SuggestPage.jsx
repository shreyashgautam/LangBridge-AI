import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { fetchSuggestions } from "../services/api";

export default function SuggestPage() {
  const [text, setText] = useState("ami valo achi");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSuggest = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchSuggestions(text);
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to fetch suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <PageHeader
        eyebrow="Smart Suggestions"
        title="Surface phonetic alternatives with nearest-neighbor search"
        description="Enter a sentence and retrieve nearby phrases ranked by embedding similarity — great for demonstrating correction-style or recommendation-style behavior."
      />

      {/* ── Stats ── */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Suggestion Count"
          value={result?.suggestions?.length ?? 5}
          helper="Top nearest phrases returned."
        />
        <StatCard
          label="Use Case"
          value="Auto-correct"
          helper="Great for demoing practical utility."
        />
        <StatCard
          label="Ranking"
          value="Cosine NN"
          helper="Nearest-neighbor search over stored phrase embeddings."
        />
      </section>

      {/* ── Main grid ── */}
      <section className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">

        {/* INPUT PANEL */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <label className="text-xs uppercase tracking-[0.26em] text-slate-400">
            Input Phrase
          </label>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Enter a phrase to search for alternatives…"
          />

          <button
            onClick={handleSuggest}
            disabled={loading}
            className="mt-4 rounded-full bg-sky-400 px-6 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600 disabled:text-slate-400"
          >
            {loading ? "Searching…" : "Get Suggestions"}
          </button>

          {result?.cleaned_text ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Cleaned text
              </p>
              <p className="mt-2 text-sm text-sky-200">{result.cleaned_text}</p>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 text-xs text-rose-300">{error}</p>
          ) : null}
        </div>

        {/* RESULTS PANEL */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
            Suggested Alternatives
          </p>

          {result?.suggestions?.length > 0 ? (
            <div className="mt-5 space-y-3">
              {result.suggestions.map((item, index) => (
                <div
                  key={`${item.text}-${item.cluster}`}
                  className="group rounded-3xl border border-white/10 bg-slate-950/70 p-5 transition hover:border-sky-400/30 hover:bg-slate-950/90"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-slate-500">
                        {index + 1}
                      </span>
                      <p className="text-base font-medium text-white">{item.text}</p>
                    </div>
                    <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs text-sky-200">
                      {(item.similarity * 100).toFixed(1)}% similar
                    </span>
                  </div>
                  <p className="mt-3 pl-9 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {item.cluster}
                  </p>
                </div>
              ))}
            </div>
          ) : result && result.suggestions.length === 0 ? (
            <div className="mt-5 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-slate-950/40 py-16 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="4.5" stroke="#475569" strokeWidth="1.2"/>
                  <path d="M10.5 10.5L13 13" stroke="#475569" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-600">No results</p>
              <p className="mt-2 text-xs text-slate-700">
                No alternative phrases found for this input.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-slate-950/40 py-16 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="4.5" stroke="#334155" strokeWidth="1.2"/>
                  <path d="M10.5 10.5L13 13" stroke="#334155" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-600">Awaiting input</p>
              <p className="mt-2 text-xs text-slate-700">
                Enter a phrase and click Get Suggestions.
              </p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}