export default function StepNav({ steps, active, onChange }) {
  const hasSections = steps.some(s => s.section)

  return (
    <nav className="sidebar">
      {!hasSections && <div className="sidebar-section-label">Builder Steps</div>}
      {steps.map((s, i) => (
        <div key={s.id}>
          {hasSections && s.section && (
            <div className="sidebar-section-label" style={{ marginTop: i > 0 ? 12 : 0 }}>{s.section}</div>
          )}
          <button
            className={`sidebar-item${active === s.id ? ' active' : ''}`}
            onClick={() => onChange(s.id)}
          >
            <span className="sidebar-item-num">{i + 1}</span>
            {s.label}
          </button>
        </div>
      ))}
    </nav>
  )
}
