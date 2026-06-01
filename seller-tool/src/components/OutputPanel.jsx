import { evalFormula, formatValue } from '../utils/formulaEngine.js'

export default function OutputPanel({ config, inputValues, prospect, primary }) {
  const productName = config.productName || 'Our Product'
  const company = prospect.companyName
  const outputs = config.outputs || []

  return (
    <div className="output-panel">
      <div className="output-panel-header">
        <div className="output-company">
          {company ? (
            <>
              <span className="output-company-label">Analysis for</span>
              <span className="output-company-name">{company}</span>
            </>
          ) : (
            <span className="output-company-placeholder">Enter company name to personalize</span>
          )}
        </div>
      </div>

      <div className="output-grid">
        {outputs.map(out => {
          const val = evalFormula(out.formula, inputValues)
          const formatted = formatValue(val, out.format)
          const label = (out.label || '').replace(/\{productName\}/g, productName)
          return (
            <div key={out.id} className={`output-card${out.highlight ? ' highlight' : ''}`} style={out.highlight ? { background: primary, borderColor: primary } : {}}>
              <div className="output-value" style={out.highlight ? { color: '#fff' } : { color: primary }}>
                {formatted}
              </div>
              <div className="output-label" style={out.highlight ? { color: 'rgba(255,255,255,0.8)' } : {}}>
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {config.description && (
        <p className="output-description">{config.description}</p>
      )}
    </div>
  )
}
