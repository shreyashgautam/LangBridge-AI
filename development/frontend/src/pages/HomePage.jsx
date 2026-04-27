import { useEffect, useState } from "react";
import ComparePanel from "../components/ComparePanel";
import PageHeader from "../components/PageHeader";
import ResultPanel from "../components/ResultPanel";
import StatCard from "../components/StatCard";
import { analyzeText, compareTexts, fetchHealth, fetchSamples, fetchSuggestions } from "../services/api";

export default function HomePage() {
  const [text, setText] = useState("ami valo achi bro");
  const [result, setResult] = useState(null);
  const [samples, setSamples] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [compareForm, setCompareForm] = useState({
    text1: "ami valo achi",
    text2: "I am fine bro",
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [sampleList, backendHealth] = await Promise.all([fetchSamples(), fetchHealth()]);
        setSamples(sampleList);
        setHealth(backendHealth);
      } catch {
        setError("Backend is unreachable. Start FastAPI on port 8000 and refresh.");
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!text.trim() || text.trim().length < 4) {
      setLiveSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await fetchSuggestions(text);
        setLiveSuggestions(data.suggestions.slice(0, 3));
      } catch {
        setLiveSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await analyzeText(text);
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to analyze this text right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    try {
      setCompareLoading(true);
      setError("");
      const data = await compareTexts(compareForm.text1, compareForm.text2);
      setCompareResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to compare texts right now.");
    } finally {
      setCompareLoading(false);
    }
  };

  const isHealthy = health?.status === "healthy" || health?.status === "ok";

  return (
    <div className="space-y-8">

      {/* ── Header with backend status pill ── */}
      <PageHeader
        eyebrow="Core Analyzer"
        title="Bengali-English dialect analysis workspace"
        description="Run the MuRIL-based pipeline, inspect cluster confidence, review cleaned text, and compare sentences with a hybrid similarity score tuned for noisy romanized inputs."
        actions={
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Backend Status</p>
            <div className="mt-3 flex items-center gap-2.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  isHealthy ? "bg-emerald-400" : "bg-slate-600"
                }`}
              />
              <p className="text-base font-medium text-white">
                {health?.status || "checking…"}
              </p>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Mode:{" "}
              <span className="text-slate-300">{health?.model_mode || "unknown"}</span>
            </p>
          </div>
        }
      />

      {/* ── Stat row ── */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Analyzer Mode"
          value={health?.model_mode || "…"}
          helper="Uses your PyTorch model when present."
        />
        <StatCard
          label="Sample Inputs"
          value={samples.length || 0}
          helper="Quick-start examples loaded from the API."
        />
        <StatCard
          label="Feature Stack"
          value="9 pages"
          helper="Analysis, search, conversion, correction, and more."
        />
      </section>

      {/* ── Input + Info row ── */}
      <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">

        {/* Input panel */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <label className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Input Text
          </label>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={7}
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400 placeholder:text-slate-600"
            placeholder="Type code-mixed Bengali-English text here…"
          />

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-full bg-sky-400 px-6 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600 disabled:text-slate-400"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>

            {samples.map((sample) => (
              <button
                key={sample}
                onClick={() => setText(sample)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition hover:border-sky-400/50 hover:text-white"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Language mix tag */}
          {result?.language_mix_label ? (
            <div className="mt-5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <p className="text-xs text-sky-200">
                Language mix:{" "}
                <span className="font-medium">{result.language_mix_label}</span>
              </p>
            </div>
          ) : null}

          {/* Live suggestions */}
          {liveSuggestions.length ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Live Suggestions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {liveSuggestions.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => setText(item.text)}
                    className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs text-sky-100 transition hover:bg-sky-300/20"
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Error */}
          {error ? (
            <p className="mt-4 text-xs text-rose-300">{error}</p>
          ) : null}
        </div>

        {/* Info / changelog panel */}
        <div className="flex flex-col gap-4">

          {/* Gradient highlight card */}
          <div className="flex-1 rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-400/[0.13] via-white/5 to-amber-300/[0.08] p-6 shadow-panel">
            <p className="text-xs uppercase tracking-[0.26em] text-sky-300">
              What improved
            </p>
            <div className="mt-5 space-y-5">
              {[
                {
                  title: "Real embeddings",
                  body: "Checkpoint-based embeddings instead of only a fallback path.",
                },
                {
                  title: "Hybrid similarity",
                  body: "Combines embedding, token, and character signals for better results.",
                },
                {
                  title: "Dedicated pages",
                  body: "Separate views for visuals, analytics, batch work, and suggestions.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tip card */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Quick tip</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Type at least 4 characters and live suggestions appear automatically.
              Click any suggestion to replace your current input instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Results + Compare row ── */}
      <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <ResultPanel result={result} />
        <ComparePanel
          compareForm={compareForm}
          compareResult={compareResult}
          loading={compareLoading}
          onChange={(event) =>
            setCompareForm((current) => ({
              ...current,
              [event.target.name]: event.target.value,
            }))
          }
          onSubmit={handleCompare}
        />
      </section>

    </div>
  );
}