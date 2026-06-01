import { useState } from 'react'
import { decodeConfig } from '@core/encodeConfig'
import { slugify } from '@core/utils'

export default function SessionSetup({ config, sessionUrl, setInputs, setOutputs, update, updateBrand }) {
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(sessionUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleImport() {
    setImportError('')
    setImportSuccess(false)
    try {
      const url = importText.trim()
      const hashIdx = url.indexOf('#config/')
      if (hashIdx === -1) throw new Error('No config found. Paste a full seller session URL.')
      const b64 = url.slice(hashIdx + 8)
      const parsed = decodeConfig(b64)
      if (!parsed || !Array.isArray(parsed.inputs) || !Array.isArray(parsed.outputs)) {
        throw new Error('Config could not be parsed.')
      }
      const normalized = {
        ...parsed,
        inputs: parsed.inputs.map((inp, i) => ({
          ...inp,
          id: inp.id || slugify(inp.label || '', `input_${i}`),
          sellerAccess: inp.sellerAccess || (inp.visible === false ? 'se' : 'prospect'),
        })),
        outputs: parsed.outputs.map((out, i) => ({
          ...out,
          id: out.id || slugify(out.label || '', `output_${i}`),
        })),
      }
      update({ title: normalized.title, productName: normalized.productName, description: normalized.description, cta: normalized.cta })
      updateBrand(normalized.brand || {})
      setInputs(normalized.inputs)
      setOutputs(normalized.outputs)
      setImportText('')
      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 3000)
    } catch (e) {
      setImportError(e.message || 'Could not load that URL.')
    }
  }

  const prospectInputs = config.inputs.filter(i => (i.sellerAccess || 'prospect') === 'prospect')
  const seInputs = config.inputs.filter(i => i.sellerAccess === 'se')
  const lockedInputs = config.inputs.filter(i => i.sellerAccess === 'locked')

  return (
    <div>
      <div className="step-header">
        <h2>Session Setup</h2>
        <p>
          Your template is ready. Copy the session URL and share it with your sales team. When they open it, they&apos;ll land in the live session view to work through with the prospect.
        </p>
      </div>

      <div className="session-summary">
        <div className="session-summary-row">
          <span className="session-summary-label">Prospect fills in</span>
          <span className="session-summary-value">{prospectInputs.length} inputs — {prospectInputs.map(i => i.label).join(', ') || 'none'}</span>
        </div>
        <div className="session-summary-row">
          <span className="session-summary-label">SE adjusts</span>
          <span className="session-summary-value">{seInputs.length} inputs in Assumptions accordion</span>
        </div>
        <div className="session-summary-row">
          <span className="session-summary-label">Locked</span>
          <span className="session-summary-value">{lockedInputs.length} inputs baked in (not shown)</span>
        </div>
        <div className="session-summary-row">
          <span className="session-summary-label">Outputs</span>
          <span className="session-summary-value">{config.outputs.length} calculated results</span>
        </div>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 8, fontSize: '1rem', fontWeight: 600 }}>Session URL</h3>
      <div className="session-url-note">
        Send this URL to your sales team. Opening it launches the live session with your template pre-loaded. The full config is encoded in the URL — no server required.
      </div>

      <div className="session-url-wrap">
        <div className="session-url-preview">{sessionUrl.length > 80 ? sessionUrl.slice(0, 80) + '…' : sessionUrl}</div>
        <button
          className={`embed-copy-btn${copied ? ' copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy URL'}
        </button>
      </div>

      <h3 style={{ marginTop: 28, marginBottom: 8, fontSize: '1rem', fontWeight: 600 }}>Load Existing Template</h3>
      <div className="session-url-note" style={{ marginBottom: 10 }}>
        Paste a session URL below to reload its configuration into the builder.
      </div>
      <textarea
        className="form-input mono"
        rows={3}
        placeholder="https://stacyshelley.com/seller-tool/#config/..."
        value={importText}
        onChange={e => { setImportText(e.target.value); setImportError('') }}
        style={{ resize: 'vertical', marginBottom: 8 }}
      />
      {importError && <div style={{ fontSize: '.72rem', color: '#ef4444', marginBottom: 8 }}>{importError}</div>}
      {importSuccess && <div style={{ fontSize: '.72rem', color: 'var(--accent)', marginBottom: 8 }}>Configuration loaded.</div>}
      <button
        className="btn-primary"
        onClick={handleImport}
        disabled={!importText.trim()}
        style={{ width: '100%' }}
      >
        Load
      </button>
    </div>
  )
}
