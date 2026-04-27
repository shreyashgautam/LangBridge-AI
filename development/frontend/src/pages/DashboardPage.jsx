import { useEffect, useState, useRef } from "react";

// ─── Inline mock (replace with your real fetchDashboardMetrics import) ───────
async function fetchDashboardMetrics() {
  return {
    sentence_lengths: { average: 24.7, min: 6, max: 91 },
    code_mixing: {
      english_pct: 41,
      bengali_pct: 46,
      mixed_pct: 13,
      average_cmi: 0.68,
    },
    cluster_distribution: [
      { label: "Cluster A", value: 32 },
      { label: "Cluster B", value: 21 },
      { label: "Cluster C", value: 18 },
      { label: "Cluster D", value: 17 },
      { label: "Cluster E", value: 12 },
    ],
    similarity_samples: [
      { label: "S1", score: 0.91 },
      { label: "S2", score: 0.74 },
      { label: "S3", score: 0.63 },
      { label: "S4", score: 0.88 },
      { label: "S5", score: 0.55 },
      { label: "S6", score: 0.79 },
      { label: "S7", score: 0.42 },
      { label: "S8", score: 0.66 },
    ],
  };
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const PALETTE = {
  teal:   "#3ECFB2",
  blue:   "#6AACF5",
  amber:  "#F5A623",
  purple: "#B57BFF",
  pink:   "#F06FA4",
  border: "rgba(255,255,255,0.08)",
  surface:"rgba(255,255,255,0.04)",
  glass:  "rgba(255,255,255,0.06)",
};

const CLUSTER_COLORS = ["#3ECFB2","#6AACF5","#F5A623","#B57BFF","#F06FA4"];

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ to, decimals = 0, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal((to * ease).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, decimals, duration]);
  return <span>{val}</span>;
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, helper, accent, pct, delay = 0 }) {
  const numericVal = parseFloat(value);
  const showBar = pct !== undefined;
  return (
    <div
      style={{
        background: PALETTE.surface,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 20,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* corner glow */}
      <div style={{
        position:"absolute", top:-40, right:-40,
        width:100, height:100,
        background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)",
      }}>{label}</span>
      <span style={{
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: accent,
        lineHeight: 1,
        fontFamily: "'Syne', sans-serif",
      }}>
        {isNaN(numericVal) ? value : (
          <>
            <AnimatedNumber to={numericVal} decimals={String(value).includes(".") ? 1 : 0} />
            {String(value).includes("%") && <span style={{fontSize:18}}>%</span>}
          </>
        )}
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{helper}</span>
      {showBar && (
        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 10 }}>
          <div style={{
            height: 3,
            borderRadius: 2,
            background: accent,
            width: "0%",
            animation: `barGrow 1s ease both`,
            animationDelay: `${delay + 300}ms`,
            "--target-width": `${pct}%`,
          }} />
        </div>
      )}
    </div>
  );
}

