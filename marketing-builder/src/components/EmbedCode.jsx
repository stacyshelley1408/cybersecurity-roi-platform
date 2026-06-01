import { useState, useEffect, useRef } from 'react'
import { encodeConfig, decodeConfig } from '@core/encodeConfig'
import { slugify } from '@core/utils'

export default function EmbedCode({ config, loadConfig }) {
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const importTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(importTimerRef.current), [])

  const b64 = encodeConfig(config)
  const scriptTag = `<script\n  data-roi-calc\n  data-config="${b64}"\n  src="https://stacyshelley.com/roi-calculator-app/roi-widget.js">\n<\/script>`

  function handleImport() {
    setImportError('')
    setImportSuccess(false)
    try {
      const match = importText.match(/data-config="([^"]+)"/)
      if (!match) throw new Error('No data-config attribute found.')
      const parsed = decodeConfig(match[1])
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
          !Array.isArray(parsed.inputs) || !Array.isArray(parsed.outputs)) {
        throw new Error('Config could not be parsed.')
      }
      // Normalize missing ids so list keys stay stable
      const normalized = {
        ...parsed,
        inputs: parsed.inputs.map((inp, i) => ({ ...inp, id: inp.id || slugify(inp.label || '', `input_${i}`) })),
        outputs: parsed.outputs.map((out, i) => ({ ...out, id: out.id || slugify(out.label || '', `output_${i}`) })),
      }
      loadConfig(normalized)
      setImportText('')
      setImportSuccess(true)
      clearTimeout(importTimerRef.current)
      importTimerRef.current = setTimeout(() => setImportSuccess(false), 3000)
    } catch (e) {
      setImportError(e.message || 'Could not load that embed code.')
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(scriptTag).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shortB64 = b64.length > 60 ? b64.slice(0, 60) + '…' : b64

  return (
    <div className="embed-scroll">
    <div className="embed-panel">
      <h3>Embed Tag</h3>

      <div className="embed-note">
        Copy this tag and paste it anywhere on your page. The <code style={{ fontSize: '.72rem', background: '#dcfce7', padding: '1px 4px', borderRadius: 3 }}>src</code> points to a hosted copy of the widget file so you can test immediately — but for production, download <code style={{ fontSize: '.72rem', background: '#dcfce7', padding: '1px 4px', borderRadius: 3 }}>roi-widget.js</code> and host it yourself so your embed doesn't depend on this site.
      </div>

      <div className="embed-code-wrap">
        <pre>
          <span className="syn-tag">{'<script'}</span>
          {'\n  '}
          <span className="syn-attr">data-roi-calc</span>
          {'\n  '}
          <span className="syn-attr">data-config</span>
          {'='}
          <span className="syn-val">&quot;{shortB64}&quot;</span>
          {'\n  '}
          <span className="syn-attr">src</span>
          {'='}
          <span className="syn-val">&quot;https://stacyshelley.com/roi-calculator-app/roi-widget.js&quot;</span>
          <span className="syn-tag">{'>'}</span>
          {'\n'}
          <span className="syn-tag">{'</script>'}</span>
        </pre>
        <button
          className={`embed-copy-btn${copied ? ' copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <h3 style={{ marginTop: 20 }}>Config JSON</h3>
      <div className="embed-note">
        The widget reads your full configuration from the{' '}
        <code style={{ fontSize: '.72rem', background: '#dcfce7', padding: '1px 4px', borderRadius: 3 }}>
          data-config
        </code>{' '}
        attribute as a Base64-encoded JSON string. No server required.
      </div>

      <div className="embed-code-wrap">
        <pre style={{ maxHeight: 280, overflow: 'auto' }}>
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
      <h3 style={{ marginTop: 24 }}>Load Existing Calculator</h3>
      <div className="embed-note" style={{ marginBottom: 10 }}>
        Paste your existing embed tag below to reload its configuration into the builder.
      </div>
      <textarea
        className="form-input mono"
        rows={4}
        placeholder={'<script data-roi-calc data-config="..." src="..."></script>'}
        value={importText}
        onChange={e => { setImportText(e.target.value); setImportError(''); setImportSuccess(false) }}
        style={{ resize: 'vertical', marginBottom: 8 }}
      />
      {importError && (
        <div style={{ fontSize: '.72rem', color: '#ef4444', marginBottom: 8 }}>{importError}</div>
      )}
      {importSuccess && (
        <div style={{ fontSize: '.72rem', color: 'var(--accent)', marginBottom: 8 }}>Configuration loaded.</div>
      )}
      <button
        className="btn-primary"
        onClick={handleImport}
        disabled={!importText.trim()}
        style={{ width: '100%' }}
      >
        Load
      </button>
    </div>
    </div>
  )
}
