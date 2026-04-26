export default function ComparePanel({
  compareForm,
  compareResult,
  onChange,
  onSubmit,
  loading,
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Compare Texts</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Similarity breakdown</h2>
        </div>
        {compareResult ? (
          <div className="rounded-3xl bg-sky-500/15 px-4 py-3 text-right ring-1 ring-sky-400/30">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Final Match</p>
            <p className="text-2xl font-semibold text-white">
              {(compareResult.similarity * 100).toFixed(1)}%
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <textarea
          name="text1"
          value={compareForm.text1}
          onChange={onChange}
          rows="5"
          className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-slate-100 outline-none transition focus:border-sky-400"
          placeholder="First sentence"
        />
        <textarea
          name="text2"
          value={compareForm.text2}
          onChange={onChange}
          rows="5"
          className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-slate-100 outline-none transition focus:border-sky-400"
          placeholder="Second sentence"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
        {compareResult ? (
          <p className="text-sm text-slate-400">
            Cleaned: "{compareResult.text1_cleaned}" vs "{compareResult.text2_cleaned}"
          </p>
        ) : (
          <p className="text-sm text-slate-400">Compare two Bengali-English phrases or sentences.</p>
        )}
      </div>

      {compareResult ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Embedding</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {(compareResult.embedding_similarity * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Character</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {(compareResult.character_similarity * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Token</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {(compareResult.token_similarity * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Sequence</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {(compareResult.sequence_similarity * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
