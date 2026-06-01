import InputField from './InputField.jsx'

export default function ProspectPanel({
  prospect, visibleInputs, inputValues,
  onProspectChange, onInputChange, primary,
}) {
  return (
    <div className="panel prospect-panel">
      <h2 className="panel-heading">Prospect Profile</h2>

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

      {visibleInputs.length > 0 && (
        <>
          <div className="panel-divider" />
          <h3 className="panel-subheading">Prospect Data</h3>
          {visibleInputs.map(inp => (
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
