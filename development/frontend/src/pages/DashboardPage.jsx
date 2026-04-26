import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { ClusterPieChart, SimilarityBarChart } from "../components/SimpleCharts";
import StatCard from "../components/StatCard";
import { fetchDashboardMetrics } from "../services/api";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchDashboardMetrics();
        setMetrics(data);
      } catch {
        setError("Unable to load dashboard metrics.");
      }
    };

    loadMetrics();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Corpus Dashboard"
        title="Read your dialect behavior like a mini analytics suite"
        description="Cluster distribution, similarity snapshots, sentence-length statistics, and approximate code-mixing ratios all live here so you can explain the system like a product, not just a model."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Avg Length" value={metrics?.sentence_lengths?.average ?? "--"} helper="Average tokens per sentence." />
        <StatCard label="English %" value={`${metrics?.code_mixing?.english_pct ?? 0}%`} helper="Approximate romanized English proportion." />
        <StatCard label="Bengali %" value={`${metrics?.code_mixing?.bengali_pct ?? 0}%`} helper="Approximate Bengali proportion." />
        <StatCard label="Avg CMI" value={metrics?.code_mixing?.average_cmi ?? "--"} helper="Higher means more code-mixed." />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Cluster Distribution</p>
          <div className="mt-6 h-[320px]">
            {metrics ? <ClusterPieChart distribution={metrics.cluster_distribution} /> : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Similarity Snapshot</p>
          <div className="mt-6 h-[320px]">
            {metrics ? <SimilarityBarChart items={metrics.similarity_samples} /> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Min Length" value={metrics?.sentence_lengths?.min ?? "--"} helper="Shortest analyzed sentence." />
        <StatCard label="Max Length" value={metrics?.sentence_lengths?.max ?? "--"} helper="Longest analyzed sentence." />
        <StatCard label="Mixed %" value={`${metrics?.code_mixing?.mixed_pct ?? 0}%`} helper="Other mixed-script or ambiguous tokens." />
      </section>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
