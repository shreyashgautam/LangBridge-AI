import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { searchDataset } from "../services/api";

const filters = ["", "Pure Bengali", "Code Mixed", "Formal Bengali"];

export default function SearchPage() {
  const [query, setQuery] = useState("valo achi");
  const [cluster, setCluster] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await searchDataset(query, cluster || null);
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to search the dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Semantic Search"
        title="Search the phrase space like a small retrieval engine"
        description="Query your learned embedding space and return the closest dataset phrases. This is the research-to-product bridge that makes the model feel like a usable search system."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Search Type" value="Semantic" helper="Ranking uses learned embeddings plus reranked similarity." />
        <StatCard label="Top Results" value={result?.results?.length ?? 5} helper="Closest matching phrases returned." />
        <StatCard label="Filter" value={cluster || "All"} helper="Limit search to a specific cluster if needed." />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1fr,220px,160px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Search phrases like valo achi"
          />
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
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </section>

      <section className="space-y-4">
        {(result?.results || []).map((item) => (
          <div key={`${item.text}-${item.cluster}`} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-medium text-white">{item.text}</p>
                <p className="mt-1 text-sm text-slate-400">{item.cluster}</p>
              </div>
              <p className="text-sm font-medium text-sky-200">{(item.similarity * 100).toFixed(1)}% match</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
