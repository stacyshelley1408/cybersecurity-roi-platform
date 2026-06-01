import { useState } from 'react'
import { evalFormula, formatValue } from './utils/formulaEngine.js'
import { exportPptx } from './utils/pptxExport.js'

export default function SummaryView({ state, onEdit }) {
  const { config, prospect } = state
  const [copied, setCopied] = useState(false)
  const [pptxBusy, setPptxBusy] = useState(false)

  const primary = config.brand?.primaryColor || '#1a8a80'
  const productName = config.productName || 'Our Product'
  const company = prospect.companyName || 'Prospect'

  const inputValues = {}
  for (const inp of config.inputs || []) {
    inputValues[inp.id] = prospect.inputValues?.[inp.id] ?? inp.default ?? 0
  }

  const outputs = config.outputs || []

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handlePptx() {
    setPptxBusy(true)
    setTimeout(() => {
      exportPptx({ config, prospect })
      setPptxBusy(false)
    }, 50)
  }

  return (
    <div className="summary-root">
      {/* Export bar — hidden in print */}
      <div className="export-bar no-print">
        <button className="btn-ghost" onClick={onEdit}>
          ← Back to Session
        </button>
        <div className="export-actions">
          <button className="btn-export" onClick={handleCopyLink}>
            {copied ? '✓ Link Copied' : 'Copy Share Link'}
          </button>
          <button className="btn-export" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button className="btn-export btn-export-pptx" onClick={handlePptx} disabled={pptxBusy} style={{ background: primary }}>
            {pptxBusy ? 'Generating…' : 'Download .pptx'}
          </button>
        </div>
      </div>

      {/* Leave-behind document */}
      <div className="summary-doc">
        <header className="summary-header" style={{ borderTopColor: primary }}>
          <div className="summary-header-text">
            {config.brand?.logoUrl && (
              <img src={config.brand.logoUrl} alt={productName} className="summary-logo" />
            )}
            <div>
              <div className="summary-product" style={{ color: primary }}>{productName}</div>
              <div className="summary-title">ROI Analysis</div>
            </div>
          </div>
          <div className="summary-meta">
            <div className="summary-meta-item">
              <span className="summary-meta-label">Prepared for</span>
              <span className="summary-meta-value">{company}</span>
            </div>
            {prospect.contactName && (
              <div className="summary-meta-item">
                <span className="summary-meta-label">Contact</span>
                <span className="summary-meta-value">{prospect.contactName}</span>
              </div>
            )}
            <div className="summary-meta-item">
              <span className="summary-meta-label">Date</span>
              <span className="summary-meta-value">{prospect.date}</span>
            </div>
          </div>
        </header>

        <section className="summary-outputs">
          {outputs.map(out => {
            const val = evalFormula(out.formula, inputValues)
            const formatted = formatValue(val, out.format)
            const label = (out.label || '').replace(/\{productName\}/g, productName)
            return (
              <div key={out.id} className={`summary-output-card${out.highlight ? ' highlight' : ''}`} style={out.highlight ? { background: primary, borderColor: primary } : { borderTopColor: primary }}>
                <div className="summary-output-value" style={out.highlight ? { color: '#fff' } : { color: primary }}>
                  {formatted}
                </div>
                <div className="summary-output-label" style={out.highlight ? { color: 'rgba(255,255,255,0.8)' } : {}}>
                  {label}
                </div>
              </div>
            )
          })}
        </section>

        {config.description && (
          <section className="summary-description">
            <p>{config.description}</p>
          </section>
        )}

        <section className="summary-assumptions">
          <h3 className="summary-section-heading">Model Inputs</h3>
          <div className="summary-inputs-grid">
            {(config.inputs || []).map(inp => {
              const val = inputValues[inp.id]
              const display = inp.prefix
                ? `${inp.prefix}${Number(val).toLocaleString()}${inp.suffix || ''}`
                : `${Number(val).toLocaleString()}${inp.suffix || ''}`
              return (
                <div key={inp.id} className="summary-input-row">
                  <span className="summary-input-label">{inp.label}</span>
                  <span className="summary-input-val">{display}</span>
                </div>
              )
            })}
          </div>
        </section>

        <footer className="summary-footer">
          <div className="summary-footer-left">
            {prospect.sellerName && (
              <span>Prepared by <strong>{prospect.sellerName}</strong></span>
            )}
          </div>
          {config.cta?.text && config.cta?.url && (
            <a
              className="summary-cta"
              href={config.cta.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: primary }}
            >
              {config.cta.text}
            </a>
          )}
        </footer>
      </div>
    </div>
  )
}
