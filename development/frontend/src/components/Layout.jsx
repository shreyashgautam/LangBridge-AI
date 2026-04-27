import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/visualize", label: "Visualize", icon: "◈" },
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/batch", label: "Batch Analyzer", icon: "⊞" },
  { to: "/suggest", label: "Suggestions", icon: "✦" },
  { to: "/correct", label: "Corrector", icon: "⌥" },
  { to: "/search", label: "Search", icon: "◎" },
  { to: "/convert", label: "Converter", icon: "⇄" },
  { to: "/dataset", label: "Dataset", icon: "⊟" },
];

const upgrades = [
  "Real MuRIL checkpoint inference",
  "Hybrid similarity scoring",
  "Interactive embedding maps",
  "Batch upload & export",
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #08090D;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --teal: #3ECFB2;
          --blue: #5BAFEF;
          --text: rgba(255,255,255,0.9);
          --muted: rgba(255,255,255,0.5);
          --sidebar-w: 300px;
        }

        .layout-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: var(--sidebar-w);
          height: 100vh;
          background: rgba(8,9,13,0.9);
          border-right: 1px solid var(--border);
          backdrop-filter: blur(20px);
          padding: 24px 14px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: fixed;
        }

        /* Logo */
        .logo-block {
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .logo-title {
          font-size: 22px;
          font-weight: 800;
        }

        .logo-desc {
          font-size: 12px;
          color: var(--muted);
          margin-top: 8px;
        }

        /* Nav */
        .nav-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-label {
          font-size: 10px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          text-decoration: none;
          color: var(--muted);
          transition: 0.2s;
        }

        .nav-link:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text);
        }

        .nav-link.active {
          background: linear-gradient(135deg, var(--teal), var(--blue));
          color: black;
          font-weight: 600;
        }

        .nav-icon {
          width: 20px;
          text-align: center;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 10px 0;
        }

        /* Cards */
        .sidebar-card, .now-better-card {
          padding: 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .sidebar-card-label {
          font-size: 10px;
          margin-bottom: 8px;
          color: var(--muted);
        }

        .upgrade-item {
          font-size: 12px;
          margin: 6px 0;
          color: var(--muted);
        }

        .now-better-label {
          font-size: 10px;
          color: var(--teal);
          margin-bottom: 6px;
        }

        .now-better-text {
          font-size: 12px;
          color: var(--muted);
        }

        /* Main */
        .main-content {
          margin-left: var(--sidebar-w);
          padding: 30px;
          width: 100%;
        }

      `}</style>

      <div className="layout-root">

        {/* Sidebar */}
        <aside className="sidebar">

          <div className="logo-block">
            <h1 className="logo-title">NLP Analyzer</h1>
            <p className="logo-desc">
              Code-mixed NLP analysis & embeddings
            </p>
          </div>

          <div className="nav-wrap">
            <p className="nav-label">NAVIGATION</p>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  "nav-link " + (isActive ? "active" : "")
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="divider" />

          <div className="sidebar-card">
            <p className="sidebar-card-label">UPGRADES</p>
            {upgrades.map((u, i) => (
              <div key={i} className="upgrade-item">• {u}</div>
            ))}
          </div>

          <div className="now-better-card">
            <p className="now-better-label">IMPROVED</p>
            <p className="now-better-text">
              Better similarity ranking using hybrid embeddings.
            </p>
          </div>

        </aside>

        {/* Main */}
        <main className="main-content">
          <Outlet />
        </main>

      </div>
    </>
  );
}