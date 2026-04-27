import { useEffect, useState } from "react";

// ─── mock API – replace with your real import ─────────────────────────────────
async function fetchDataset(cluster) {
  await new Promise((r) => setTimeout(r, 600));
  const all = [
    { text: "ami valo achi, how are you?",  cluster: "Code Mixed",    code_mixing: { bengali_percent: 48, english_percent: 38, cmi_score: 0.71 } },
    { text: "আমি ভালো আছি।",               cluster: "Pure Bengali",  code_mixing: { bengali_percent: 100, english_percent: 0, cmi_score: 0.00 } },
    { text: "apni ki bhalo achen?",          cluster: "Code Mixed",    code_mixing: { bengali_percent: 62, english_percent: 22, cmi_score: 0.58 } },
    { text: "আপনি কি ভালো আছেন?",           cluster: "Formal Bengali",code_mixing: { bengali_percent: 100, english_percent: 0, cmi_score: 0.00 } },
    { text: "ki korcho ekhon bro?",          cluster: "Code Mixed",    code_mixing: { bengali_percent: 54, english_percent: 34, cmi_score: 0.63 } },
    { text: "amar khabar khawa hoyni abhi",  cluster: "Code Mixed",    code_mixing: { bengali_percent: 71, english_percent: 18, cmi_score: 0.44 } },
    { text: "আজকে অনেক ব্যস্ত ছিলাম।",      cluster: "Formal Bengali",code_mixing: { bengali_percent: 100, english_percent: 0, cmi_score: 0.00 } },
    { text: "office theke just esheci",      cluster: "Code Mixed",    code_mixing: { bengali_percent: 44, english_percent: 42, cmi_score: 0.79 } },
  ];
  return {
    items: cluster ? all.filter((r) => r.cluster === cluster) : all,
    available_clusters: ["Pure Bengali", "Code Mixed", "Formal Bengali"],
  };
}

// ─── cluster badge colors ─────────────────────────────────────────────────────
const CLUSTER_COLOR = {
  "Pure Bengali":   { text: "#3ECFB2", bg: "rgba(62,207,178,0.1)",  border: "rgba(62,207,178,0.22)" },
  "Code Mixed":     { text: "#6AACF5", bg: "rgba(106,172,245,0.1)", border: "rgba(106,172,245,0.22)" },
  "Formal Bengali": { text: "#B57BFF", bg: "rgba(181,123,255,0.1)", border: "rgba(181,123,255,0.22)" },
};

// ─── CMI score bar ────────────────────────────────────────────────────────────
function CmiBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct <= 20 ? "#3ECFB2" : pct <= 55 ? "#F5A623" : "#F06FA4";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{
          width: `${pct}%`, height: 4, borderRadius: 2, background: color,
          transition: "width 0.7s cubic-bezier(.22,.68,0,1.2)",
        }} />
      </div>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, color, minWidth: 30, textAlign: "right",
      }}>{value.toFixed(2)}</span>
    </div>
  );
}

// ─── Pct cell ─────────────────────────────────────────────────────────────────
function PctCell({ value, color }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12, color: value === 0 ? "rgba(255,255,255,0.2)" : color,
    }}>{value}<span style={{ fontSize: 10, opacity: 0.6 }}>%</span></span>
  );
}

// ─── stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, helper, delay = 0 }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18, padding: "18px 20px",
      animation: "dsFadeUp 0.45s ease both",
      animationDelay: `${delay}ms`,
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
      }}>{label}</span>
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
        color: "#fff", margin: "6px 0 4px",
      }}>{value}</p>
      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.32)", lineHeight: 1.5 }}>{helper}</p>
    </div>
  );
}

// ─── filter pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, value, active, onClick }) {
  const cfg = CLUSTER_COLOR[value] ?? null;
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 99,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10, letterSpacing: "0.14em",
      textTransform: "uppercase",
      border: `1px solid ${active ? (cfg?.border ?? "rgba(255,255,255,0.35)") : "rgba(255,255,255,0.08)"}`,
      background: active ? (cfg?.bg ?? "rgba(255,255,255,0.07)") : "transparent",
      color: active ? (cfg?.text ?? "#fff") : "rgba(255,255,255,0.35)",
      cursor: "pointer",
      transition: "all 0.18s",
      whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const FILTERS = ["", "Pure Bengali", "Code Mixed", "Formal Bengali"];

