import InputField from './InputField.jsx'

export default function AssumptionsPanel({ hiddenInputs, inputGroups, inputValues, onInputChange, open, onToggle, primary }) {
  const hasAssumptions = inputGroups
    ? inputGroups.some(g => g.inputs.some(i => i.sellerAccess === 'se'))
    : hiddenInputs.length > 0

  if (!hasAssumptions) return null

  const totalSe = inputGroups
    ? inputGroups.reduce((n, g) => n + g.inputs.filter(i => i.sellerAccess === 'se').length, 0)
    : hiddenInputs.length

  return (
    <div className="panel assumptions-panel">
      <button className="assumptions-toggle" onClick={onToggle} style={{ '--primary': primary }}>
        <span className="assumptions-toggle-label">
          Model Assumptions
          <span className="assumptions-count">{totalSe}</span>
        </span>
        <span className="assumptions-arrow">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <>
          <p className="assumptions-hint">
            Industry averages pre-set by your team. Adjust to match this prospect.
          </p>
          <div className="assumptions-fields">
            {inputGroups ? (
              // Grouped rendering — show group headers for groups with SE inputs
              inputGroups.map(group => {
                const seInputs = group.inputs.filter(i => i.sellerAccess === 'se')
                if (seInputs.length === 0) return null
                return (
                  <div key={group.id}>
                    <div className="assumptions-group-heading">{group.label}</div>
                    {seInputs.map(inp => (
                      <InputField
                        key={inp.id}
                        inp={inp}
                        value={inputValues[inp.id]}
                        onChange={val => onInputChange(inp.id, val)}
                        primary={primary}
                      />
                    ))}
                  </div>
                )
              })
            ) : (
              hiddenInputs.map(inp => (
                <InputField
                  key={inp.id}
                  inp={inp}
                  value={inputValues[inp.id]}
                  onChange={val => onInputChange(inp.id, val)}
                  primary={primary}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
