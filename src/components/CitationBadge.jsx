import React from 'react';

/**
 * CitationBadge — renders a single citation with verification status.
 * ✅ Green = verified against PubMed
 * ⚠️ Amber = not verified (needs human review)
 * 🇮🇳 = India-specific data
 */
export function CitationBadge({ citation }) {
  const {
    authors,
    journal,
    year,
    title,
    pmid,
    verified,
    verification_status,
    pubmed_url,
    india_data
  } = citation;

  const displayText = [
    authors,
    journal && `${journal}`,
    year
  ].filter(Boolean).join(', ');

  return (
    <div className={`citation-badge ${verified ? 'verified' : 'unverified'}`}>
      <span className="citation-status-icon">
        {verified ? '✅' : '⚠️'}
      </span>

      <div className="citation-body">
        <span className="citation-ref">{displayText}</span>

        {title && (
          <span className="citation-title">— {title}</span>
        )}

        <div className="citation-meta">
          {india_data && (
            <span className="india-badge">🇮🇳 India data</span>
          )}

          {verified && pubmed_url && pmid && (
            <a
              href={pubmed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="pmid-link"
            >
              PMID {pmid} ↗
            </a>
          )}

          {!verified && (
            <span className="unverified-label">
              {verification_status === 'pmid_not_found'
                ? 'PMID not found — verify manually'
                : 'Unverified — review required'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
