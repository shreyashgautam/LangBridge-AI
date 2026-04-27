import { useState } from "react";

// ─── mock API – replace with your real import ─────────────────────────────────
async function correctText(text) {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    corrected: "ami bhalo achi",
    suggestions: [
      { text: "ami bhalo achi",  similarity: 0.97, cluster: "Cluster B · Informal greeting" },
      { text: "ami valo achhi",  similarity: 0.83, cluster: "Cluster B · Spelling variant"  },
      { text: "ami bhaalo aachi",similarity: 0.71, cluster: "Cluster A · Extended vowel form"},
    ],
  };
}

// ─── stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, helper, delay = 0 }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18,
      padding: "18px 20px",
      animation: "crFadeUp 0.45s ease both",
      animationDelay: `${delay}ms`,
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
      }}>{label}</span>
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 21, fontWeight: 800,
        letterSpacing: "-0.02em", color: "#fff",
        margin: "6px 0 4px",
      }}>{value}</p>
      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.32)", lineHeight: 1.5 }}>{helper}</p>
    </div>
  );
}

// ─── similarity arc (SVG) ─────────────────────────────────────────────────────
function SimArc({ pct, color }) {
  const r = 18, stroke = 4;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={44} height={44} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={22} cy={22} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={22} cy={22} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.22,.68,0,1.2)" }}
      />
    </svg>
  );
}

// ─── suggestion row ───────────────────────────────────────────────────────────
const SIM_COLORS = ["#3ECFB2", "#6AACF5", "#F5A623"];

function SuggestionRow({ item, rank, delay }) {
  const pct = parseFloat((item.similarity * 100).toFixed(1));
  const color = SIM_COLORS[rank] ?? "#888";
  const isTop = rank === 0;

  return (
    <div style={{
      background: isTop ? "rgba(62,207,178,0.05)" : "rgba(255,255,255,0.025)",
      border: `1px solid ${isTop ? "rgba(62,207,178,0.2)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      animation: "crFadeUp 0.5s ease both",
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
    }}>
      {isTop && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 0% 50%, rgba(62,207,178,0.08), transparent 60%)",
          pointerEvents: "none",
        }} />
      )}

      {/* rank badge */}
      <div style={{
        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
        background: color + "18",
        border: `1px solid ${color}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, fontWeight: 600, color,
      }}>
        {rank + 1}
      </div>

      {/* text + cluster */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 15, fontWeight: isTop ? 700 : 500,
          color: isTop ? "#fff" : "rgba(255,255,255,0.8)",
          marginBottom: 3,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{item.text}</p>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.06em",
        }}>{item.cluster}</p>
      </div>

      {/* arc + score */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <SimArc pct={pct} color={color} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 9, fontWeight: 700, color,
            }}>{pct}%</span>
          </div>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8.5, color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>sim</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Use Case", value: "Normalizer",   helper: "Turns noisy romanized text into cleaner phrasing." },
  { label: "Ranking",  value: "Nearest Match",helper: "Embedding similarity + reranking."                 },
  { label: "Output",   value: "Top 3",         helper: "Best correction plus ranked alternatives."         },
];

