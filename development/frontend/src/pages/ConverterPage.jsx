import { useState } from "react";

// ─── mock API – replace with your real import ─────────────────────────────────
async function convertText(text) {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    formal:     "আমি ভালো আছি।",
    pure:       "ami bhalo achi.",
    code_mixed: "ami valo achi, I'm doing fine!",
  };
}

// ─── variant config ───────────────────────────────────────────────────────────
const VARIANTS = [
  {
    key:   "formal",
    label: "Formal",
    desc:  "Structured Bengali, grammatically standard",
    color: "#6AACF5",
    icon:  "◈",
  },
  {
    key:   "pure",
    label: "Pure",
    desc:  "Romanized transliteration, no mixing",
    color: "#3ECFB2",
    icon:  "◎",
  },
  {
    key:   "code_mixed",
    label: "Code Mixed",
    desc:  "Natural Bengali-English blend",
    color: "#B57BFF",
    icon:  "⇄",
  },
];

const STATS = [
  { label: "Modes",    value: "3 Variants", helper: "Formal · Pure · Code-mixed" },
  { label: "Method",   value: "Rule + Model", helper: "Linguistically guided conversion" },
  { label: "Best Use", value: "Demo WOW",   helper: "Explainable feature for presentations" },
];

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, helper, delay = 0 }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18,
      padding: "18px 20px",
      animation: "cvFadeUp 0.45s ease both",
      animationDelay: `${delay}ms`,
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
      }}>{label}</span>
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 22, fontWeight: 800,
        letterSpacing: "-0.02em", color: "#fff",
        margin: "6px 0 4px",
      }}>{value}</p>
      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{helper}</p>
    </div>
  );
}

