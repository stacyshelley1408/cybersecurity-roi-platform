export default function InfoStep({ config, update }) {
  return (
    <div>
      <div className="step-header">
        <h2>Template Info</h2>
        <p>Set the title and description shown at the top of your calculator.</p>
      </div>

      <div className="form-group">
        <label className="form-label">Calculator Title</label>
        <input
          className="form-input"
          value={config.title}
          onChange={e => update({ title: e.target.value })}
          placeholder="Security ROI Calculator"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Product Name <span>(used in output labels)</span></label>
        <input
          className="form-input"
          value={config.productName || ''}
          onChange={e => update({ productName: e.target.value })}
          placeholder="Our Product"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Description <span>(optional)</span>
        </label>
        <textarea
          className="form-input"
          rows={3}
          style={{ resize: 'vertical' }}
          value={config.description}
          onChange={e => update({ description: e.target.value })}
          placeholder="Discover how much your organization can save…"
        />
      </div>
    </div>
  )
}
