import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { fetchDataset } from "../services/api";

const filters = ["", "Pure Bengali", "Code Mixed", "Formal Bengali"];

export default function DatasetPage() {
  const [cluster, setCluster] = useState("");
  const [data, setData] = useState({ items: [], available_clusters: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDataset = async () => {
      try {
        const dataset = await fetchDataset(cluster);
        setData(dataset);
      } catch {
        setError("Unable to load the dataset explorer.");
      }
    };

    loadDataset();
  }, [cluster]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dataset Explorer"
        title="Browse the phrase bank behind the analyzer"
        description="This page makes the project feel like a research tool. Browse the stored phrases, inspect their cluster assignments, and review quick code-mixing statistics."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Visible Rows" value={data.items.length} helper="Current rows after cluster filtering." />
        <StatCard label="Clusters" value={data.available_clusters.length || 3} helper="Available dataset groups." />
        <StatCard label="View" value={cluster || "All"} helper="Current dataset filter." />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Dataset Samples</p>
          <select
            value={cluster}
            onChange={(event) => setCluster(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
          >
            {filters.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All clusters"}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-3 py-3">Text</th>
                <th className="px-3 py-3">Cluster</th>
                <th className="px-3 py-3">Bengali %</th>
                <th className="px-3 py-3">English %</th>
                <th className="px-3 py-3">CMI</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={`${item.text}-${item.cluster}`} className="border-b border-white/5 align-top">
                  <td className="px-3 py-3">{item.text}</td>
                  <td className="px-3 py-3">{item.cluster}</td>
                  <td className="px-3 py-3">{item.code_mixing.bengali_percent}</td>
                  <td className="px-3 py-3">{item.code_mixing.english_percent}</td>
                  <td className="px-3 py-3">{item.code_mixing.cmi_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </section>
    </div>
  );
}
