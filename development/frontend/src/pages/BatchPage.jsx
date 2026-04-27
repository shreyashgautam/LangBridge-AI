import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { batchAnalyzeFile, batchAnalyzeTexts, downloadBatchResults } from "../services/api";

const starterBatch = `ami valo achi
I am fine bro
valo lagche movie ta
ei prostabti bishesh vabe guruttopurno
weekend e amra cafe e hangout korbo`;

export default function BatchPage() {
  const [manualText, setManualText] = useState(starterBatch);
  const [fileName, setFileName] = useState("");
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputTexts = useMemo(
    () =>
      manualText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [manualText],
  );

  const handleManualAnalyze = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await batchAnalyzeTexts(inputTexts);
      setBatchResult(data);
      setFileName("");
    } catch (e) {
      setError(e.response?.data?.detail || "Batch failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      const data = await batchAnalyzeFile(file);
      setBatchResult(data);
      setFileName(file.name);
    } catch (e) {
      setError(e.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadBatchResults(
        batchResult?.results?.map((r) => r.sentence) || inputTexts,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "batch-results.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed.");
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <PageHeader
        eyebrow="Batch Analyzer"
        title="Analyze large text batches instantly"
        description="Upload or paste multiple sentences to analyze clusters, similarity, and code-mixing patterns at scale."
      />

      {/* ── Stat row ── */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Input Lines" value={inputTexts.length} helper="Manual entries" />
        <StatCard label="Limit" value="100" helper="Max per batch" />
        <StatCard label="Export" value="CSV" helper="Download results" />
      </section>

      {/* ── Main grid ── */}
      <section className="grid gap-8 xl:grid-cols-[1fr,1.1fr]">

        {/* INPUT PANEL */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">

          <label className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Manual Input
          </label>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={12}
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 font-mono text-sm text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Enter one sentence per line…"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleManualAnalyze}
              disabled={loading}
              className="rounded-full bg-sky-400 px-6 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600 disabled:text-slate-400"
            >
              {loading ? "Processing…" : "Analyze"}
            </button>

            <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:border-sky-400 hover:text-white">
              Upload File
              <input type="file" accept=".txt,.csv" hidden onChange={handleFileUpload} />
            </label>

            <button
              onClick={handleDownload}
              disabled={!batchResult}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:border-sky-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export CSV
            </button>
          </div>

          {fileName ? (
            <p className="mt-4 text-xs text-sky-200">Uploaded: {fileName}</p>
          ) : null}

          {error ? (
            <p className="mt-4 text-xs text-rose-300">{error}</p>
          ) : null}
        </div>

        {/* RESULTS PANEL */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">

          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Results</p>
            {batchResult ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Avg {(batchResult.summary.average_similarity * 100).toFixed(1)}% sim
              </span>
            ) : null}
          </div>

          {batchResult?.results?.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="w-[44%] pb-3 text-left text-xs font-normal uppercase tracking-[0.2em] text-slate-400">
                      Sentence
                    </th>
                    <th className="w-[20%] pb-3 text-left text-xs font-normal uppercase tracking-[0.2em] text-slate-400">
                      Cluster
                    </th>
                    <th className="w-[18%] pb-3 text-left text-xs font-normal uppercase tracking-[0.2em] text-slate-400">
                      Sim
                    </th>
                    <th className="w-[18%] pb-3 text-left text-xs font-normal uppercase tracking-[0.2em] text-slate-400">
                      CMI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batchResult.results.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="truncate py-3 pr-3 text-slate-200">
                        {row.sentence}
                      </td>
                      <td className="py-3">
                        <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-0.5 text-xs text-sky-200">
                          {row.cluster}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {(row.similarity_score * 100).toFixed(1)}%
                      </td>
                      <td className="py-3">
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-0.5 text-xs text-amber-300">
                          {row.code_mixing_index}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-slate-950/40 py-16 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-500">
                  <rect x="2" y="2" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.5"/>
                  <rect x="2" y="5.5" width="9" height="1.5" rx="0.75" fill="currentColor" opacity="0.35"/>
                  <rect x="2" y="9" width="10.5" height="1.5" rx="0.75" fill="currentColor" opacity="0.35"/>
                  <rect x="2" y="12.5" width="7" height="1.5" rx="0.75" fill="currentColor" opacity="0.2"/>
                </svg>
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-600">No results yet</p>
              <p className="mt-2 text-xs text-slate-700">Run an analysis to see output here.</p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}