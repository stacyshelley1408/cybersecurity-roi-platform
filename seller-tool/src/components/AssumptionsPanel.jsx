import InputField from './InputField.jsx'

export default function AssumptionsPanel({ hiddenInputs, inputValues, onInputChange, open, onToggle, primary }) {
  if (!hiddenInputs.length) return null

  return (
    <div className="panel assumptions-panel">
      <button className="assumptions-toggle" onClick={onToggle} style={{ '--primary': primary }}>
        <span className="assumptions-toggle-label">
          Model Assumptions
          <span className="assumptions-count">{hiddenInputs.length}</span>
        </span>
        <span className="assumptions-arrow">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <>
          <p className="assumptions-hint">
            Industry averages pre-set by your marketing team. Adjust to match this prospect.
          </p>
          <div className="assumptions-fields">
            {hiddenInputs.map(inp => (
              <InputField
                key={inp.id}
                inp={inp}
                value={inputValues[inp.id]}
                onChange={val => onInputChange(inp.id, val)}
                primary={primary}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
