export default function LeaveBehind({ config, update, sessionUrl }) {
  const lb = config.leaveBehind || {}
  const showInputs = lb.showInputs !== false

  function setLB(partial) {
    update({ leaveBehind: { ...lb, ...partial } })
  }

  return (
    <div>
      <div className="step-header">
        <h2>Leave-Behind</h2>
        <p>
          Configure the document delivered after the session.
          It's personalized with the prospect's data and exports as PDF or .pptx.
        </p>
      </div>

      <div className="lb-section">
        <h3 className="lb-section-label">Intro Line</h3>
        <p className="lb-section-desc">
          Opening sentence shown between the header and output metrics.
          Use <code>{'{productName}'}</code> and <code>{'{company}'}</code> as placeholders.
        </p>
        <input
          className="form-input"
          value={lb.introLine || ''}
          onChange={e => setLB({ introLine: e.target.value })}
          placeholder="Based on your profile, here's what {productName} can do for your organization."
        />
      </div>

      <div className="lb-section">
        <h3 className="lb-section-label">Next Steps</h3>
        <p className="lb-section-desc">Shown at the bottom of the document, above the seller's contact info.</p>
        <textarea
          className="form-input"
          rows={3}
          style={{ resize: 'vertical' }}
          value={lb.nextSteps || ''}
          onChange={e => setLB({ nextSteps: e.target.value })}
          placeholder="Schedule a technical deep-dive with our solutions team to walk through implementation and answer your questions."
        />
      </div>

      <div className="lb-section">
        <h3 className="lb-section-label">Content</h3>
        <label className="lb-toggle-row">
          <div className="toggle">
            <input
              type="checkbox"
              checked={showInputs}
              onChange={e => setLB({ showInputs: e.target.checked })}
            />
            <span className="toggle-slider" />
          </div>
          <div>
            <div className="lb-toggle-label">Show model inputs table</div>
            <div className="lb-toggle-desc">Displays the prospect's entered values below the output metrics.</div>
          </div>
        </label>
      </div>

      <div className="lb-section">
        <h3 className="lb-section-label">Seller Contact Info</h3>
        <p className="lb-section-desc">
          Name, email, and phone are entered by the seller in the first step of the session.
          They appear in the leave-behind footer.
        </p>
      </div>

      <div className="lb-section">
        <h3 className="lb-section-label">Preview</h3>
        <p className="lb-section-desc">
          Open the session, complete all steps, then click "Build Leave-Behind" to preview the document.
        </p>
        <a
          className="preview-session-btn"
          href={sessionUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', textDecoration: 'none' }}
        >
          Open Session ↗
        </a>
      </div>
    </div>
  )
}
