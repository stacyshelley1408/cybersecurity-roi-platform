export default function CtaStep({ config, updateCta }) {
  const cta = config.cta

  return (
    <div>
      <div className="step-header">
        <h2>Call to Action</h2>
        <p>
          Add a button at the bottom of the calculator to drive conversions. Leave the text blank to
          hide the button.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Button Text <span>(leave blank to hide)</span>
        </label>
        <input
          className="form-input"
          value={cta.text}
          onChange={e => updateCta({ text: e.target.value })}
          placeholder="Get Your Free Security Assessment"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Button URL</label>
        <input
          className="form-input"
          type="url"
          value={cta.url}
          onChange={e => updateCta({ url: e.target.value })}
          placeholder="https://yoursite.com/demo"
        />
      </div>

      <div
        style={{
          marginTop: 24,
          padding: '16px 20px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 9,
          fontSize: '.85rem',
          color: '#64748b',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: '#374151' }}>Pro tip:</strong> The button opens your URL in a new
        tab. Use a UTM-tagged link to track calculator conversions in your analytics platform.
      </div>
    </div>
  )
}
