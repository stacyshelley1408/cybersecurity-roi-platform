export default function StepNav({ steps, active, onChange }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-section-label">Builder Steps</div>
      {steps.map((s, i) => (
        <button
          key={s.id}
          className={`sidebar-item${active === s.id ? ' active' : ''}`}
          onClick={() => onChange(s.id)}
        >
          <span className="sidebar-item-num">{i + 1}</span>
          {s.label}
        </button>
      ))}
    </nav>
  )
}
