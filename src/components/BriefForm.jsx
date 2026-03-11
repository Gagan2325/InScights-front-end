import React, { useState } from 'react';

const DRUG_CLASSES = [
  'Proton Pump Inhibitors (PPI)',
  'ACE Inhibitors',
  'ARBs',
  'Statins',
  'Biguanides',
  'DPP-4 Inhibitors',
  'SGLT-2 Inhibitors',
  'Triptans',
  'SSRIs / SNRIs',
  'Calcium Channel Blockers',
  'Beta Blockers',
  'NSAIDs',
  'Antibiotics',
  'Anticoagulants',
  'Other'
];

const EXAMPLE_BRIEFS = [
  {
    drugClass: 'Proton Pump Inhibitors (PPI)',
    molecule: 'Esomeprazole',
    brandName: 'Nexium',
    competitor: 'Omeprazole',
    competitorBrand: 'Omez',
    contentBrief: 'Generate arguments for 24-hour acid control capacity of esomeprazole 40mg vs omeprazole — targeting urban Indian working professionals who skip meals, eat late, and have high stress-related acid production.'
  },
  {
    drugClass: 'Statins',
    molecule: 'Rosuvastatin',
    brandName: 'Crestor',
    competitor: 'Atorvastatin',
    competitorBrand: 'Lipitor',
    contentBrief: 'Generate content on cardiovascular risk reduction and LDL lowering superiority of rosuvastatin vs atorvastatin in Indian patients with dyslipidemia and metabolic syndrome.'
  },
  {
    drugClass: 'SGLT-2 Inhibitors',
    molecule: 'Dapagliflozin',
    brandName: 'Forxiga',
    competitor: 'Empagliflozin',
    competitorBrand: 'Jardiance',
    contentBrief: 'Generate cardiorenal protection arguments for dapagliflozin in T2D patients with CKD, with focus on Indian population data and HF hospitalisation reduction.'
  }
];

const defaultForm = {
  drugClass: '',
  molecule: '',
  brandName: '',
  competitor: '',
  competitorBrand: '',
  contentBrief: '',
  generateBehavioural: true,
  generateClinical: true,
  generateSolutionFor: true,
  generateSolutionVs: false,
  usePublishedLiterature: true,
  useDataOnFile: false,
  region: 'India (Priority)',
  yearFrom: 2015,
  audience: 'HCP (Specialist)',
  tone: 'Clinical',
  pairsRequested: 4
};

