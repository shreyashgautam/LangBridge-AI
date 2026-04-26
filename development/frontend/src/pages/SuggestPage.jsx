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
      <PageHeader
        eyebrow="Smart Suggestions"
        title="Use nearest-neighbor search to surface phonetic alternatives"
        description="This page shows the practical side of the model. Enter a sentence and retrieve nearby phrases ranked by embedding similarity so you can demonstrate correction-style or recommendation-style behavior."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Suggestion Count" value={result?.suggestions?.length ?? 5} helper="Top nearest phrases returned." />
        <StatCard label="Use Case" value="Auto-correct" helper="Great for demoing practical utility." />
        <StatCard label="Ranking" value="Cosine NN" helper="Nearest-neighbor search over stored phrase embeddings." />
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Input Phrase</p>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="8"
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Enter a phrase to search for alternatives"
          />
          <button
            onClick={handleSuggest}
            disabled={loading}
            className="mt-4 rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600"
          >
            {loading ? "Searching..." : "Get Suggestions"}
          </button>
          {result?.cleaned_text ? (
            <p className="mt-4 text-sm text-slate-300">Cleaned text: {result.cleaned_text}</p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Suggested Alternatives</p>
          <div className="mt-5 space-y-3">
            {(result?.suggestions || []).map((item) => (
              <div
                key={`${item.text}-${item.cluster}`}
                className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-medium text-white">{item.text}</p>
                  <p className="text-sm text-sky-200">{(item.similarity * 100).toFixed(1)}% similar</p>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.cluster}</p>
              </div>
            ))}
            {result && result.suggestions.length === 0 ? (
              <p className="text-sm text-slate-400">No alternative phrases were found for this input.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