// ─── Variant result card ──────────────────────────────────────────────────────
function VariantCard({ label, desc, color, icon, text, isEmpty, delay = 0 }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!text || isEmpty) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: `1px solid ${isEmpty ? "rgba(255,255,255,0.06)" : color + "30"}`,
      borderRadius: 20,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      animation: "cvFadeUp 0.5s ease both",
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.3s",
    }}>
      {!isEmpty && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 20,
          background: `radial-gradient(ellipse at 0% 0%, ${color}10, transparent 55%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 9,
            background: isEmpty ? "rgba(255,255,255,0.04)" : color + "18",
            border: `1px solid ${isEmpty ? "rgba(255,255,255,0.06)" : color + "35"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: isEmpty ? "rgba(255,255,255,0.2)" : color,
            flexShrink: 0,
          }}>{icon}</span>
          <div>
            <p style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 13, fontWeight: 700,
              color: isEmpty ? "rgba(255,255,255,0.35)" : "#fff",
              marginBottom: 1,
            }}>{label}</p>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5, color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.12em",
            }}>{desc}</p>
          </div>
        </div>

        {!isEmpty && (
          <button onClick={copy} style={{
            background: copied ? color + "20" : "rgba(255,255,255,0.04)",
            border: `1px solid ${copied ? color + "40" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 8, padding: "5px 10px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: copied ? color : "rgba(255,255,255,0.35)",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        )}
      </div>

      {/* divider */}
      <div style={{ height: 1, background: isEmpty ? "rgba(255,255,255,0.04)" : color + "20" }} />

      {/* output text */}
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 16,
        fontWeight: isEmpty ? 400 : 600,
        color: isEmpty ? "rgba(255,255,255,0.2)" : "#fff",
        lineHeight: 1.6,
        minHeight: 28,
        fontStyle: isEmpty ? "italic" : "normal",
      }}>
        {text || "Run the converter to generate this variant."}
      </p>

      {/* bottom accent bar */}
      {!isEmpty && (
        <div style={{ height: 2, borderRadius: 1, background: color, width: "30%", opacity: 0.5 }} />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ConverterPage() {
  const [text, setText] = useState("ami valo achi");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await convertText(text);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to convert dialect style.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes cvFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cvSpin {
          to { transform: rotate(360deg); }
        }

        .cv-root * { box-sizing: border-box; }
        .cv-root {
          font-family: 'Syne', sans-serif;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* header */
        .cv-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
          animation: cvFadeUp 0.35s ease both;
        }
        .cv-title {
          font-size: clamp(24px, 3.5vw, 40px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.08;
          background: linear-gradient(135deg, #fff 50%, rgba(255,255,255,0.45));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          animation: cvFadeUp 0.4s ease both 0.04s;
        }
        .cv-desc {
          font-size: 13.5px;
          color: rgba(255,255,255,0.38);
          max-width: 580px;
          line-height: 1.7;
          animation: cvFadeUp 0.4s ease both 0.08s;
        }
        .cv-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
        }

        /* stat row */
        .cv-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) {
          .cv-stats { grid-template-columns: 1fr; }
        }

        /* main grid */
        .cv-main {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .cv-main { grid-template-columns: 1fr; }
        }

        /* input panel */
        .cv-input-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: cvFadeUp 0.45s ease both 0.1s;
          position: relative;
          overflow: hidden;
        }
        .cv-input-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 12%; right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(62,207,178,0.35), transparent);
        }

        .cv-input-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }

        .cv-textarea {
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          resize: vertical;
          outline: none;
          width: 100%;
          min-height: 140px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cv-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .cv-textarea:focus {
          border-color: rgba(62,207,178,0.45);
          box-shadow: 0 0 0 3px rgba(62,207,178,0.07);
        }

        /* char count */
        .cv-char-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          text-align: right;
          margin-top: -8px;
        }

        /* btn */
        .cv-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 26px;
          border-radius: 99px;
          background: #3ECFB2;
          color: #08090D;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          width: 100%;
          letter-spacing: 0.01em;
        }
        .cv-btn:hover:not(:disabled) {
          background: #5DDEC7;
          transform: translateY(-1px);
        }
        .cv-btn:active:not(:disabled) { transform: translateY(0); }
        .cv-btn:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.25);
          cursor: not-allowed;
        }
        .cv-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: rgba(255,255,255,0.5);
          border-radius: 50%;
          animation: cvSpin 0.7s linear infinite;
        }

        /* hint */
        .cv-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          color: rgba(255,255,255,0.25);
          line-height: 1.55;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        /* error */
        .cv-error {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #F06FA4;
          padding: 10px 12px;
          background: rgba(240,111,164,0.07);
          border: 1px solid rgba(240,111,164,0.18);
          border-radius: 10px;
        }

        /* variants column */
        .cv-variants {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>

      <div className="cv-root">
        {/* ── Header ── */}
        <div>
          <p className="cv-eyebrow">Dialect Converter</p>
          <h1 className="cv-title">Generate style-shifted<br />variants for same intent.</h1>
          <p className="cv-desc">
            Reframes the same phrase into formal, pure, and code-mixed variants — a creative application layer beyond plain analysis.
          </p>
        </div>

        <div className="cv-divider" />

        {/* ── Stats ── */}
        <div className="cv-stats">
          {STATS.map((s, i) => (
            <StatTile key={s.label} {...s} delay={i * 55} />
          ))}
        </div>

        {/* ── Main ── */}
        <div className="cv-main">
          {/* input panel */}
          <div className="cv-input-panel">
            <p className="cv-input-label">Input phrase</p>
            <textarea
              className="cv-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="ami valo achi…"
            />
            <p className="cv-char-count">{text.length} chars</p>

            <button
              className="cv-btn"
              onClick={handleConvert}
              disabled={loading || !text.trim()}
            >
              {loading ? <span className="cv-spinner" /> : null}
              {loading ? "Converting…" : "Convert →"}
            </button>

            <p className="cv-hint">
              Enter any Bengali-English code-mixed phrase and generate three style variants — formal, pure romanized, and natural code-mixed.
            </p>

            {error && <p className="cv-error">{error}</p>}
          </div>

          {/* variants */}
          <div className="cv-variants">
            {VARIANTS.map((v, i) => (
              <VariantCard
                key={v.key}
                {...v}
                text={result?.[v.key]}
                isEmpty={!result?.[v.key]}
                delay={120 + i * 70}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}