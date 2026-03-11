import React, { useState } from 'react';
import { CitationBadge } from './CitationBadge';

/**
 * OutputPanel — renders the full generation result.
 * Shows:
 * - Summary stats (citations verified, India data, pairs)
 * - Each Need + Solution pair with colour-coded labels
 * - Citation badges with PubMed links
 * - Data gaps flagged by AI
 * - Export button (copy JSON / future Word export)
 */
export function OutputPanel({ result, loading, error, progress }) {

  const [expandedPair, setExpandedPair] = useState(null);
  const [copied, setCopied] = useState(false);

  // Loading state with progress steps
  if (loading) {
    return (
      <div className="output-section">
        <div className="output-header">
          <div className="output-title">Generating Content…</div>
        </div>
        <div className="output-placeholder">
          <div className="loading-steps">
            <div className={`loading-step ${progress?.step >= 1 ? 'active' : ''} ${progress?.step > 1 ? 'done' : ''}`}>
              <span className="step-icon">{progress?.step > 1 ? '✅' : progress?.step === 1 ? '⟳' : '○'}</span>
              <span>AI generating need &amp; solution pairs</span>
            </div>
            <div className={`loading-step ${progress?.step >= 2 ? 'active' : ''} ${progress?.step > 2 ? 'done' : ''}`}>
              <span className="step-icon">{progress?.step > 2 ? '✅' : progress?.step === 2 ? '⟳' : '○'}</span>
              <span>Verifying citations against PubMed</span>
            </div>
            <div className={`loading-step ${progress?.step >= 3 ? 'done' : ''}`}>
              <span className="step-icon">{progress?.step === 3 ? '✅' : '○'}</span>
              <span>Compiling final output</span>
            </div>
          </div>
          {progress?.message && (
            <div className="progress-message">{progress.message}</div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="output-section">
        <div className="output-header">
          <div className="output-title">Generation Failed</div>
        </div>
        <div className="output-placeholder">
          <div className="output-icon">⚠️</div>
          <div className="output-placeholder-text" style={{ color: '#c0392b' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!result) {
    return (
      <div className="output-section">
        <div className="output-header">
          <div className="output-title">Generated Content</div>
          <div className="output-meta">— awaiting brief —</div>
        </div>
        <div className="output-placeholder">
          <div className="output-icon">📋</div>
          <div className="output-placeholder-text">
            Fill in your drug class, molecule, and brief above — then hit <strong>Generate Content</strong> to see paired need statements and evidence-backed solution claims with verified citations.
          </div>
        </div>
      </div>
    );
  }

  const { meta, pairs, brief_summary, data_gaps, india_data_available } = result;

  const handleCopy = () => {
    const text = pairs.map((pair, i) => {
      const need = pair.need;
      const sol = pair.solution;
      const needCites = need.citations.map(c => `${c.authors}, ${c.journal}, ${c.year}${c.pmid ? ` (PMID: ${c.pmid})` : ''}`).join('; ');
      const solCites = sol.citations.map(c => `${c.authors}, ${c.journal}, ${c.year}${c.pmid ? ` (PMID: ${c.pmid})` : ''}`).join('; ');

      return `PAIR ${i + 1}\n\nNEED [${need.type.toUpperCase()}]:\n${need.statement}\nRef: ${needCites}\n\nSOLUTION [${sol.type === 'vs_competitor' ? `vs ${sol.comparator}` : `In favour of ${meta.molecule}`}]:\n${sol.statement}\nRef: ${solCites}\n\n${'─'.repeat(60)}`;
    }).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="output-section" id="outputSection">
      {/* Header */}
      <div className="output-header">
        <div>
          <div className="output-title">
            {meta.brand || meta.molecule}
            {meta.competitor && <span className="output-vs"> vs {meta.competitor}</span>}
          </div>
          {brief_summary && <div className="brief-summary">{brief_summary}</div>}
        </div>
        <div className="output-actions">
          <div className="output-meta">
            {new Date(meta.generated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}{meta.duration_ms ? `${(meta.duration_ms / 1000).toFixed(1)}s` : ''}
          </div>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? '✅ Copied' : '📋 Copy all'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-num">{meta.pairs_generated}</span>
          <span className="stat-label">pairs</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num">{meta.citations.verified}</span>
          <span className="stat-label">✅ verified</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num" style={{ color: meta.citations.unverified > 0 ? '#b06a00' : 'inherit' }}>
            {meta.citations.unverified}
          </span>
          <span className="stat-label">⚠️ to review</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num">{meta.citations.india_data}</span>
          <span className="stat-label">🇮🇳 India data</span>
        </div>
        {india_data_available && (
          <>
            <div className="stat-divider" />
            <div className="stat india-available">
              🇮🇳 India data available for this molecule
            </div>
          </>
        )}
      </div>

      {/* Pairs */}
      <div className="output-structure">
        {pairs.map((pair) => (
          <div key={pair.id} className="output-pair">

            {/* Need Statement */}
            <div className="output-pair-need">
              <span className="pair-label label-need">
                Need · {pair.need.type === 'behavioural' ? 'Behavioural' : 'Clinical'}
              </span>
              <div className="pair-content">
                <div className="pair-text">{pair.need.statement}</div>
                <div className="citations-list">
                  {pair.need.citations.map((c, ci) => (
                    <CitationBadge key={ci} citation={c} />
                  ))}
                </div>
              </div>
            </div>

            {/* Solution Statement */}
            <div className="output-pair-evidence">
              <span className="pair-label label-evidence">
                Solution · {pair.solution.type === 'vs_competitor'
                  ? `vs ${pair.solution.comparator}`
                  : `in favour of ${meta.molecule}`}
              </span>
              <div className="pair-content">
                <div className="pair-text">{pair.solution.statement}</div>
                <div className="citations-list">
                  {pair.solution.citations.map((c, ci) => (
                    <CitationBadge key={ci} citation={c} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Data gaps */}
      {data_gaps && data_gaps.length > 0 && (
        <div className="data-gaps">
          <div className="data-gaps-title">⚠️ Evidence gaps flagged by AI</div>
          <ul className="data-gaps-list">
            {data_gaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
          <div className="data-gaps-note">
            These areas may benefit from Data on File sources or a medical literature review.
          </div>
        </div>
      )}

      {/* Legal footer */}
      <div className="output-legal">
        ⚖️ For internal brand team use only · All content requires medical and regulatory review before external use · Unverified citations (⚠️) must be manually confirmed before use
      </div>
    </div>
  );
}
