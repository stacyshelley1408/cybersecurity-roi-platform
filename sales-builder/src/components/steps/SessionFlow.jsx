import { useState } from 'react'
import { slugify } from '@core/utils'

const ACCESS_COLORS = {
  prospect: '#1a8a80',
  se: '#7c3aed',
  locked: '#6b7280',
}

const ACCESS_CYCLE = ['prospect', 'se', 'locked']

function newInput() {
  return { id: '', label: '', type: 'range', default: 100, min: 0, max: 1000, step: 1, prefix: '', suffix: '', sellerAccess: 'prospect' }
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
          <input className="form-input" value={draft.label} onChange={e => set('label', e.target.value)} placeholder="Number of Employees" />
        </div>
        <div className="form-group">
          <label className="form-label">Variable ID <span>(used in formulas)</span></label>
          <input className="form-input mono" value={draft.id} onChange={e => set('id', e.target.value)} placeholder="employees" />
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
          <input className="form-input" value={draft.prefix} maxLength={8} onChange={e => set('prefix', e.target.value)} />
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

export default function SessionFlow({ config, setInputGroups }) {
  const [expandedInput, setExpandedInput] = useState(null) // "gIdx-iIdx"
  const [addingToGroup, setAddingToGroup] = useState(null)
  const groups = config.inputGroups || []

  // ── group operations ──
  function updateGroupLabel(gIdx, label) {
    setInputGroups(groups.map((g, i) => i === gIdx ? { ...g, label } : g))
  }

  function deleteGroup(gIdx) {
    setInputGroups(groups.filter((_, i) => i !== gIdx))
    setExpandedInput(null)
  }

  function moveGroupUp(gIdx) {
    if (gIdx === 0) return
    const arr = [...groups]
    ;[arr[gIdx - 1], arr[gIdx]] = [arr[gIdx], arr[gIdx - 1]]
    setInputGroups(arr)
  }

  function moveGroupDown(gIdx) {
    if (gIdx === groups.length - 1) return
    const arr = [...groups]
    ;[arr[gIdx], arr[gIdx + 1]] = [arr[gIdx + 1], arr[gIdx]]
    setInputGroups(arr)
  }

  function addGroup() {
    setInputGroups([...groups, { id: `group_${Date.now()}`, label: 'New Group', inputs: [] }])
  }

  // ── input operations ──
  function cycleAccess(gIdx, iIdx) {
    const inp = groups[gIdx].inputs[iIdx]
    const current = inp.sellerAccess || 'prospect'
    const next = ACCESS_CYCLE[(ACCESS_CYCLE.indexOf(current) + 1) % ACCESS_CYCLE.length]
    setInputGroups(groups.map((g, gi) => gi !== gIdx ? g : {
      ...g,
      inputs: g.inputs.map((inp, ii) => ii !== iIdx ? inp : { ...inp, sellerAccess: next }),
    }))
  }

  function deleteInput(gIdx, iIdx) {
    setInputGroups(groups.map((g, gi) => gi !== gIdx ? g : {
      ...g, inputs: g.inputs.filter((_, ii) => ii !== iIdx),
    }))
    setExpandedInput(null)
  }

  function moveInputUp(gIdx, iIdx) {
    if (iIdx === 0) return
    setInputGroups(groups.map((g, gi) => {
      if (gi !== gIdx) return g
      const arr = [...g.inputs]
      ;[arr[iIdx - 1], arr[iIdx]] = [arr[iIdx], arr[iIdx - 1]]
      return { ...g, inputs: arr }
    }))
  }

  function moveInputDown(gIdx, iIdx) {
    if (iIdx === groups[gIdx].inputs.length - 1) return
    setInputGroups(groups.map((g, gi) => {
      if (gi !== gIdx) return g
      const arr = [...g.inputs]
      ;[arr[iIdx], arr[iIdx + 1]] = [arr[iIdx + 1], arr[iIdx]]
      return { ...g, inputs: arr }
    }))
  }

  function moveInputToGroup(fromGIdx, iIdx, toGIdx) {
    const inp = groups[fromGIdx].inputs[iIdx]
    setInputGroups(groups.map((g, gi) => {
      if (gi === fromGIdx) return { ...g, inputs: g.inputs.filter((_, ii) => ii !== iIdx) }
      if (gi === toGIdx)   return { ...g, inputs: [...g.inputs, inp] }
      return g
    }))
  }

  function saveInput(gIdx, iIdx, updated) {
    setInputGroups(groups.map((g, gi) => gi !== gIdx ? g : {
      ...g, inputs: g.inputs.map((inp, ii) => ii !== iIdx ? inp : updated),
    }))
    setExpandedInput(null)
  }

  function addInput(gIdx, inp) {
    setInputGroups(groups.map((g, gi) => gi !== gIdx ? g : {
      ...g, inputs: [...g.inputs, inp],
    }))
    setAddingToGroup(null)
  }

  const totalInputs = groups.reduce((n, g) => n + g.inputs.length, 0)
  const prospectCount = groups.reduce((n, g) => n + g.inputs.filter(i => (i.sellerAccess || 'prospect') === 'prospect').length, 0)
  const seCount = groups.reduce((n, g) => n + g.inputs.filter(i => i.sellerAccess === 'se').length, 0)
  const lockedCount = groups.reduce((n, g) => n + g.inputs.filter(i => i.sellerAccess === 'locked').length, 0)

  return (
    <div>
      <div className="step-header">
        <h2>Session Flow</h2>
        <p>
          Organize inputs into conversation groups. Click an access badge to cycle:
          <span style={{ color: ACCESS_COLORS.prospect, fontWeight: 500 }}> Prospect</span> (fills in with you) ·
          <span style={{ color: ACCESS_COLORS.se, fontWeight: 500 }}> SE</span> (adjusts assumptions) ·
          <span style={{ color: ACCESS_COLORS.locked, fontWeight: 500 }}> Locked</span> (baked in, not shown).
        </p>
      </div>

      <div className="access-summary" style={{ marginBottom: 20 }}>
        <span>{totalInputs} total inputs</span>
        <span style={{ color: ACCESS_COLORS.prospect }}>{prospectCount} Prospect</span>
        <span style={{ color: ACCESS_COLORS.se }}>{seCount} SE</span>
        <span style={{ color: ACCESS_COLORS.locked }}>{lockedCount} Locked</span>
      </div>

      {groups.map((group, gIdx) => (
        <div key={group.id || gIdx} className="input-group-card">
          <div className="input-group-header">
            <input
              className="group-name-input"
              value={group.label}
              onChange={e => updateGroupLabel(gIdx, e.target.value)}
              placeholder="Group Name"
            />
            <span className="group-count">{group.inputs.length}</span>
            <div className="group-actions">
              <button className="icon-btn" title="Move up" onClick={() => moveGroupUp(gIdx)}>↑</button>
              <button className="icon-btn" title="Move down" onClick={() => moveGroupDown(gIdx)}>↓</button>
              <button className="icon-btn danger" title="Delete group" onClick={() => deleteGroup(gIdx)}>✕</button>
            </div>
          </div>

          <div className="group-inputs">
            {group.inputs.length === 0 && addingToGroup !== gIdx && (
              <div className="group-empty">No inputs yet.</div>
            )}

            {group.inputs.map((inp, iIdx) => {
              const key = `${gIdx}-${iIdx}`
              const access = inp.sellerAccess || 'prospect'
              const isExpanded = expandedInput === key
              return (
                <div key={inp.id || iIdx} className="item-card">
                  <div className="item-card-head" onClick={() => setExpandedInput(isExpanded ? null : key)}>
                    <div className="item-card-info">
                      <div className="item-card-name">{inp.label || '(untitled)'}</div>
                      <div className="item-card-meta">{inp.id} · {inp.type} · default: {inp.default}</div>
                    </div>
                    <div className="item-card-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="access-btn"
                        style={{ background: ACCESS_COLORS[access] }}
                        title="Click to cycle: Prospect → SE → Locked"
                        onClick={() => cycleAccess(gIdx, iIdx)}
                      >
                        {access.charAt(0).toUpperCase() + access.slice(1)}
                      </button>
                      {groups.length > 1 && (
                        <select
                          className="move-to-select"
                          value=""
                          title="Move to group"
                          onChange={e => { if (e.target.value !== '') moveInputToGroup(gIdx, iIdx, parseInt(e.target.value)) }}
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="">Move to…</option>
                          {groups.map((g, gi) => gi !== gIdx && (
                            <option key={gi} value={gi}>{g.label}</option>
                          ))}
                        </select>
                      )}
                      <button className="icon-btn" title="Move up" onClick={() => moveInputUp(gIdx, iIdx)}>↑</button>
                      <button className="icon-btn" title="Move down" onClick={() => moveInputDown(gIdx, iIdx)}>↓</button>
                      <button className="icon-btn danger" title="Delete" onClick={() => deleteInput(gIdx, iIdx)}>✕</button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="item-card-body">
                      <InputForm
                        input={inp}
                        onSave={updated => saveInput(gIdx, iIdx, updated)}
                        onCancel={() => setExpandedInput(null)}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {addingToGroup === gIdx ? (
              <div className="item-card">
                <div className="item-card-body">
                  <InputForm input={newInput()} onSave={inp => addInput(gIdx, inp)} onCancel={() => setAddingToGroup(null)} />
                </div>
              </div>
            ) : (
              <button className="add-input-in-group-btn" onClick={() => { setAddingToGroup(gIdx); setExpandedInput(null) }}>
                + Add Input
              </button>
            )}
          </div>
        </div>
      ))}

      <button className="add-btn" style={{ marginTop: 8 }} onClick={addGroup}>
        + Add Group
      </button>
    </div>
  )
}
