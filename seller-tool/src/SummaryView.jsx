import { useState } from 'react'
import { evalFormula, formatValue } from '@core/formulaEngine'
import { getFlatInputs } from '@core/utils'
import { exportPptx } from './utils/pptxExport.js'

export default function SummaryView({ state, onEdit }) {
  const { config, prospect } = state
  const [copied, setCopied] = useState(false)
  const [pptxBusy, setPptxBusy] = useState(false)

  const primary = config.brand?.primaryColor || '#1a8a80'
  const productName = config.productName || 'Our Product'
  const company = prospect.companyName || 'Prospect'

  const inputValues = {}
  for (const inp of getFlatInputs(config)) {
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

        {config.leaveBehind?.introLine && (
          <div className="summary-intro">
            {config.leaveBehind.introLine
              .replace(/\{productName\}/g, productName)
              .replace(/\{company\}/g, company)}
          </div>
        )}

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

        {config.leaveBehind?.showInputs !== false && <section className="summary-assumptions">
          <h3 className="summary-section-heading">Model Inputs</h3>
          {config.inputGroups ? (
            config.inputGroups.map(group => {
              const visible = group.inputs.filter(i => i.sellerAccess !== 'locked')
              if (visible.length === 0) return null
              return (
                <div key={group.id} className="summary-input-group">
                  <div className="summary-input-group-heading">{group.label}</div>
                  <div className="summary-inputs-grid">
                    {visible.map(inp => {
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
                </div>
              )
            })
          ) : (
            <div className="summary-inputs-grid">
              {getFlatInputs(config).map(inp => {
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
          )}
        </section>}

        {config.leaveBehind?.nextSteps && (
          <section className="summary-next-steps">
            <h3 className="summary-section-heading">Next Steps</h3>
            <p>{config.leaveBehind.nextSteps}</p>
          </section>
        )}

        <footer className="summary-footer">
          <div className="summary-contact">
            {prospect.sellerName && <div className="summary-contact-name">{prospect.sellerName}</div>}
            {prospect.sellerEmail && (
              <a href={`mailto:${prospect.sellerEmail}`} className="summary-contact-detail">
                {prospect.sellerEmail}
              </a>
            )}
            {prospect.sellerPhone && (
              <div className="summary-contact-detail">{prospect.sellerPhone}</div>
            )}
          </div>
          {config.brand?.logoUrl && (
            <img src={config.brand.logoUrl} alt={productName} className="summary-footer-logo" />
          )}
        </footer>
      </div>
    </div>
  )
}