export function BriefForm({ onSubmit, loading }) {
  const [form, setForm] = useState(defaultForm);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggle = (field) => setForm(prev => ({ ...prev, [field]: !prev[field] }));

  const fillExample = (example) => {
    setForm({ ...defaultForm, ...example, generateSolutionVs: !!example.competitor });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.drugClass || !form.molecule || !form.contentBrief) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Example quick-starts */}
      <div className="examples-section">
        <div className="section-label">Quick-start examples</div>
        <div className="examples-grid">
          {EXAMPLE_BRIEFS.map((ex, i) => (
            <div key={i} className="example-card" onClick={() => fillExample(ex)}>
              <div className="example-arrow">↗</div>
              <div className="example-brand">{ex.drugClass.split(' ')[0]} · {ex.molecule}</div>
              <div className="example-brief">{ex.contentBrief.substring(0, 90)}…</div>
              <div className="example-tags">
                <span className="example-tag">vs {ex.competitor}</span>
                <span className="example-tag">India focus</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="search-card">
        <div className="search-card-title">🔬 &nbsp;New Content Brief</div>

        {/* Row 1: Drug class / Molecule / Brand */}
        <div className="fields-row">
          <div className="field-group">
            <label className="field-label">Drug Class <span>*</span></label>
            <select
              className="field-select"
              value={form.drugClass}
              onChange={e => set('drugClass', e.target.value)}
              required
            >
              <option value="">Select class…</option>
              {DRUG_CLASSES.map(dc => <option key={dc}>{dc}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Molecule / INN <span>*</span></label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Esomeprazole"
              value={form.molecule}
              onChange={e => set('molecule', e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Brand Name</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Nexium, Nexpro"
              value={form.brandName}
              onChange={e => set('brandName', e.target.value)}
            />
          </div>
        </div>

        {/* Content Brief */}
        <div className="brief-row">
          <div className="field-group">
            <label className="field-label">Content Brief <span>*</span></label>
            <textarea
              className="brief-textarea"
              value={form.contentBrief}
              onChange={e => set('contentBrief', e.target.value)}
              placeholder={`Describe what you want to communicate.\n\nExamples:\n• 24-hour acid control superiority of esomeprazole for urban Indian professionals\n• Cardiorenal protection of dapagliflozin in T2D + CKD vs empagliflozin\n• LDL reduction speed of rosuvastatin in high-risk Indian patients`}
              required
              minLength={20}
            />
          </div>
        </div>

        {/* Generate toggles */}
        <div className="outputs-row">
          <span className="outputs-label">What to generate</span>
          <div className="generate-block">
            <div className="generate-block-label">💡 Need Statements</div>
            <div className="toggles">
              <label className={`toggle-chip ${form.generateBehavioural ? 'active' : ''}`} onClick={() => toggle('generateBehavioural')}>
                <input type="checkbox" readOnly checked={form.generateBehavioural} />
                <span className="chip-icon">🧠</span> Behavioural Need
              </label>
              <label className={`toggle-chip ${form.generateClinical ? 'active' : ''}`} onClick={() => toggle('generateClinical')}>
                <input type="checkbox" readOnly checked={form.generateClinical} />
                <span className="chip-icon">🩺</span> Clinical Need
              </label>
            </div>
          </div>

          <div className="generate-block" style={{ marginTop: '14px' }}>
            <div className="generate-block-label">✅ Solution Statements</div>
            <div className="toggles">
              <label className={`toggle-chip ${form.generateSolutionFor ? 'active' : ''}`} onClick={() => toggle('generateSolutionFor')}>
                <input type="checkbox" readOnly checked={form.generateSolutionFor} />
                <span className="chip-icon">🧬</span> In favour of molecule
              </label>
              <label className={`toggle-chip ${form.generateSolutionVs ? 'active' : ''}`} onClick={() => toggle('generateSolutionVs')}>
                <input type="checkbox" readOnly checked={form.generateSolutionVs} />
                <span className="chip-icon">⚔️</span> vs Competitor molecule
              </label>
              <label className="toggle-chip active" style={{ cursor: 'default' }}>
                <span className="chip-icon">📎</span> With citations
              </label>
            </div>
          </div>
        </div>

        {/* Competitor — shown when vs is toggled */}
        {form.generateSolutionVs && (
          <div className="fields-row" style={{ marginBottom: '20px' }}>
            <div className="field-group">
              <label className="field-label">Competitor Molecule <span>*</span></label>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Omeprazole, Pantoprazole"
                value={form.competitor}
                onChange={e => set('competitor', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Competitor Brand</label>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Omez, Pantodac"
                value={form.competitorBrand}
                onChange={e => set('competitorBrand', e.target.value)}
              />
            </div>
            <div className="field-group" />
          </div>
        )}

        {/* Evidence Sources */}
        <div className="field-group" style={{ marginBottom: '20px' }}>
          <span className="outputs-label">Evidence Sources</span>
          <div className="sources-row">
            {[
              { key: 'usePublishedLiterature', icon: '📚', name: 'Published Literature', desc: 'PubMed, The Lancet, NEJM, JAPI, JAMA, BMJ, Cochrane, meta-analyses & systematic reviews' },
              { key: 'useDataOnFile', icon: '🗂', name: 'Data on File', desc: 'Company-held data — upload & library coming soon', disabled: true },
              { key: null, icon: '🏛', name: 'Guidelines & Associations', desc: 'ICMR, API, AHA, ADA, EASD, WHO, NCI, ESMO — included automatically', disabled: true, alwaysOn: true },
              { key: null, icon: '🧪', name: 'Real World Evidence', desc: 'Observational studies, epidemiological data — India priority', disabled: true, alwaysOn: true }
            ].map((src) => (
              <div
                key={src.name}
                className={`source-card ${src.alwaysOn || (src.key && form[src.key]) ? 'active' : ''} ${src.disabled ? 'disabled' : ''}`}
                onClick={() => src.key && !src.disabled && toggle(src.key)}
              >
                <div className="source-check">{src.alwaysOn || (src.key && form[src.key]) ? '✓' : ''}</div>
                <div className="source-info">
                  <div className="source-name">{src.icon} {src.name} {src.disabled && !src.alwaysOn ? <span style={{ fontSize: '10px', opacity: 0.6 }}>(coming soon)</span> : ''}</div>
                  <div className="source-desc">{src.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Filters + CTA */}
        <div className="bottom-row">
          <div className="filters-group">
            {[
              { label: 'Region', key: 'region', options: ['India (Priority)', 'Global', 'Asia-Pacific'] },
              { label: 'From Year', key: 'yearFrom', options: [2015, 2010, 2000, 1990] },
              { label: 'Audience', key: 'audience', options: ['HCP (Specialist)', 'HCP (GP)', 'Patient'] },
              { label: 'Tone', key: 'tone', options: ['Clinical', 'Conversational', 'Educational'] },
              { label: 'Pairs', key: 'pairsRequested', options: [2, 4, 6, 8] }
            ].map(f => (
              <select
                key={f.key}
                className="mini-select"
                value={form[f.key]}
                onChange={e => set(f.key, isNaN(e.target.value) ? e.target.value : Number(e.target.value))}
              >
                {f.options.map(o => <option key={o} value={o}>{f.label}: {o}</option>)}
              </select>
            ))}
          </div>

          <button
            type="submit"
            className="generate-btn"
            disabled={loading || !form.drugClass || !form.molecule || !form.contentBrief}
          >
            {loading ? (
              <>
                <span className="spinner">⟳</span> Generating…
              </>
            ) : (
              <>Generate Content <span className="btn-arrow">→</span></>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
