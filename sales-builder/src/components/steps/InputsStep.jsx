import { useState } from 'react'
import { slugify } from '@core/utils'

const ACCESS_OPTIONS = [
  { value: 'prospect', label: 'Prospect', description: 'Shown up front — filled in together with the prospect' },
  { value: 'se', label: 'SE', description: 'Shown in Assumptions accordion — SE adjusts before or during call' },
  { value: 'locked', label: 'Locked', description: 'Not shown — default value baked into the template' },
]

const ACCESS_COLORS = {
  prospect: '#1a8a80',
  se: '#7c3aed',
  locked: '#6b7280',
}

function newInput() {
  return {
    id: '',
    label: '',
    type: 'range',
    default: 100,
    min: 0,
    max: 1000,
    step: 1,
    prefix: '',
    suffix: '',
    sellerAccess: 'prospect',
  }
}

function InputForm({ input, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...input })

  function set(k, v) {
    setDraft(d => {
      const next = { ...d, [k]: v }
      if (k === 'label' && !input.id) next.id = slugify(v)
      return next
    })
  }

  function handleSave() {
    if (!draft.label.trim() || !draft.id.trim()) return
    onSave({ ...draft, id: slugify(draft.id) })
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
            placeholder="Number of Employees"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Variable ID <span>(used in formulas)</span></label>
          <input
            className="form-input mono"
            value={draft.id}
            onChange={e => set('id', e.target.value)}
            placeholder="employees"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Display As</label>
          <select className="form-select" value={draft.type} onChange={e => set('type', e.target.value)}>
            <option value="range">Slider</option>
            <option value="number">Number Input</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Default Value</label>
          <input className="form-input" type="number" value={draft.default} onChange={e => set('default', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">Min</label>
          <input className="form-input" type="number" value={draft.min} onChange={e => set('min', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="form-group">
          <label className="form-label">Max</label>
          <input className="form-input" type="number" value={draft.max} onChange={e => set('max', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="form-group">
          <label className="form-label">Step</label>
          <input className="form-input" type="number" value={draft.step} onChange={e => set('step', parseFloat(e.target.value) || 1)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Prefix <span>(e.g. $)</span></label>
          <input className="form-input" value={draft.prefix} maxLength={8} onChange={e => set('prefix', e.target.value)} placeholder="$" />
        </div>
        <div className="form-group">
          <label className="form-label">Suffix <span>(e.g. %)</span></label>
          <input className="form-input" value={draft.suffix} maxLength={8} onChange={e => set('suffix', e.target.value)} />
        </div>
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={handleSave}>Save</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function InputsStep({ config, setInputs }) {
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [addingNew, setAddingNew] = useState(false)

  function handleDelete(idx) {
    setInputs(config.inputs.filter((_, i) => i !== idx))
    if (expandedIdx === idx) setExpandedIdx(null)
  }

  function handleSaveEdit(idx, updated) {
    setInputs(config.inputs.map((inp, i) => (i === idx ? updated : inp)))
    setExpandedIdx(null)
  }

  function handleAdd(inp) {
    setInputs([...config.inputs, inp])
    setAddingNew(false)
  }

  function moveUp(idx) {
    if (idx === 0) return
    const arr = [...config.inputs]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    setInputs(arr)
  }

  function moveDown(idx) {
    if (idx === config.inputs.length - 1) return
    const arr = [...config.inputs]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    setInputs(arr)
  }

  function cycleAccess(idx) {
    const order = ['prospect', 'se', 'locked']
    const inp = config.inputs[idx]
    const current = inp.sellerAccess || 'prospect'
    const next = order[(order.indexOf(current) + 1) % order.length]
    setInputs(config.inputs.map((inp, i) => i === idx ? { ...inp, sellerAccess: next } : inp))
  }

  const prospectCount = config.inputs.filter(i => (i.sellerAccess || 'prospect') === 'prospect').length
  const seCount = config.inputs.filter(i => i.sellerAccess === 'se').length
  const lockedCount = config.inputs.filter(i => i.sellerAccess === 'locked').length

  return (
    <div>
      <div className="step-header">
        <h2>Input Fields</h2>
        <p>
          Set how each input is handled in the seller session. Click the access badge to cycle through the three modes.
        </p>
      </div>

      <div className="access-legend">
        {ACCESS_OPTIONS.map(opt => (
          <div key={opt.value} className="access-legend-item">
            <span className="access-badge" style={{ background: ACCESS_COLORS[opt.value] }}>{opt.label}</span>
            <span className="access-legend-desc">{opt.description}</span>
          </div>
        ))}
      </div>

      <div className="access-summary">
        <span style={{ color: ACCESS_COLORS.prospect }}>{prospectCount} Prospect</span>
        <span style={{ color: ACCESS_COLORS.se }}>{seCount} SE</span>
        <span style={{ color: ACCESS_COLORS.locked }}>{lockedCount} Locked</span>
      </div>

      {config.inputs.length === 0 && !addingNew && (
        <div className="empty-state">
          <div className="empty-state-icon">🔢</div>
          No inputs yet. Add one below.
        </div>
      )}

      <div className="item-list">
        {config.inputs.map((inp, idx) => {
          const access = inp.sellerAccess || 'prospect'
          return (
            <div key={inp.id || String(idx)} className="item-card">
              <div className="item-card-head" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                <div className="item-card-info">
                  <div className="item-card-name">{inp.label || '(untitled)'}</div>
                  <div className="item-card-meta">{inp.id} · {inp.type} · default: {inp.default}</div>
                </div>
                <div className="item-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="access-btn"
                    style={{ background: ACCESS_COLORS[access] }}
                    title="Click to cycle: Prospect → SE → Locked"
                    onClick={() => cycleAccess(idx)}
                  >
                    {access.charAt(0).toUpperCase() + access.slice(1)}
                  </button>
                  <button className="icon-btn" title="Move up" onClick={() => moveUp(idx)}>↑</button>
                  <button className="icon-btn" title="Move down" onClick={() => moveDown(idx)}>↓</button>
                  <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(idx)}>✕</button>
                </div>
              </div>

              {expandedIdx === idx && (
                <div className="item-card-body">
                  <InputForm
                    input={inp}
                    onSave={updated => handleSaveEdit(idx, updated)}
                    onCancel={() => setExpandedIdx(null)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {addingNew ? (
        <div className="item-card">
          <div className="item-card-body">
            <InputForm input={newInput()} onSave={handleAdd} onCancel={() => setAddingNew(false)} />
          </div>
        </div>
      ) : (
        <button className="add-btn" onClick={() => { setAddingNew(true); setExpandedIdx(null) }}>
          + Add Input Field
        </button>
      )}
    </div>
  )
}
