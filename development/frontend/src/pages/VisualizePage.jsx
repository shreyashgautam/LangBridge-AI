import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import ScatterPlot from "../components/ScatterPlot";
import StatCard from "../components/StatCard";
import { fetchVisualizationData } from "../services/api";

const starterTexts = `ami valo achi
movie ta honestly khub entertaining chilo bro
ei prostabti bishesh vabe guruttopurno
weekend e amra cafe e hangout korbo
ora aj school e jacche`;

export default function VisualizePage() {
  const [points, setPoints] = useState([]);
  const [method, setMethod] = useState("loading");
  const [customText, setCustomText] = useState(starterTexts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadVisualization = async (texts = []) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchVisualizationData(texts);
      setPoints(data.points);
      setMethod(data.method);
    } catch {
      setError("Unable to generate visualization data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisualization();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Embedding Map"
        title="Project your sentence embeddings into 2D space"
        description="This page turns your clusters into a research-style interactive scatter plot. It helps you show that similar phrases live close together while code-mixed and formal variants separate into visible groups."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Projection" value={method} helper="UMAP when available, TSNE otherwise." />
        <StatCard label="Points" value={points.length} helper="Current sentences shown in the scatter plot." />
        <StatCard label="View" value="Interactive" helper="Hover points to inspect the original sentence." />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <div className="h-[420px]">
            <ScatterPlot points={points} />
          </div>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Custom Corpus</p>
          <textarea
            value={customText}
            onChange={(event) => setCustomText(event.target.value)}
            rows="14"
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Enter one sentence per line"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() =>
                loadVisualization(
                  customText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                )
              }
              disabled={loading}
              className="rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600"
            >
              {loading ? "Projecting..." : "Visualize Custom Text"}
            </button>
            <button
              onClick={() => loadVisualization()}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:border-sky-400 hover:text-white"
            >
              Reset to Reference Corpus
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
