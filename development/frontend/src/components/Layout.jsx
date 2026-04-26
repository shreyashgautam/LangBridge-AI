import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/visualize", label: "Visualize" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/batch", label: "Batch Analyzer" },
  { to: "/suggest", label: "Suggestions" },
  { to: "/correct", label: "Corrector" },
  { to: "/search", label: "Search" },
  { to: "/convert", label: "Converter" },
  { to: "/dataset", label: "Dataset" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-mesh text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-panel backdrop-blur lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-80 lg:overflow-hidden">
          <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-sky-300/15 via-white/5 to-amber-300/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-200">Dialect-Aware</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">NLP Analyzer</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Research-style toolkit for Bengali-English code-mixed embeddings, similarity inspection, corpus analytics, and phonetic suggestions.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-2">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3.5 text-sm transition ${
                      isActive
                        ? "bg-sky-300 text-slate-950 shadow-[0_12px_40px_rgba(125,211,252,0.25)]"
                        : "border border-white/5 bg-white/5 text-slate-200 hover:border-sky-400/40 hover:bg-sky-300/10 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Project Upgrades</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              <li>Real MuRIL checkpoint inference</li>
              <li>Hybrid similarity scoring for noisy text</li>
              <li>Interactive embedding maps and analytics</li>
              <li>Batch upload, export, and suggestions</li>
            </ul>
          </div>

          <div className="mt-6 rounded-3xl border border-sky-300/20 bg-sky-300/10 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-100">Now Better</p>
            <p className="mt-3 text-sm leading-6 text-sky-50/90">
              The compare flow now blends model similarity with lexical and character-level matching, so near-duplicate romanized phrases rank more naturally.
            </p>
          </div>
        </aside>

        <div className="flex-1 pb-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
