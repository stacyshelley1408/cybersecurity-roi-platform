export default function InputField({ inp, value, onChange, primary }) {
  const isRange = inp.type === 'range'
  const numVal = Number(value) || 0

  function clamp(v) {
    let n = parseFloat(v)
    if (isNaN(n)) n = inp.default ?? 0
    if (inp.min != null) n = Math.max(Number(inp.min), n)
    if (inp.max != null) n = Math.min(Number(inp.max), n)
    return n
  }

  return (
    <div className="field-group">
      <label className="field-label">{inp.label}</label>

      {isRange ? (
        <div className="range-field">
          <input
            type="range"
            className="range-slider"
            min={inp.min ?? 0}
            max={inp.max ?? 100}
            step={inp.step ?? 1}
            value={numVal}
            style={{ '--primary': primary }}
            onChange={e => onChange(Number(e.target.value))}
          />
          <div className="range-rval-row">
            {inp.prefix && <span className="input-affix">{inp.prefix}</span>}
            <input
              type="number"
              className="number-input rval"
              min={inp.min ?? 0}
              max={inp.max ?? undefined}
              step={inp.step ?? 1}
              value={numVal}
              onChange={e => onChange(clamp(e.target.value))}
            />
            {inp.suffix && <span className="input-affix suffix">{inp.suffix}</span>}
          </div>
        </div>
      ) : (
        <div className="number-field">
          {inp.prefix && <span className="input-affix">{inp.prefix}</span>}
          <input
            type="number"
            className="number-input"
            min={inp.min ?? undefined}
            max={inp.max ?? undefined}
            step={inp.step ?? 1}
            value={numVal}
            onChange={e => onChange(clamp(e.target.value))}
          />
          {inp.suffix && <span className="input-affix suffix">{inp.suffix}</span>}
        </div>
      )}
    </div>
  )
}
