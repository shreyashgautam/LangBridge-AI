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
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to analyze batch input.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await batchAnalyzeFile(file);
      setBatchResult(data);
      setFileName(file.name);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to analyze uploaded file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadBatchResults(
        batchResult?.results?.map((item) => item.sentence) || inputTexts,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "batch-analysis-results.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to export the batch analysis CSV.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Batch Analyzer"
        title="Upload or paste a corpus and inspect it at scale"
        description="Use this page to process 50 to 100 sentences at once, inspect cluster assignments row by row, and export the results for your report, demo, or evaluator."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Input Lines" value={inputTexts.length} helper="Manual sentences currently queued." />
        <StatCard label="Batch Limit" value="100" helper="Backend caps each run to keep response times stable." />
        <StatCard label="Export" value="CSV" helper="Download enriched results after analysis." />
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Manual Input</p>
          <textarea
            value={manualText}
            onChange={(event) => setManualText(event.target.value)}
            rows="14"
            className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Enter one sentence per line"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleManualAnalyze}
              disabled={loading}
              className="rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600"
            >
              {loading ? "Processing..." : "Analyze Batch"}
            </button>
            <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:border-sky-400 hover:text-white">
              Upload `.txt` / `.csv`
              <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={handleDownload}
              disabled={!batchResult}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:border-sky-400 hover:text-white disabled:opacity-40"
            >
              Download CSV
            </button>
          </div>
          {fileName ? <p className="mt-4 text-sm text-sky-200">Uploaded: {fileName}</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Batch Results</p>
            {batchResult ? (
              <p className="text-sm text-slate-300">
                Avg similarity: {(batchResult.summary.average_similarity * 100).toFixed(1)}%
              </p>
            ) : null}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="px-3 py-3">Sentence</th>
                  <th className="px-3 py-3">Cluster</th>
                  <th className="px-3 py-3">Similarity</th>
                  <th className="px-3 py-3">CMI</th>
                </tr>
              </thead>
              <tbody>
                {batchResult?.results?.map((row) => (
                  <tr key={`${row.sentence}-${row.cluster}`} className="border-b border-white/5 align-top">
                    <td className="px-3 py-3">{row.sentence}</td>
                    <td className="px-3 py-3">{row.cluster}</td>
                    <td className="px-3 py-3">{(row.similarity_score * 100).toFixed(1)}%</td>
                    <td className="px-3 py-3">{row.code_mixing_index}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