// ─── Donut chart (pure SVG, no lib needed) ────────────────────────────────────
function DonutChart({ distribution }) {
  if (!distribution?.length) return null;
  const total = distribution.reduce((s, d) => s + d.value, 0);
  const cx = 100, cy = 100, r = 72, thickness = 26;
  let cumAngle = -Math.PI / 2;
  const slices = distribution.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const ir = r - thickness;
    const ix1 = cx + ir * Math.cos(cumAngle);
    const iy1 = cy + ir * Math.sin(cumAngle);
    const ix2 = cx + ir * Math.cos(cumAngle - angle);
    const iy2 = cy + ir * Math.sin(cumAngle - angle);
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    return { path, color: CLUSTER_COLORS[i], ...d };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg viewBox="0 0 200 200" width={160} height={160} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.9}
            style={{ transition: "opacity 0.2s" }}
            onMouseEnter={e => e.target.setAttribute("opacity","1")}
            onMouseLeave={e => e.target.setAttribute("opacity","0.9")}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={22} fontWeight={800} fontFamily="'Syne',sans-serif">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10} fontFamily="'JetBrains Mono',monospace">TOTAL</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily:"'JetBrains Mono',monospace", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily:"'Syne',sans-serif" }}>{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Similarity bar chart (pure SVG) ─────────────────────────────────────────
function SimilarityChart({ items }) {
  if (!items?.length) return null;
  const h = 160, barW = 26, gap = 10;
  const totalW = items.length * (barW + gap) - gap;
  return (
    <svg viewBox={`0 0 ${totalW + 20} ${h + 30}`} width="100%" height={h + 30}
      style={{ overflow: "visible" }}>
      {items.map((item, i) => {
        const barH = item.score * h;
        const x = 10 + i * (barW + gap);
        const y = h - barH;
        const color = item.score >= 0.8 ? PALETTE.teal : item.score >= 0.6 ? PALETTE.blue : PALETTE.amber;
        return (
          <g key={i}>
            <rect x={x} y={0} width={barW} height={h} rx={6}
              fill="rgba(255,255,255,0.04)" />
            <rect x={x} y={y} width={barW} height={barH} rx={6}
              fill={color} opacity={0.85}
              style={{
                transformOrigin: `${x + barW/2}px ${h}px`,
                animation: `barRise 0.7s cubic-bezier(.22,.68,0,1.2) both`,
                animationDelay: `${i * 80}ms`,
              }}
            />
            <text x={x + barW / 2} y={h + 18} textAnchor="middle"
              fill="rgba(255,255,255,0.35)" fontSize={10}
              fontFamily="'JetBrains Mono',monospace">{item.label}</text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle"
              fill={color} fontSize={10} fontWeight={700}
              fontFamily="'JetBrains Mono',monospace">{item.score.toFixed(2)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchDashboardMetrics()
      .then(data => { setMetrics(data); setLoaded(true); })
      .catch(() => setError("Unable to load dashboard metrics."));
  }, []);

  const cm = metrics?.code_mixing;
  const sl = metrics?.sentence_lengths;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          from { width: 0%; }
          to   { width: var(--target-width, 0%); }
        }
        @keyframes barRise {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .dash-root * { box-sizing: border-box; }
        .dash-root {
          min-height: 100vh;
          background: #0A0B0F;
          color: #fff;
          font-family: 'Syne', sans-serif;
          padding: 40px 32px 60px;
        }

        /* header */
        .dash-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 10px;
          animation: fadeUp 0.4s ease both;
        }
        .dash-title {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0 0 14px;
          animation: fadeUp 0.4s ease both 0.05s;
          background: linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.45));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dash-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          max-width: 560px;
          line-height: 1.7;
          margin: 0 0 36px;
          animation: fadeUp 0.4s ease both 0.1s;
        }
        .dash-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
          margin: 0 0 32px;
        }

        /* bento grid */
        .bento-grid {
          display: grid;
          gap: 12px;
        }
        .bento-row-4 { grid-template-columns: repeat(4, 1fr); }
        .bento-row-2 { grid-template-columns: 1fr 1fr; }
        .bento-row-4-last { grid-template-columns: 1fr 1fr 1fr 1fr; }

        @media (max-width: 900px) {
          .bento-row-4 { grid-template-columns: 1fr 1fr; }
          .bento-row-4-last { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .bento-row-4, .bento-row-2, .bento-row-4-last { grid-template-columns: 1fr; }
          .dash-root { padding: 24px 16px 40px; }
        }

        /* chart tiles */
        .chart-tile {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px 24px 20px;
          animation: fadeUp 0.5s ease both;
        }
        .chart-tile-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 20px;
        }

        /* noise overlay */
        .dash-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }
        .dash-root > * { position: relative; z-index: 1; }

        /* subtle grid bg lines */
        .dash-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* loading skeleton shimmer */
        .skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.06) 0%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.06) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
          border-radius: 12px;
        }
      `}</style>

      <div className="dash-root">
        {/* ── Header ── */}
        <p className="dash-eyebrow">Corpus Dashboard</p>
        <h1 className="dash-title">Read your dialect behavior<br />like a mini analytics suite.</h1>
        <p className="dash-desc">
          Cluster distribution, similarity snapshots, sentence-length stats,
          and code-mixing ratios — so you can explain the system like a product, not just a model.
        </p>
        <div className="dash-divider" />

        {/* ── Row 1: 4 stat tiles ── */}
        <div className="bento-grid bento-row-4" style={{ marginBottom: 12 }}>
          {loaded ? (
            <>
              <StatTile label="Avg Length"  value={sl?.average ?? "--"}  helper="Avg tokens per sentence"  accent={PALETTE.teal}   pct={62}  delay={0} />
              <StatTile label="English %"   value={`${cm?.english_pct ?? 0}%`} helper="Romanized English proportion" accent={PALETTE.blue}   pct={cm?.english_pct ?? 0}  delay={60} />
              <StatTile label="Bengali %"   value={`${cm?.bengali_pct ?? 0}%`} helper="Bengali token proportion"    accent={PALETTE.amber}  pct={cm?.bengali_pct ?? 0}  delay={120} />
              <StatTile label="Avg CMI"     value={cm?.average_cmi ?? "--"}    helper="Higher = more code-mixed"    accent={PALETTE.purple} pct={(cm?.average_cmi ?? 0) * 100} delay={180} />
            </>
          ) : (
            [0,1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20 }} />
            ))
          )}
        </div>

        {/* ── Row 2: two chart tiles ── */}
        <div className="bento-grid bento-row-2" style={{ marginBottom: 12 }}>
          <div className="chart-tile" style={{ animationDelay: "0.25s" }}>
            <p className="chart-tile-label">Cluster distribution</p>
            {metrics ? (
              <DonutChart distribution={metrics.cluster_distribution} />
            ) : (
              <div className="skeleton" style={{ height: 160 }} />
            )}
          </div>

          <div className="chart-tile" style={{ animationDelay: "0.30s" }}>
            <p className="chart-tile-label">Similarity snapshot</p>
            {metrics ? (
              <SimilarityChart items={metrics.similarity_samples} />
            ) : (
              <div className="skeleton" style={{ height: 160 }} />
            )}
          </div>
        </div>

        {/* ── Row 3: 3 stat tiles + tag tile ── */}
        <div className="bento-grid bento-row-4-last">
          {loaded ? (
            <>
              <StatTile label="Min Length" value={sl?.min ?? "--"}              helper="Shortest sentence"             accent="#ffffff"          delay={320} />
              <StatTile label="Max Length" value={sl?.max ?? "--"}              helper="Longest sentence"              accent="#ffffff"          delay={380} />
              <StatTile label="Mixed %"    value={`${cm?.mixed_pct ?? 0}%`}     helper="Ambiguous / other-script"      accent={PALETTE.pink}     pct={cm?.mixed_pct ?? 0} delay={440} />
              {/* corpus tag tile */}
              <div style={{
                background: PALETTE.surface,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 20,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                animation: "fadeUp 0.5s ease both",
                animationDelay: "500ms",
              }}>
                <div>
                  <span style={{
                    fontFamily:"'JetBrains Mono',monospace",
                    fontSize: 10, letterSpacing:"0.18em", textTransform:"uppercase",
                    color:"rgba(255,255,255,0.35)",
                  }}>Corpus type</span>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginTop:8, marginBottom:0 }}>
                    Well-mixed bilingual corpus.<br />CMI above threshold.
                  </p>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:14 }}>
                  {["bengali-english","code-mixed","dialect"].map(tag => (
                    <span key={tag} style={{
                      fontFamily:"'JetBrains Mono',monospace",
                      fontSize:10, padding:"4px 10px",
                      borderRadius:99,
                      border:"1px solid rgba(255,255,255,0.15)",
                      color:"rgba(255,255,255,0.4)",
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            [0,1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20 }} />
            ))
          )}
        </div>

        {error && (
          <p style={{
            marginTop: 24, padding:"12px 16px", borderRadius:12,
            background:"rgba(240,111,164,0.08)", border:"1px solid rgba(240,111,164,0.2)",
            color: PALETTE.pink, fontSize:13, fontFamily:"'JetBrains Mono',monospace",
          }}>{error}</p>
        )}
      </div>
    </>
  );
}