import React from 'react';
import { BriefForm } from './components/BriefForm';
import { OutputPanel } from './components/OutputPanel';
import { useGenerate } from './hooks/useGenerate';

export default function App() {
  const { generate, loading, error, result, progress } = useGenerate();

  const handleSubmit = (brief) => {
    generate(brief);
    // Scroll to output after brief delay
    setTimeout(() => {
      document.getElementById('outputSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  return (
    <>
      <style>{`
        /* ── CSS VARIABLES ── */
        :root {
          --bg: #f0f4f8;
          --surface: #ffffff;
          --surface-2: #f7f9fc;
          --surface-3: #eef2f7;
          --teal: #0077a8;
          --teal-dim: #005f87;
          --teal-light: #e6f4fa;
          --gold: #b06a00;
          --gold-bg: #fff8ee;
          --gold-border: rgba(176,106,0,0.2);
          --ink: #1a2b3c;
          --ink-mid: #3d5166;
          --text-muted: #7a93ab;
          --border: #dce5ee;
          --border-strong: #c8d6e2;
          --need-bg: #fff8ee;
          --solution-bg: #e6f4fa;
          --verified-green: #1a7f4e;
          --verified-bg: #eaf7f0;
          --unverified-amber: #b06a00;
          --unverified-bg: #fff8ee;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 5% 10%, rgba(0,119,168,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 95% 90%, rgba(176,106,0,0.03) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── LAYOUT ── */
        .wrapper {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ── HEADER ── */
        header {
          padding: 24px 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }

        .logo { display: flex; align-items: center; gap: 12px; }

        .logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--teal), var(--teal-dim));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }

        .logo-brand {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px; font-weight: 600;
          color: var(--ink); letter-spacing: 0.02em;
        }

        .logo-sub {
          font-size: 10px; font-weight: 400;
          color: var(--teal); letter-spacing: 0.16em;
          text-transform: uppercase; display: block;
        }

        .header-badge {
          display: flex; align-items: center; gap: 8px;
          background: var(--teal-light);
          border: 1px solid rgba(0,119,168,0.2);
          border-radius: 100px; padding: 6px 14px;
          font-size: 12px; font-weight: 500; color: var(--teal);
        }

        .pulse-dot {
          width: 7px; height: 7px;
          background: var(--teal); border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* ── HERO ── */
        .hero {
          padding: 48px 0 36px;
          text-align: center;
        }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 16px;
        }
        .hero-eyebrow::before, .hero-eyebrow::after {
          content: ''; display: block; width: 28px; height: 1px;
          background: var(--gold); opacity: 0.35;
        }

        .hero h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 4.5vw, 46px);
          font-weight: 600; line-height: 1.2;
          color: var(--ink); margin-bottom: 12px;
        }
        .hero h1 em { font-style: italic; color: var(--teal); }

        .hero-desc {
          font-size: 14px; font-weight: 300;
          color: var(--ink-mid); max-width: 520px;
          margin: 0 auto; line-height: 1.7;
        }

        /* ── EXAMPLES ── */
        .examples-section { margin-bottom: 24px; }
        .section-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 12px;
        }
        .examples-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .example-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px 18px;
          cursor: pointer; transition: all 0.2s; position: relative;
          overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .example-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: var(--teal);
          transform: scaleX(0); transition: transform 0.2s; transform-origin: left;
        }
        .example-card:hover { border-color: rgba(0,119,168,0.3); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.07); }
        .example-card:hover::after { transform: scaleX(1); }
        .example-arrow { position: absolute; top: 14px; right: 14px; color: var(--text-muted); font-size: 13px; opacity: 0; transition: all 0.2s; }
        .example-card:hover .example-arrow { opacity: 1; transform: translate(2px,-2px); }
        .example-brand { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
        .example-brief { font-size: 12px; color: var(--ink-mid); line-height: 1.5; margin-bottom: 8px; }
        .example-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .example-tag { font-size: 10px; color: var(--text-muted); background: var(--surface-3); border: 1px solid var(--border); border-radius: 4px; padding: 2px 7px; }

        /* ── SEARCH CARD ── */
        .search-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; padding: 36px;
          margin-bottom: 24px; position: relative; overflow: hidden;
          box-shadow: 0 2px 14px rgba(0,0,0,0.06);
        }
        .search-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 3px; background: linear-gradient(90deg, transparent, var(--teal), transparent);
        }
        .search-card-title {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--teal); margin-bottom: 22px;
        }

        .fields-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .field-group { display: flex; flex-direction: column; gap: 7px; }
        .field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mid); }
        .field-label span { color: var(--teal); margin-left: 2px; }

        .field-input, .field-select {
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 10px; padding: 12px 14px;
          font-family: inherit; font-size: 13px; color: var(--ink);
          width: 100%; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none;
        }
        .field-input::placeholder { color: var(--text-muted); }
        .field-input:focus, .field-select:focus {
          border-color: var(--teal); background: var(--surface);
          box-shadow: 0 0 0 3px rgba(0,119,168,0.08);
        }
        .field-select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a93ab' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
        }
        .field-select option { background: #fff; color: var(--ink); }

        .brief-row { margin-bottom: 18px; }
        .brief-textarea {
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 16px;
          font-family: inherit; font-size: 13px; color: var(--ink);
          width: 100%; min-height: 110px; resize: vertical; outline: none;
          line-height: 1.6; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .brief-textarea::placeholder { color: var(--text-muted); }
        .brief-textarea:focus { border-color: var(--teal); background: var(--surface); box-shadow: 0 0 0 3px rgba(0,119,168,0.08); }

        /* Generate blocks */
        .outputs-row { margin-bottom: 20px; }
        .outputs-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-mid); margin-bottom: 10px; display: block; }

        .generate-block { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
        .generate-block-label { font-size: 12px; font-weight: 600; color: var(--ink-mid); margin-bottom: 9px; }

        .toggles { display: flex; flex-wrap: wrap; gap: 8px; }
        .toggle-chip {
          display: flex; align-items: center; gap: 7px;
          background: var(--surface-3); border: 1px solid var(--border);
          border-radius: 100px; padding: 7px 14px;
          font-size: 12px; font-weight: 400; color: var(--ink-mid);
          cursor: pointer; transition: all 0.2s; user-select: none;
          pointer-events: auto !important;
        }
        .toggle-chip * { pointer-events: none; }
        .toggle-chip.active {
          background: var(--teal);
          border-color: var(--teal);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,119,168,0.10);
        }
        .chip-icon { font-size: 13px; }

        /* Sources */
        .sources-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 0; }
        .source-card {
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .source-card:hover:not(.disabled) { background: var(--surface-3); border-color: var(--border-strong); }
        .source-card.active { background: var(--gold-bg); border-color: var(--gold-border); }
        .source-card.disabled { cursor: default; opacity: 0.6; }
        .source-check {
          width: 19px; height: 19px; border: 1.5px solid var(--border-strong);
          border-radius: 5px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px; transition: all 0.2s; font-size: 11px; color: transparent;
        }
        .source-card.active .source-check { background: var(--gold); border-color: var(--gold); color: #fff; }
        .source-name { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 3px; }
        .source-desc { font-size: 11px; color: var(--text-muted); line-height: 1.5; }

        /* Bottom row */
        .divider { height: 1px; background: var(--border); margin-bottom: 20px; }
        .bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .filters-group { display: flex; gap: 10px; flex-wrap: wrap; }
        .mini-select {
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 7px; padding: 8px 28px 8px 10px;
          font-family: inherit; font-size: 11px; color: var(--ink-mid);
          outline: none; cursor: pointer; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237a93ab' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 8px center;
          transition: border-color 0.2s;
        }
        .mini-select:focus { border-color: var(--teal); }
        .mini-select option { background: #fff; }

        .generate-btn {
          display: flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg, var(--teal), var(--teal-dim));
          border: none; border-radius: 11px; padding: 13px 26px;
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: #fff; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .generate-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,119,168,0.25); }
        .generate-btn:active { transform: translateY(0); }
        .generate-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-arrow { font-size: 15px; transition: transform 0.2s; }
        .generate-btn:hover:not(:disabled) .btn-arrow { transform: translateX(3px); }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { display: inline-block; animation: spin 1s linear infinite; }

        /* ── OUTPUT SECTION ── */
        .output-section {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; padding: 36px;
          margin-bottom: 40px; position: relative; overflow: hidden;
          box-shadow: 0 2px 14px rgba(0,0,0,0.06);
        }
        .output-section::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .output-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; }
        .output-title { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; color: var(--ink); }
        .output-vs { font-size: 14px; font-weight: 400; color: var(--text-muted); margin-left: 8px; }
        .brief-summary { font-size: 13px; color: var(--ink-mid); margin-top: 4px; font-weight: 300; }
        .output-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .output-meta { font-size: 11px; color: var(--text-muted); font-family: 'DM Mono', monospace; }
        .copy-btn {
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 8px; padding: 7px 14px;
          font-family: inherit; font-size: 12px; color: var(--ink-mid);
          cursor: pointer; transition: all 0.2s;
        }
        .copy-btn:hover { border-color: var(--border-strong); background: var(--surface-3); }

        /* Stats bar */
        .stats-bar {
          display: flex; align-items: center; gap: 0;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 10px; padding: 12px 20px;
          margin-bottom: 24px; flex-wrap: wrap; gap: 8px;
        }
        .stat { display: flex; align-items: baseline; gap: 5px; }
        .stat-num { font-size: 18px; font-weight: 600; color: var(--ink); }
        .stat-label { font-size: 11px; color: var(--text-muted); }
        .stat-divider { width: 1px; height: 24px; background: var(--border); margin: 0 14px; }
        .india-available { font-size: 12px; color: var(--teal); font-weight: 500; }

        /* Output pairs */
        .output-structure { display: flex; flex-direction: column; gap: 14px; }

        .output-pair {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 1px 5px rgba(0,0,0,0.04);
        }

        .output-pair-need {
          padding: 16px 20px; border-bottom: 1px solid var(--border);
          display: flex; gap: 14px; align-items: flex-start;
          background: var(--need-bg);
        }

        .output-pair-evidence {
          padding: 16px 20px;
          display: flex; gap: 14px; align-items: flex-start;
          background: var(--solution-bg);
        }

        .pair-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 4px 9px;
          border-radius: 4px; flex-shrink: 0; margin-top: 2px; white-space: nowrap;
        }
        .label-need { background: rgba(176,106,0,0.12); color: var(--gold); }
        .label-evidence { background: var(--teal-light); color: var(--teal); }

        .pair-content { flex: 1; }
        .pair-text { font-size: 14px; color: var(--ink-mid); line-height: 1.65; margin-bottom: 10px; }
        .citations-list { display: flex; flex-direction: column; gap: 6px; }

        /* Citation badges */
        .citation-badge {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 6px 10px; border-radius: 7px;
          font-size: 11px; line-height: 1.5;
        }
        .citation-badge.verified { background: var(--verified-bg); border: 1px solid rgba(26,127,78,0.2); }
        .citation-badge.unverified { background: var(--unverified-bg); border: 1px solid rgba(176,106,0,0.2); }
        .citation-status-icon { font-size: 12px; flex-shrink: 0; margin-top: 1px; }
        .citation-body { flex: 1; }
        .citation-ref { font-weight: 500; color: var(--ink-mid); }
        .citation-title { color: var(--text-muted); font-style: italic; margin-left: 4px; }
        .citation-meta { display: flex; align-items: center; gap: 10px; margin-top: 3px; flex-wrap: wrap; }
        .india-badge { font-size: 10px; background: rgba(0,119,168,0.08); color: var(--teal); border-radius: 4px; padding: 2px 6px; font-weight: 500; }
        .pmid-link { font-size: 10px; color: var(--teal); text-decoration: none; font-family: 'DM Mono', monospace; }
        .pmid-link:hover { text-decoration: underline; }
        .unverified-label { font-size: 10px; color: var(--gold); font-weight: 500; }

        /* Data gaps */
        .data-gaps {
          margin-top: 20px; padding: 16px 18px;
          background: #fff8ee; border: 1px solid rgba(176,106,0,0.2);
          border-radius: 10px;
        }
        .data-gaps-title { font-size: 12px; font-weight: 600; color: var(--gold); margin-bottom: 8px; }
        .data-gaps-list { list-style: disc; padding-left: 18px; font-size: 13px; color: var(--ink-mid); line-height: 1.7; }
        .data-gaps-note { font-size: 11px; color: var(--text-muted); margin-top: 8px; }

        /* Output legal */
        .output-legal {
          margin-top: 20px; font-size: 11px; color: var(--text-muted);
          text-align: center; padding-top: 16px; border-top: 1px solid var(--border);
          line-height: 1.6;
        }

        /* Loading steps */
        .output-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px; text-align: center; gap: 12px; }
        .output-icon { font-size: 38px; opacity: 0.3; }
        .output-placeholder-text { font-size: 14px; color: var(--text-muted); font-weight: 300; line-height: 1.6; max-width: 380px; }
        .loading-steps { display: flex; flex-direction: column; gap: 12px; text-align: left; }
        .loading-step { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text-muted); }
        .loading-step.active { color: var(--teal); font-weight: 500; }
        .loading-step.done { color: var(--verified-green); }
        .step-icon { font-size: 16px; width: 20px; text-align: center; }
        .progress-message { font-size: 12px; color: var(--text-muted); margin-top: 8px; }

        /* ── FOOTER ── */
        footer { border-top: 1px solid var(--border); padding: 20px 0; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-muted); }

        /* Animations */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .search-card { animation: fadeUp 0.4s ease both 0.05s; }
        .output-section { animation: fadeUp 0.4s ease both 0.1s; }

        /* Responsive */
        @media (max-width: 768px) {
          .wrapper { padding: 0 16px; }
          .fields-row { grid-template-columns: 1fr; }
          .sources-row { grid-template-columns: 1fr; }
          .examples-grid { grid-template-columns: 1fr; }
          .bottom-row { flex-direction: column; align-items: stretch; }
          .generate-btn { justify-content: center; }
          .hero h1 { font-size: 26px; }
          .stats-bar { gap: 12px; }
          .stat-divider { display: none; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div className="wrapper">

        <header>
          <div className="logo">
            <div className="logo-mark">⚕</div>
            <div>
              <span className="logo-brand">Brandcare InScights</span>
              <span className="logo-sub">Rx Evidence Intelligence</span>
            </div>
          </div>
          <div className="header-badge">
            <div className="pulse-dot" />
            Evidence Engine Active
          </div>
        </header>

        <div className="hero">
          <div className="hero-eyebrow">Rx Brand Intelligence</div>
          <h1>Turn clinical evidence into<br /><em>compelling brand stories</em></h1>
          <p className="hero-desc">Evidence-backed need statements and solution claims for Rx brands — grounded in indexed journals and data on file.</p>
        </div>

        <BriefForm onSubmit={handleSubmit} loading={loading} />

        <OutputPanel result={result} loading={loading} error={error} progress={progress} />

        <footer>
          <div>🔒 PHI-free · For internal brand team use only · Not for distribution to HCPs without medical review</div>
          <div>Brandcare InScights · v1.0 Beta</div>
        </footer>

      </div>
    </>
  );
}
