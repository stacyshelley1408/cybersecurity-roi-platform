import { useState, useEffect, useRef } from 'react'
import { encodeConfig } from '../encodeConfig'

let cachedScript = null

export default function LivePreview({ config }) {
  const [script, setScript] = useState(cachedScript)
  const timerRef = useRef(null)
  const [srcdoc, setSrcdoc] = useState('')
  const frameKeyRef = useRef(0)
  const [frameKey, setFrameKey] = useState(0)

  useEffect(() => {
    if (cachedScript) {
      setScript(cachedScript)
      return
    }
    fetch('/roi-widget.js')
      .then(r => r.text())
      .then(text => {
        cachedScript = text
        setScript(text)
      })
      .catch(() => setScript('// widget unavailable'))
  }, [])

  useEffect(() => {
    if (!script) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const b64 = encodeConfig(config)
      const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 16px; background: #f1f5f9; font-family: system-ui, sans-serif; }
</style>
<script>${script.replace(/<\/script>/gi, '<\\/script>')}<\/script>
</head>
<body>
<script data-roi-calc data-config="${b64}"><\/script>
</body>
</html>`
      setSrcdoc(doc)
      frameKeyRef.current += 1
      setFrameKey(frameKeyRef.current)
    }, 150)
    return () => clearTimeout(timerRef.current)
  }, [config, script])

  return (
    <div className="preview-wrap">
      <div className="preview-toolbar">
        <div className="preview-dot" />
        <div className="preview-dot" />
        <div className="preview-dot" />
        <div className="preview-url-bar">yoursite.com/landing-page</div>
      </div>
      <div className="preview-frame-wrap">
        {srcdoc ? (
          <iframe
            key={frameKey}
            srcDoc={srcdoc}
            title="Calculator Preview"
            sandbox="allow-scripts"
          />
        ) : (
          <div style={{ padding: '24px', color: '#94a3b8', fontSize: '.85rem' }}>
            Loading preview…
          </div>
        )}
      </div>
    </div>
  )
}
