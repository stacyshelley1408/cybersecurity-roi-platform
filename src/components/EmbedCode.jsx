import { useState } from 'react'
import { encodeConfig } from '../encodeConfig'

export default function EmbedCode({ config }) {
  const [copied, setCopied] = useState(false)

  const b64 = encodeConfig(config)
  const scriptTag = `<script\n  data-roi-calc\n  data-config="${b64}"\n  src="https://YOUR-DOMAIN/roi-widget.js">\n<\/script>`

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
        Copy this tag and paste it anywhere on your page where you want the calculator to appear. Host{' '}
        <code style={{ fontSize: '.72rem', background: '#dcfce7', padding: '1px 4px', borderRadius: 3 }}>
          roi-widget.js
        </code>{' '}
        on your CDN or server and replace <strong>YOUR-DOMAIN</strong>.
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
          <span className="syn-val">&quot;https://YOUR-DOMAIN/roi-widget.js&quot;</span>
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
    </div>
    </div>
  )
}
