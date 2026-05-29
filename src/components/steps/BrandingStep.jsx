function ColorPicker({ label, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="color-input-wrap">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <input
          type="text"
          value={value}
          onChange={e => {
            if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value)
          }}
          maxLength={7}
        />
      </div>
    </div>
  )
}

const FONT_OPTIONS = [
  'Inter, system-ui, sans-serif',
  'system-ui, -apple-system, sans-serif',
  'Georgia, Times New Roman, serif',
  'Roboto, Arial, sans-serif',
  'Poppins, sans-serif',
  'DM Sans, sans-serif',
]

export default function BrandingStep({ config, updateBrand }) {
  const brand = config.brand

  return (
    <div>
      <div className="step-header">
        <h2>Branding</h2>
        <p>Customize colors, typography, and your logo to match your brand.</p>
      </div>

      <ColorPicker
        label="Primary Color"
        value={brand.primaryColor}
        onChange={v => updateBrand({ primaryColor: v })}
      />

      <ColorPicker
        label="Accent Color (highlighted outputs)"
        value={brand.accentColor}
        onChange={v => updateBrand({ accentColor: v })}
      />

      <div className="form-group">
        <label className="form-label">Font Family</label>
        <select
          className="form-select"
          value={brand.fontFamily}
          onChange={e => updateBrand({ fontFamily: e.target.value })}
        >
          {FONT_OPTIONS.map(f => (
            <option key={f} value={f}>{f.split(',')[0]}</option>
          ))}
        </select>
      </div>

      <div className="section-divider" />

      <div className="form-group">
        <label className="form-label">
          Logo URL <span>(optional — leave blank to hide)</span>
        </label>
        <input
          className="form-input"
          value={brand.logoUrl}
          onChange={e => updateBrand({ logoUrl: e.target.value })}
          placeholder="https://your-brand.com/logo.png"
        />
      </div>

      {brand.logoUrl && (
        <div style={{ marginTop: -8, marginBottom: 16 }}>
          <img
            src={brand.logoUrl}
            alt="Logo preview"
            style={{ maxHeight: 40, maxWidth: 200, display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
      )}
    </div>
  )
}
