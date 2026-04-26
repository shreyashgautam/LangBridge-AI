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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Core Analyzer"
        title="A cleaner, stronger workspace for Bengali-English dialect analysis"
        description="Run the MuRIL-based analysis pipeline, inspect cluster confidence, review cleaned text, and compare two sentences with a hybrid similarity score that behaves much better on noisy romanized inputs."
        actions={
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Backend Status</p>
            <p className="mt-2 text-lg font-medium text-white">{health?.status || "checking..."}</p>
            <p className="text-sm text-slate-400">Mode: {health?.model_mode || "unknown"}</p>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Analyzer Mode" value={health?.model_mode || "..." } helper="Uses your PyTorch model when present." />
        <StatCard label="Sample Inputs" value={samples.length || 0} helper="Quick-start examples loaded from the API." />
        <StatCard label="Feature Stack" value="9 pages" helper="Analysis, search, conversion, correction, and more." />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <label className="text-sm uppercase tracking-[0.24em] text-slate-400">Input Text</label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="7"
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Type code-mixed Bengali-English text here..."
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            {samples.map((sample) => (
              <button
                key={sample}
                onClick={() => setText(sample)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400 hover:text-white"
              >
                {sample}
              </button>
            ))}
          </div>
          {result?.language_mix_label ? (
            <p className="mt-4 text-sm text-sky-200">Language mix: {result.language_mix_label}</p>
          ) : null}
          {liveSuggestions.length ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Live Suggestions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {liveSuggestions.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => setText(item.text)}
                    className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-300/20"
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-400/18 via-white/5 to-amber-300/10 p-6 shadow-panel">
          <p className="text-sm uppercase tracking-[0.26em] text-sky-100">What improved</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
            <p>Real checkpoint-based embeddings instead of only a fallback path.</p>
            <p>Hybrid similarity that combines embedding, token, and character signals.</p>
            <p>Cleaner layout and dedicated pages for visuals, analytics, batch work, and suggestions.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr]">
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
