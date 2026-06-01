import { useState } from 'react'
import { slugify } from '../../utils'

function newOutput() {
  return { id: '', label: '', formula: '', format: 'currency', highlight: false }
}

function checkFormula(formula, inputIds) {
  const missing = []
  const tokens = formula.match(/\b[a-z_][a-z0-9_]*\b/gi) || []
  const mathBuiltins = new Set([
    'Math', 'Infinity', 'NaN', 'isFinite', 'isNaN', 'parseFloat', 'parseInt',
    'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'atan2',
    'ceil', 'cbrt', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround',
    'hypot', 'imul', 'log', 'log1p', 'log2', 'log10', 'max', 'min',
    'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc',
    'PI', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT2', 'SQRT1_2',
  ])
  tokens.forEach(tok => {
    if (!mathBuiltins.has(tok) && !/^\d/.test(tok) && !inputIds.includes(tok)) {
      missing.push(tok)
    }
  })
  return [...new Set(missing)]
}

const FORMAT_OPTIONS = [
  { value: 'currency', label: 'Currency ($1,234)' },
  { value: 'currency_k', label: 'Currency compact ($1.2M)' },
  { value: 'percent', label: 'Percent (12.5%)' },
  { value: 'number', label: 'Number (1,234)' },
  { value: 'number_1dp', label: 'Number 1dp (1.8)' },
  { value: 'months', label: 'Months (6 months)' },
  { value: 'hours', label: 'Hours (48 hours)' },
  { value: 'days', label: 'Days (30 days)' },
]

function OutputForm({ output, inputIds, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...output })
  const missing = draft.formula ? checkFormula(draft.formula, inputIds) : []

  function set(k, v) {
    setDraft(d => {
      const next = { ...d, [k]: v }
      if (k === 'label' && !output.id) next.id = slugify(v, 'output')
      return next
    })
  }

  function insertVar(v) {
    setDraft(d => ({ ...d, formula: (d.formula ? d.formula + ' * ' : '') + v }))
  }

  function handleSave() {
    if (!draft.label.trim() || !draft.formula.trim()) return
    onSave({ ...draft, id: draft.id || slugify(draft.label, 'output') })
  }

  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Label</label>
          <input
            className="form-input"
            value={draft.label}
            onChange={e => set('label', e.target.value)}
            placeholder="Annual Cost Savings"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Output ID</label>
          <input
            className="form-input mono"
            value={draft.id}
            onChange={e => set('id', e.target.value)}
            placeholder="annual_savings"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Formula <span>(JS expression using input variable IDs)</span>
        </label>
        {inputIds.length > 0 && (
          <div className="var-chips">
            {inputIds.map(v => (
              <button key={v} className="var-chip" title="Click to insert" onClick={() => insertVar(v)}>
                {v}
              </button>
            ))}
          </div>
        )}
        <input
          className="form-input mono"
          style={{ marginTop: inputIds.length ? 8 : 0 }}
          value={draft.formula}
          onChange={e => set('formula', e.target.value)}
          placeholder="employees * 50000 * 0.7"
        />
        {missing.length > 0 && (
          <div className="formula-warning">
            ⚠ Unknown variable{missing.length > 1 ? 's' : ''}: {missing.join(', ')}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Format</label>
          <select
            className="form-select"
            value={draft.format}
            onChange={e => set('format', e.target.value)}
          >
            {FORMAT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
          <div className="toggle-row">
            <label className="toggle">
              <input
                type="checkbox"
                checked={draft.highlight}
                onChange={e => set('highlight', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: '.85rem', color: '#374151', fontWeight: 500 }}>
              Highlight this output
            </span>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={handleSave}>Save</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function OutputsStep({ config, setOutputs }) {
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const inputIds = config.inputs.map(i => i.id)

  function handleDelete(idx) {
    setOutputs(config.outputs.filter((_, i) => i !== idx))
    if (expandedIdx === idx) setExpandedIdx(null)
  }

  function handleSaveEdit(idx, updated) {
    setOutputs(config.outputs.map((o, i) => (i === idx ? updated : o)))
    setExpandedIdx(null)
  }

  function handleAdd(o) {
    setOutputs([...config.outputs, o])
    setAddingNew(false)
  }

  function moveUp(idx) {
    if (idx === 0) return
    const arr = [...config.outputs]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    setOutputs(arr)
  }

  function moveDown(idx) {
    if (idx === config.outputs.length - 1) return
    const arr = [...config.outputs]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    setOutputs(arr)
  }

  return (
    <div>
      <div className="step-header">
        <h2>Outputs &amp; Formulas</h2>
        <p>
          Define calculated results. Write plain JavaScript expressions using your input variable IDs.
          Click a variable chip to insert it into the formula field.
        </p>
      </div>

      {config.outputs.length === 0 && !addingNew && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          No outputs yet. Add one below.
        </div>
      )}

      <div className="item-list">
        {config.outputs.map((out, idx) => (
          <div key={out.id || String(idx)} className="item-card">
            <div className="item-card-head" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
              <div className="item-card-info">
                <div className="item-card-name">
                  {out.label || '(untitled)'}
                  {out.highlight && <span className="highlight-badge">HIGHLIGHT</span>}
                </div>
                <div className="item-card-meta">{out.formula || '—'}</div>
              </div>
              <div className="item-card-actions" onClick={e => e.stopPropagation()}>
                <button className="icon-btn" onClick={() => moveUp(idx)}>↑</button>
                <button className="icon-btn" onClick={() => moveDown(idx)}>↓</button>
                <button className="icon-btn danger" onClick={() => handleDelete(idx)}>✕</button>
              </div>
            </div>

            {expandedIdx === idx && (
              <div className="item-card-body">
                <OutputForm
                  output={out}
                  inputIds={inputIds}
                  onSave={updated => handleSaveEdit(idx, updated)}
                  onCancel={() => setExpandedIdx(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {addingNew ? (
        <div className="item-card">
          <div className="item-card-body">
            <OutputForm
              output={newOutput()}
              inputIds={inputIds}
              onSave={handleAdd}
              onCancel={() => setAddingNew(false)}
            />
          </div>
        </div>
      ) : (
        <button className="add-btn" onClick={() => { setAddingNew(true); setExpandedIdx(null) }}>
          + Add Output
        </button>
      )}
    </div>
  )
}
