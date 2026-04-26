import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { correctText } from "../services/api";

export default function CorrectorPage() {
  const [text, setText] = useState("ami valo asi");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCorrect = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await correctText(text);
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to generate corrections.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phonetic Corrector"
        title="Normalize spelling variants with embedding-aware suggestions"
        description="Use your learned phonetic space as a practical spell normalizer. This page surfaces the strongest correction candidate and a ranked list of alternatives."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Use Case" value="Normalizer" helper="Turns noisy romanized text into cleaner phrasing." />
        <StatCard label="Ranking" value="Nearest Match" helper="Uses embedding similarity plus reranking." />
        <StatCard label="Output" value="Top 3" helper="Best correction plus alternatives." />
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Input Text</p>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="8"
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400"
          />
          <button
            onClick={handleCorrect}
            disabled={loading}
            className="mt-4 rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600"
          >
            {loading ? "Correcting..." : "Correct Text"}
          </button>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Correction Result</p>
          {result ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-sky-300/20 bg-sky-300/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-sky-100">Corrected</p>
                <p className="mt-2 text-2xl font-semibold text-white">{result.corrected}</p>
              </div>
              {result.suggestions.map((item) => (
                <div key={item.text} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg text-white">{item.text}</p>
                    <p className="text-sm text-sky-200">{(item.similarity * 100).toFixed(1)}%</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.cluster}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-400">Run the corrector to see the best normalized phrase.</p>
          )}
        </div>
      </section>
    </div>
  );
}