export default function CorrectorPage() {
  const [text, setText] = useState("ami valo asi");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCorrect = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await correctText(text);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to generate corrections.");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result?.corrected) return;
    navigator.clipboard.writeText(result.corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes crFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes crSpin { to { transform: rotate(360deg); } }
        @keyframes crPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }

        .cr-root * { box-sizing: border-box; }
        .cr-root {
          font-family: 'Syne', sans-serif;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .cr-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.24em;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
          animation: crFadeUp 0.35s ease both;
        }
        .cr-title {
          font-size: clamp(24px, 3.5vw, 40px);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
          background: linear-gradient(135deg, #fff 50%, rgba(255,255,255,0.45));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          animation: crFadeUp 0.4s ease both 0.04s;
        }
        .cr-desc {
          font-size: 13.5px; color: rgba(255,255,255,0.38);
          max-width: 580px; line-height: 1.7;
          animation: crFadeUp 0.4s ease both 0.08s;
        }
        .cr-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
        }

        .cr-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) { .cr-stats { grid-template-columns: 1fr; } }

        .cr-main {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 860px) { .cr-main { grid-template-columns: 1fr; } }

        /* input panel */
        .cr-input-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 22px;
          display: flex; flex-direction: column; gap: 14px;
          animation: crFadeUp 0.45s ease both 0.1s;
          position: relative; overflow: hidden;
        }
        .cr-input-panel::before {
          content: '';
          position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(62,207,178,0.35), transparent);
        }
        .cr-input-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(255,255,255,0.28);
        }
        .cr-textarea {
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 14px 16px;
          color: #fff; font-family: 'Syne', sans-serif;
          font-size: 15px; line-height: 1.7;
          resize: vertical; outline: none; width: 100%; min-height: 150px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cr-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .cr-textarea:focus {
          border-color: rgba(62,207,178,0.45);
          box-shadow: 0 0 0 3px rgba(62,207,178,0.07);
        }
        .cr-char-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: rgba(255,255,255,0.2);
          text-align: right; margin-top: -8px;
        }
        .cr-btn {
          display: inline-flex; align-items: center;
          justify-content: center; gap: 8px;
          padding: 12px 26px; border-radius: 99px;
          background: #3ECFB2; color: #08090D;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          border: none; cursor: pointer; width: 100%;
          transition: background 0.18s, transform 0.12s;
        }
        .cr-btn:hover:not(:disabled) { background: #5DDEC7; transform: translateY(-1px); }
        .cr-btn:active:not(:disabled) { transform: translateY(0); }
        .cr-btn:disabled {
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.25); cursor: not-allowed;
        }
        .cr-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: rgba(255,255,255,0.5);
          border-radius: 50%;
          animation: crSpin 0.7s linear infinite;
        }
        .cr-hint {
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px;
          color: rgba(255,255,255,0.25); line-height: 1.55;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02); border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .cr-error {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          color: #F06FA4; padding: 10px 12px;
          background: rgba(240,111,164,0.07);
          border: 1px solid rgba(240,111,164,0.18); border-radius: 10px;
        }

        /* result panel */
        .cr-result-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 22px;
          display: flex; flex-direction: column; gap: 12px;
          animation: crFadeUp 0.45s ease both 0.14s;
          position: relative; overflow: hidden;
        }
        .cr-result-panel::before {
          content: '';
          position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(106,172,245,0.35), transparent);
        }

        /* top corrected card */
        .cr-corrected-card {
          background: rgba(62,207,178,0.06);
          border: 1px solid rgba(62,207,178,0.2);
          border-radius: 16px; padding: 18px 20px;
          position: relative; overflow: hidden;
          animation: crFadeUp 0.5s ease both 0.18s;
        }
        .cr-corrected-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 0% 0%, rgba(62,207,178,0.1), transparent 55%);
          pointer-events: none;
        }

        /* empty state */
        .cr-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 40px 20px;
          text-align: center;
        }
        .cr-empty-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: rgba(255,255,255,0.15);
        }
        .cr-loading-dots span {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; background: rgba(62,207,178,0.6);
          margin: 0 2px;
          animation: crPulse 1.2s ease infinite;
        }
        .cr-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .cr-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="cr-root">
        {/* ── Header ── */}
        <div>
          <p className="cr-eyebrow">Phonetic Corrector</p>
          <h1 className="cr-title">Normalize spelling variants<br />with embedding-aware suggestions.</h1>
          <p className="cr-desc">
            Use your learned phonetic space as a practical spell normalizer. Surfaces the strongest correction candidate and a ranked list of alternatives.
          </p>
        </div>

        <div className="cr-divider" />

        {/* ── Stats ── */}
        <div className="cr-stats">
          {STATS.map((s, i) => <StatTile key={s.label} {...s} delay={i * 55} />)}
        </div>

        {/* ── Main ── */}
        <div className="cr-main">

          {/* input */}
          <div className="cr-input-panel">
            <p className="cr-input-label">Input text</p>
            <textarea
              className="cr-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="ami valo asi…"
            />
            <p className="cr-char-count">{text.length} chars</p>
            <button
              className="cr-btn"
              onClick={handleCorrect}
              disabled={loading || !text.trim()}
            >
              {loading ? <span className="cr-spinner" /> : null}
              {loading ? "Correcting…" : "Correct Text →"}
            </button>
            <p className="cr-hint">
              Enter noisy or phonetically varied romanized Bengali text. The corrector uses embedding similarity to find the most natural normalized form.
            </p>
            {error && <p className="cr-error">{error}</p>}
          </div>

          {/* results */}
          <div className="cr-result-panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: "0.22em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
              }}>Correction result</p>
              {result && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, color: "rgba(62,207,178,0.6)",
                  letterSpacing: "0.1em",
                }}>● {result.suggestions.length} suggestions</span>
              )}
            </div>

            {loading ? (
              <div className="cr-empty">
                <div className="cr-loading-dots">
                  <span /><span /><span />
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                  analyzing phonetic space…
                </p>
              </div>
            ) : result ? (
              <>
                {/* top corrected */}
                <div className="cr-corrected-card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <p style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9, letterSpacing: "0.2em",
                        textTransform: "uppercase", color: "rgba(62,207,178,0.6)",
                        marginBottom: 8,
                      }}>Best correction</p>
                      <p style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 24, fontWeight: 800,
                        letterSpacing: "-0.02em", color: "#fff",
                      }}>{result.corrected}</p>
                    </div>
                    <button onClick={copyResult} style={{
                      background: copied ? "rgba(62,207,178,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${copied ? "rgba(62,207,178,0.35)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 9, padding: "6px 12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9, letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: copied ? "#3ECFB2" : "rgba(255,255,255,0.35)",
                      cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
                      marginTop: 4,
                    }}>
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                  </div>

                  {/* diff view */}
                  <div style={{
                    marginTop: 14, padding: "10px 12px",
                    background: "rgba(0,0,0,0.25)", borderRadius: 10,
                    display: "flex", alignItems: "center", gap: 10,
                    flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, color: "rgba(240,111,164,0.7)",
                      textDecoration: "line-through",
                    }}>{text}</span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, color: "rgba(62,207,178,0.8)",
                    }}>{result.corrected}</span>
                  </div>
                </div>

                {/* suggestion list */}
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
                  marginTop: 4,
                }}>Ranked alternatives</p>
                {result.suggestions.map((item, i) => (
                  <SuggestionRow key={item.text} item={item} rank={i} delay={i * 70} />
                ))}
              </>
            ) : (
              <div className="cr-empty">
                <div className="cr-empty-icon">⌥</div>
                <p style={{
                  fontSize: 12, color: "rgba(255,255,255,0.22)",
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6,
                }}>
                  Run the corrector to see<br />the best normalized phrase.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}