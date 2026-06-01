import InputField from './InputField.jsx'

function ProfileFields({ prospect, onProspectChange }) {
  return (
    <div className="step-fields">
      <div className="field-group">
        <label className="field-label">Company Name</label>
        <input
          className="text-input"
          type="text"
          placeholder="Acme Corp"
          value={prospect.companyName || ''}
          onChange={e => onProspectChange({ companyName: e.target.value })}
        />
      </div>
      <div className="field-row">
        <div className="field-group">
          <label className="field-label">Primary Contact</label>
          <input
            className="text-input"
            type="text"
            placeholder="Jane Smith"
            value={prospect.contactName || ''}
            onChange={e => onProspectChange({ contactName: e.target.value })}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Your Name</label>
          <input
            className="text-input"
            type="text"
            placeholder="Your name"
            value={prospect.sellerName || ''}
            onChange={e => onProspectChange({ sellerName: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function GroupFields({ group, inputValues, onInputChange, primary }) {
  const prospectInputs = group.inputs.filter(i => (i.sellerAccess || 'prospect') === 'prospect')
  const seInputs = group.inputs.filter(i => i.sellerAccess === 'se')

  return (
    <div className="step-fields">
      {prospectInputs.map(inp => (
        <InputField
          key={inp.id}
          inp={inp}
          value={inputValues[inp.id]}
          onChange={val => onInputChange(inp.id, val)}
          primary={primary}
        />
      ))}

      {seInputs.length > 0 && (
        <>
          <div className="step-assumptions-divider">
            <span>Team Assumptions</span>
          </div>
          {seInputs.map(inp => (
            <InputField
              key={inp.id}
              inp={inp}
              value={inputValues[inp.id]}
              onChange={val => onInputChange(inp.id, val)}
              primary={primary}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default function StepPanel({
  steps, activeStep, onStepChange,
  prospect, inputValues, onProspectChange, onInputChange, primary,
}) {
  const step = steps[activeStep]
  const isFirst = activeStep === 0
  const isLast = activeStep === steps.length - 1
  const progress = ((activeStep + 1) / steps.length) * 100

  return (
    <div className="step-panel">
      <div className="step-panel-header">
        <div className="step-panel-meta">
          <span className="step-panel-counter">{activeStep + 1} / {steps.length}</span>
          <span className="step-panel-label">{step.isProfile ? 'Prospect Profile' : step.label}</span>
        </div>
        <div className="step-progress-track">
          <div className="step-progress-fill" style={{ width: `${progress}%`, background: primary }} />
        </div>
        <div className="step-dots">
          {steps.map((s, i) => (
            <button
              key={i}
              className={`step-dot${i === activeStep ? ' active' : ''}${i < activeStep ? ' done' : ''}`}
              style={i === activeStep ? { background: primary, borderColor: primary } : i < activeStep ? { background: primary, borderColor: primary, opacity: 0.4 } : {}}
              onClick={() => onStepChange(i)}
              title={s.isProfile ? 'Prospect Profile' : s.label}
            />
          ))}
        </div>
      </div>

      <div className="step-panel-content">
        {step.isProfile ? (
          <ProfileFields prospect={prospect} onProspectChange={onProspectChange} />
        ) : (
          <GroupFields
            group={step}
            inputValues={inputValues}
            onInputChange={onInputChange}
            primary={primary}
          />
        )}
      </div>

      <div className="step-panel-footer">
        <button
          className="step-nav-btn step-nav-prev"
          onClick={() => onStepChange(activeStep - 1)}
          disabled={isFirst}
        >
          ← Previous
        </button>
        {isLast ? (
          <span className="step-nav-done">All steps complete</span>
        ) : (
          <button
            className="step-nav-btn step-nav-next"
            style={{ background: primary }}
            onClick={() => onStepChange(activeStep + 1)}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
