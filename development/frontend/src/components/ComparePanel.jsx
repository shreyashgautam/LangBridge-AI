import { useState, useEffect, useRef } from "react";

// ─── Animated number ──────────────────────────────────────────────────────────
function AnimNum({ value, decimals = 1, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay((from + (to - from) * ease).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, decimals, duration]);
  return <>{display}</>;
}

// ─── Radial progress ring ─────────────────────────────────────────────────────
function Ring({ pct, color, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.22,.68,0,1.2)" }}
      />
    </svg>
  );
}

// ─── Metric tile ──────────────────────────────────────────────────────────────
const METRIC_CFG = [
  { key: "embedding_similarity",  label: "Embedding",  color: "#3ECFB2", delay: 0   },
  { key: "character_similarity",  label: "Character",  color: "#6AACF5", delay: 60  },
  { key: "token_similarity",      label: "Token",      color: "#F5A623", delay: 120 },
  { key: "sequence_similarity",   label: "Sequence",   color: "#B57BFF", delay: 180 },
];

function MetricTile({ label, pct, color, delay }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18,
      padding: "20px 18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      animation: "fadeUp 0.5s ease both",
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* bg glow */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18,
        background: `radial-gradient(ellipse at 50% 0%, ${color}12, transparent 65%)`,
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative" }}>
        <Ring pct={pct} color={color} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: 15, fontWeight: 700, color: "#fff",
            fontFamily: "'Syne', sans-serif",
          }}>
            <AnimNum value={pct} />
            <span style={{ fontSize: 10, opacity: 0.6 }}>%</span>
          </span>
        </div>
      </div>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
      }}>{label}</span>
      {/* progress bar */}
      <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{
          height: 3, borderRadius: 2, background: color,
          width: `${pct}%`,
          transition: "width 0.9s cubic-bezier(.22,.68,0,1.2)",
        }} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ComparePanel({
  compareForm,
  compareResult,
  onChange,
  onSubmit,
  loading,
}) {
  const finalPct = compareResult ? (compareResult.similarity * 100) : null;

  const scoreColor = finalPct == null ? "#3ECFB2"
    : finalPct >= 75 ? "#3ECFB2"
    : finalPct >= 50 ? "#F5A623"
    : "#F06FA4";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(62,207,178,0.25); }
          70%  { box-shadow: 0 0 0 10px rgba(62,207,178,0); }
          100% { box-shadow: 0 0 0 0 rgba(62,207,178,0); }
        }

        .cp-root * { box-sizing: border-box; }
        .cp-root {
          font-family: 'Syne', sans-serif;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 28px 28px 28px;
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }

        /* top edge accent */
        .cp-root::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(62,207,178,0.4), transparent);
        }

        /* header */
        .cp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cp-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
        }
        .cp-title {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #fff;
          line-height: 1.1;
        }

        /* score badge */
        .score-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          animation: fadeUp 0.5s ease both 0.1s;
          min-width: 110px;
        }
        .score-badge-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .score-badge-value {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        /* textarea grid */
        .cp-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        @media (max-width: 600px) {
          .cp-inputs { grid-template-columns: 1fr; }
        }

        .cp-textarea-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cp-textarea-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          padding-left: 4px;
        }
        .cp-textarea {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          line-height: 1.65;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          min-height: 120px;
          width: 100%;
        }
        .cp-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .cp-textarea:focus {
          border-color: rgba(62,207,178,0.5);
          box-shadow: 0 0 0 3px rgba(62,207,178,0.08);
        }

        /* actions bar */
        .cp-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .cp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: 99px;
          background: #3ECFB2;
          color: #08090D;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          letter-spacing: 0.01em;
        }
        .cp-btn:hover:not(:disabled) {
          background: #5DDEC7;
          transform: translateY(-1px);
        }
        .cp-btn:active:not(:disabled) { transform: translateY(0); }
        .cp-btn:disabled {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3);
          cursor: not-allowed;
        }
        .cp-btn-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(0,0,0,0.25);
          border-top-color: rgba(0,0,0,0.7);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .cp-btn-disabled .cp-btn-spinner {
          border-top-color: rgba(255,255,255,0.4);
          border-color: rgba(255,255,255,0.1);
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .cp-hint {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.55;
        }
        .cp-hint strong {
          color: rgba(255,255,255,0.55);
          font-weight: 500;
        }

        /* cleaned text strip */
        .cp-cleaned {
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          animation: fadeUp 0.4s ease both;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .cp-cleaned span { color: rgba(255,255,255,0.6); }

        /* metrics grid */
        .cp-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 700px) {
          .cp-metrics { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .cp-metrics { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <section className="cp-root">
        {/* ── Header ── */}
        <div className="cp-header">
          <div>
            <p className="cp-eyebrow">Compare Texts</p>
            <h2 className="cp-title">Similarity<br />breakdown</h2>
          </div>

          {finalPct != null && (
            <div className="score-badge">
              <span className="score-badge-label">Final Match</span>
              <span className="score-badge-value" style={{ color: scoreColor }}>
                <AnimNum value={finalPct} />
                <span style={{ fontSize: 16, opacity: 0.6 }}>%</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Inputs ── */}
        <div className="cp-inputs">
          <div className="cp-textarea-wrap">
            <span className="cp-textarea-label">First sentence</span>
            <textarea
              className="cp-textarea"
              name="text1"
              value={compareForm.text1}
              onChange={onChange}
              rows={5}
              placeholder="আমি ভালো আছি, how are you?"
            />
          </div>
          <div className="cp-textarea-wrap">
            <span className="cp-textarea-label">Second sentence</span>
            <textarea
              className="cp-textarea"
              name="text2"
              value={compareForm.text2}
              onChange={onChange}
              rows={5}
              placeholder="ami bhalo achi, how r u?"
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="cp-actions">
          <button
            className={`cp-btn${loading ? " cp-btn-disabled" : ""}`}
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? <span className="cp-btn-spinner" /> : null}
            {loading ? "Comparing…" : "Compare →"}
          </button>

          {compareResult ? (
            <p className="cp-hint">
              Cleaned: <span><strong>"{compareResult.text1_cleaned}"</strong> vs <strong>"{compareResult.text2_cleaned}"</strong></span>
            </p>
          ) : (
            <p className="cp-hint">Compare two Bengali-English phrases or sentences.</p>
          )}
        </div>

        {/* ── Metric tiles ── */}
        {compareResult && (
          <div className="cp-metrics">
            {METRIC_CFG.map(({ key, label, color, delay }) => (
              <MetricTile
                key={key}
                label={label}
                pct={parseFloat((compareResult[key] * 100).toFixed(1))}
                color={color}
                delay={delay}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}