export default function DatasetPage() {
  const [cluster, setCluster] = useState("");
  const [data, setData] = useState({ items: [], available_clusters: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchDataset(cluster)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Unable to load the dataset explorer."); setLoading(false); });
  }, [cluster]);

  const stats = [
    { label: "Visible Rows", value: data.items.length,                   helper: "Rows after cluster filter" },
    { label: "Clusters",     value: data.available_clusters.length || 3, helper: "Available dataset groups"  },
    { label: "Active Filter",value: cluster || "All",                    helper: "Current filter selection"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes dsFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dsPulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes dsShimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }

        .ds-root * { box-sizing: border-box; }
        .ds-root {
          font-family: 'Syne', sans-serif;
          color: #fff;
          display: flex; flex-direction: column; gap: 28px;
        }

        .ds-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.24em;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
          animation: dsFadeUp 0.35s ease both;
        }
        .ds-title {
          font-size: clamp(24px, 3.5vw, 40px);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
          background: linear-gradient(135deg, #fff 50%, rgba(255,255,255,0.45));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 10px;
          animation: dsFadeUp 0.4s ease both 0.04s;
        }
        .ds-desc {
          font-size: 13.5px; color: rgba(255,255,255,0.38);
          max-width: 580px; line-height: 1.7;
          animation: dsFadeUp 0.4s ease both 0.08s;
        }
        .ds-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
        }

        .ds-stats {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
        }
        @media (max-width: 640px) { .ds-stats { grid-template-columns: 1fr; } }

        /* table panel */
        .ds-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 22px;
          animation: dsFadeUp 0.45s ease both 0.12s;
          position: relative; overflow: hidden;
        }
        .ds-panel::before {
          content: '';
          position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(106,172,245,0.35), transparent);
        }

        /* filter bar */
        .ds-filter-bar {
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          flex-wrap: wrap; margin-bottom: 20px;
        }
        .ds-filter-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(255,255,255,0.28);
        }
        .ds-filter-pills {
          display: flex; flex-wrap: wrap; gap: 6px;
        }

        /* count badge */
        .ds-count-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.16em;
          color: rgba(255,255,255,0.25);
          padding: 4px 10px; border-radius: 99px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }

        /* table */
        .ds-table-wrap {
          overflow-x: auto;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .ds-table {
          width: 100%; border-collapse: collapse; min-width: 580px;
        }
        .ds-table thead tr {
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ds-table th {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.28);
          padding: 12px 16px; text-align: left; font-weight: 500;
          background: rgba(0,0,0,0.2);
          white-space: nowrap;
        }
        .ds-table th:first-child { border-radius: 14px 0 0 0; }
        .ds-table th:last-child  { border-radius: 0 14px 0 0; }

        .ds-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .ds-table tbody tr:last-child { border-bottom: none; }
        .ds-table tbody tr.hovered {
          background: rgba(255,255,255,0.025);
        }
        .ds-table td {
          padding: 13px 16px; font-size: 13px;
          color: rgba(255,255,255,0.75);
          vertical-align: middle;
        }
        .ds-table td.text-col {
          font-family: 'Syne', sans-serif;
          font-size: 13.5px; color: rgba(255,255,255,0.88);
          max-width: 240px;
        }

        /* cluster badge */
        .cluster-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.12em;
          white-space: nowrap;
        }
        .cluster-dot {
          width: 5px; height: 5px; border-radius: 50; flex-shrink: 0;
        }

        /* skeleton */
        .ds-skeleton {
          height: 44px; border-radius: 8px;
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 0%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 100%);
          background-size: 600px 100%;
          animation: dsShimmer 1.4s infinite;
          margin-bottom: 6px;
        }

        /* error */
        .ds-error {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          color: #F06FA4; padding: 10px 14px; margin-top: 16px;
          background: rgba(240,111,164,0.07);
          border: 1px solid rgba(240,111,164,0.18); border-radius: 10px;
        }

        /* empty */
        .ds-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 48px 20px; text-align: center;
        }
      `}</style>

      <div className="ds-root">
        {/* ── Header ── */}
        <div>
          <p className="ds-eyebrow">Dataset Explorer</p>
          <h1 className="ds-title">Browse the phrase bank<br />behind the analyzer.</h1>
          <p className="ds-desc">
            Browse stored phrases, inspect cluster assignments, and review quick code-mixing statistics — the research layer of the project.
          </p>
        </div>

        <div className="ds-divider" />

        {/* ── Stats ── */}
        <div className="ds-stats">
          {stats.map((s, i) => <StatTile key={s.label} {...s} delay={i * 55} />)}
        </div>

        {/* ── Table panel ── */}
        <div className="ds-panel">
          {/* filter bar */}
          <div className="ds-filter-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="ds-filter-label">Filter by cluster</span>
              <span className="ds-count-badge">{data.items.length} rows</span>
            </div>
            <div className="ds-filter-pills">
              {FILTERS.map((f) => (
                <FilterPill
                  key={f || "all"}
                  label={f || "All"}
                  value={f}
                  active={cluster === f}
                  onClick={() => setCluster(f)}
                />
              ))}
            </div>
          </div>

          {/* table */}
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Text</th>
                  <th>Cluster</th>
                  <th>Bengali</th>
                  <th>English</th>
                  <th style={{ minWidth: 140 }}>CMI Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} style={{ padding: "6px 16px" }}>
                        <div className="ds-skeleton" style={{ opacity: 1 - i * 0.15 }} />
                      </td>
                    </tr>
                  ))
                ) : data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="ds-empty">
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, color: "rgba(255,255,255,0.15)",
                        }}>⊟</div>
                        <p style={{
                          fontSize: 12, color: "rgba(255,255,255,0.22)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>No entries in this cluster.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.items.map((item, i) => {
                    const cfg = CLUSTER_COLOR[item.cluster] ?? { text: "#888", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" };
                    return (
                      <tr
                        key={`${item.text}-${i}`}
                        className={hovered === i ? "hovered" : ""}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{ animation: `dsFadeUp 0.4s ease both`, animationDelay: `${i * 40}ms` }}
                      >
                        <td>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10, color: "rgba(255,255,255,0.2)",
                          }}>{String(i + 1).padStart(2, "0")}</span>
                        </td>
                        <td className="text-col">{item.text}</td>
                        <td>
                          <span className="cluster-badge" style={{
                            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text,
                          }}>
                            <span className="cluster-dot" style={{ background: cfg.text }} />
                            {item.cluster}
                          </span>
                        </td>
                        <td><PctCell value={item.code_mixing.bengali_percent} color="#3ECFB2" /></td>
                        <td><PctCell value={item.code_mixing.english_percent} color="#6AACF5" /></td>
                        <td><CmiBar value={item.code_mixing.cmi_score} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {error && <p className="ds-error">{error}</p>}
        </div>
      </div>
    </>
  );
}