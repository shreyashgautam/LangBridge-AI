import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { convertText } from "../services/api";

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
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to convert dialect style.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dialect Converter"
        title="Generate style-shifted variants for the same intent"
        description="This experimental page reframes the same phrase into pure, formal, and code-mixed variants. It gives your demo a creative application layer beyond plain analysis."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Modes" value="3 variants" helper="Pure, formal, and code-mixed outputs." />
        <StatCard label="Method" value="Rule + Model" helper="Light conversion guided by the project’s linguistic framing." />
        <StatCard label="Best Use" value="Demo WOW" helper="A creative but explainable feature for presentations." />
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="8"
            className="w-full rounded-3xl border border-white/10 bg-slate-950/75 p-5 text-slate-100 outline-none transition focus:border-sky-400"
          />
          <button
            onClick={handleConvert}
            disabled={loading}
            className="mt-4 rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:bg-slate-600"
          >
            {loading ? "Converting..." : "Convert"}
          </button>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="grid gap-4">
          {["formal", "pure", "code_mixed"].map((key) => (
            <div key={key} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{key.replace("_", " ")}</p>
              <p className="mt-3 text-lg text-white">{result?.[key] || "Run the converter to generate this variant."}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
