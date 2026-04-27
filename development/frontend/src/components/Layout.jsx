import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/",         label: "Home",          icon: "⌂" },
  { to: "/visualize",label: "Visualize",     icon: "◈" },
  { to: "/dashboard",label: "Dashboard",     icon: "▦" },
  { to: "/batch",    label: "Batch Analyzer",icon: "⊞" },
  { to: "/suggest",  label: "Suggestions",   icon: "✦" },
  { to: "/correct",  label: "Corrector",     icon: "⌥" },
  { to: "/search",   label: "Search",        icon: "◎" },
  { to: "/convert",  label: "Converter",     icon: "⇄" },
  { to: "/dataset",  label: "Dataset",       icon: "⊟" },
];

const upgrades = [
  "Real MuRIL checkpoint inference",
  "Hybrid similarity scoring for noisy text",
  "Interactive embedding maps & analytics",
  "Batch upload, export & suggestions",
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #08090D;
          --surface:   rgba(255,255,255,0.035);
          --border:    rgba(255,255,255,0.07);
          --border-hi: rgba(255,255,255,0.13);
          --teal:      #3ECFB2;
          --blue:      #5BAFEF;
          --amber:     #F5A623;
          --text:      rgba(255,255,255,0.88);
          --muted:     rgba(255,255,255,0.38);
          --sidebar-w: 272px;
        }

        html, body, #root { height: 100%; }

        .layout-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Syne', sans-serif;
          color: var(--text);
          position: relative;
          overflow-x: hidden;
        }

        /* ── ambient blobs ── */
        .layout-root::before,
        .layout-root::after {
          content: '';
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(120px);
        }
        .layout-root::before {
          width: 600px; height: 600px;
          top: -200px; left: -160px;
          background: radial-gradient(circle, rgba(62,207,178,0.07) 0%, transparent 70%);
        }
        .layout-root::after {
          width: 500px; height: 500px;
          bottom: -150px; right: 10%;
          background: radial-gradient(circle, rgba(91,175,239,0.06) 0%, transparent 70%);
        }

        /* ── grid texture ── */
        .grid-texture {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── sidebar ── */
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          width: var(--sidebar-w);
          background: rgba(8,9,13,0.85);
          border-right: 1px solid var(--border);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          z-index: 10;
          padding: 28px 16px 24px;
          gap: 0;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .sidebar::-webkit-scrollbar { display: none; }

        @media (max-width: 860px) {
          .sidebar {
            transform: translateX(-110%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }

        /* logo block */
        .logo-block {
          padding: 20px 14px 22px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: linear-gradient(135deg,
            rgba(62,207,178,0.06) 0%,
            rgba(255,255,255,0.02) 50%,
            rgba(245,166,35,0.05) 100%);
          margin-bottom: 22px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .logo-block::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(ellipse at 20% 0%, rgba(62,207,178,0.12), transparent 60%);
          pointer-events: none;
        }
        .logo-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--teal);
          opacity: 0.8;
        }
        .logo-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-top: 8px;
          background: linear-gradient(135deg, #fff 50%, rgba(255,255,255,0.5));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-desc {
          font-size: 11.5px;
          color: var(--muted);
          line-height: 1.65;
          margin-top: 10px;
        }

        /* nav */
        .nav-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-height: 0;
        }
        .nav-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 0 10px;
          margin-bottom: 8px;
          opacity: 0.7;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          border: 1px solid transparent;
          transition: all 0.18s ease;
          position: relative;
          overflow: hidden;
        }
        .nav-link:hover {
          color: var(--text);
          background: rgba(255,255,255,0.04);
          border-color: var(--border);
        }
        .nav-link.active {
          color: #0A0B0F;
          background: var(--teal);
          border-color: transparent;
          font-weight: 700;
        }
        .nav-link.active .nav-icon {
          color: rgba(0,0,0,0.6);
        }
        .nav-icon {
          font-size: 13px;
          width: 18px;
          text-align: center;
          flex-shrink: 0;
          color: rgba(255,255,255,0.25);
          transition: color 0.18s;
        }
        .nav-link:hover .nav-icon {
          color: var(--teal);
        }
        .nav-link.active .nav-icon {
          color: rgba(0,0,0,0.55);
        }

        /* bottom card */
        .sidebar-card {
          margin-top: 18px;
          padding: 16px 14px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          flex-shrink: 0;
        }
        .sidebar-card-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 10px;
        }
        .upgrade-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 11.5px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
          padding: 5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .upgrade-item:last-child { border-bottom: none; }
        .upgrade-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--teal);
          margin-top: 6px;
          flex-shrink: 0;
          opacity: 0.7;
        }

        .now-better-card {
          margin-top: 10px;
          padding: 14px;
          border: 1px solid rgba(62,207,178,0.18);
          border-radius: 14px;
          background: rgba(62,207,178,0.05);
          flex-shrink: 0;
        }
        .now-better-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--teal);
          opacity: 0.8;
          margin-bottom: 8px;
        }
        .now-better-text {
          font-size: 11.5px;
          color: rgba(62,207,178,0.65);
          line-height: 1.65;
        }

        /* ── main content ── */
        .main-content {
          margin-left: var(--sidebar-w);
          flex: 1;
          min-height: 100vh;
          position: relative;
          z-index: 1;
          padding: 32px 36px 60px;
        }
        @media (max-width: 860px) {
          .main-content {
            margin-left: 0;
            padding: 72px 16px 40px;
          }
        }

        /* ── mobile topbar ── */
        .mobile-bar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: rgba(8,9,13,0.9);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          z-index: 20;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }
        @media (max-width: 860px) {
          .mobile-bar { display: flex; }
        }
        .mobile-logo {
          font-size: 15px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--teal), var(--blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hamburger {
          background: none;
          border: 1px solid var(--border);
          border-radius: 8px;
          width: 36px; height: 36px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: border-color 0.2s;
        }
        .hamburger:hover { border-color: var(--border-hi); }
        .hamburger span {
          display: block;
          width: 16px; height: 1.5px;
          background: var(--text);
          border-radius: 1px;
          transition: all 0.2s;
        }

        /* overlay */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 9;
        }
        @media (max-width: 860px) {
          .sidebar-overlay.open { display: block; }
        }

        /* sidebar top line accent */
        .sidebar-accent-line {
          position: absolute;
          top: 0; left: 20px; right: 20px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--teal), transparent);
          opacity: 0.4;
        }
      `}</style>

      <div className="layout-root">
        <div className="grid-texture" />

        {/* mobile topbar */}
        <header className="mobile-bar">
          <span className="mobile-logo">NLP Analyzer</span>
          <button className="hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </header>

        {/* overlay */}
        <div
          className={`sidebar-overlay ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
          <div className="sidebar-accent-line" />

          {/* logo */}
          <div className="logo-block">
            <p className="logo-eyebrow">Dialect-Aware</p>
            <h1 className="logo-title">NLP<br />Analyzer</h1>
            <p className="logo-desc">
              Bengali-English code-mixed embeddings, similarity inspection, corpus analytics, and phonetic suggestions.
            </p>
          </div>

          {/* nav */}
          <div className="nav-wrap">
            <p className="nav-label">Navigation</p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* upgrades */}
          <div className="sidebar-card">
            <p className="sidebar-card-label">Project Upgrades</p>
            {upgrades.map((u, i) => (
              <div className="upgrade-item" key={i}>
                <span className="upgrade-dot" />
                {u}
              </div>
            ))}
          </div>

          {/* now better */}
          <div className="now-better-card">
            <p className="now-better-label">Now Better</p>
            <p className="now-better-text">
              Compare flow now blends model similarity with lexical and character-level matching — near-duplicate romanized phrases rank more naturally.
            </p>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}